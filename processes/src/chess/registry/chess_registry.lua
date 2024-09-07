--[[
    usage:
    local chess_registry = require('processes.src.chess.chess_registry')
    chess_registry.init()
    This will mount the chess registry handlers to the AOS process
]]

local json = require("json")
local chess_registry = {
	version = "0.0.1",
}
-- setting name space of "Chess-Registry" prevents conflicts with other processes if they are composed
local actions = {
	-- read
	GetGames = "Chess-Registry.Get-Games",
	GetPlayers = "Chess-Registry.Get-Players",

	-- write
	JoinRegistry = "Chess-Registry.Join-Registry",
	EditProfile = "Chess-Registry.Edit-Profile",
	CreateGame = "Chess-Registry.Create-Game",
	Spawned = "Spawned", -- reserved name for aos spawned process that the spawned process calls back when it is ready
	JoinGame = "Chess-Registry.Join-Game",
	GameResult = "Chess-Registry.Game-Result",
}
chess_registry.ActionMap = actions
chess_registry.init = function()
	local constants = require("processes.src.common.constants")
	local utils = require("processes.src.common.utils")
	local createActionHandler = utils.createActionHandler

	LiveGames = {
		["game id"] = {
			startTimestamp = 0,
			["players"] = {
				["white"] = "player id",
				["black"] = "player id",
			},
		},
	}
	HistoricalGames = {
		["game id"] = {
			startTimestamp = 0,
			endTimestamp = 0,
			resolution = "surrender | checkmate | stalemate",
			["players"] = {
				["white"] = {
					id = "player id",
					score = 0,
				},
				["black"] = {
					id = "player id",
					score = 0,
				},
			},
		},
	}
	Players = {
		["player id"] = {
			stats = {
				elo = constants.DEFAULT_ELO,
				wins = 0,
				losses = 0,
				stalemates = 0,
				surrenders = 0,
			},
			gameHistory = { -- Linked list of game ids, allows for easy retrieval by player address
				["game id"] = HistoricalGames["game id"] or LiveGames["game id"],
			},
		},
	}

	createActionHandler(actions.GetGames, function(msg)
		print("GetGames")
		local gameId = msg["Game-Id"]
		local playerId = msg["Player-Id"]
		local typeFilter = msg.Type

		if gameId then
			-- Error if requested game not found
			assert(LiveGames[gameId] or HistoricalGames[gameId], "Requested game not found.")
			-- Send game by gameId if provided
				ao.send({
					Target = msg.From,
					Action = "ChessMessage",
					Data = json.encode(LiveGames[gameId] or HistoricalGames[gameId]),
				})
		else
			-- Fetch games by playerId if no gameId is provided
			if playerId then
				-- Error if Player not found
				assert(Players[playerId], "Requested player not found.")
				if Players[playerId] then
					local playerGames = {
						Live = {},
						Historical = {},
					}

					-- Iterate over the player's gameHistory
					for historyGameId, gameData in pairs(Players[playerId].gameHistory) do
						-- Check if the game is live or historical based on the endTimestamp
						if not gameData.endTimestamp then
							table.insert(playerGames.Live, gameData) -- Live game
						else
							table.insert(playerGames.Historical, gameData) -- Historical game
						end
					end

					-- Apply typeFilter for Live or Historical games
					local filteredGames = {}
					if typeFilter ~= "Historical" then
						filteredGames.Live = playerGames.Live
					end
					if typeFilter ~= "Live" then
						filteredGames.Historical = playerGames.Historical
					end
					-- Send filtered game data
					ao.send({
						Target = msg.From,
						Action = "ChessMessage",
						Data = json.encode(filteredGames),
					})
				end
			else
				-- Return all games if no gameId or playerId is provided
				local allGames = {}
				if typeFilter ~= "Historical" then
					allGames.LiveGames = LiveGames
				end
				if typeFilter ~= "Live" then
					allGames.HistoricalGames = HistoricalGames
				end
				ao.send({
					Target = msg.From,
					Action = "ChessMessage",
					Data = json.encode(allGames),
				})
			end
		end
	end)

	createActionHandler(actions.GetPlayers, function(msg)
		print("GetPlayers")
	end)
	createActionHandler(actions.JoinRegistry, function(msg)
		print("JoinRegistry")
	end)
	createActionHandler(actions.EditProfile, function(msg)
		print("EditProfile")
	end)
	createActionHandler(actions.CreateGame, function(msg)
		-- ensure to include forwarded tag metadata to identify the player on the Spawned handler
		-- (forwarded tags are X- prefixed)
		print("CreateGame")
	end)
	createActionHandler(actions.Spawned, function(msg)
		-- add game ID and player ID to the LiveGames table
		print("Spawned")
	end)
	createActionHandler(actions.JoinGame, function(msg)
		print("JoinGame")
	end)
	createActionHandler(actions.GameResult, function(msg)
		print("GameResult")
	end)
end

return chess_registry
