--[[
    usage:
    local chess_registry = require('processes.src.chess.chess_registry')
    chess_registry.init()
    This will mount the chess registry handlers to the AOS process
]]
local utils = require("common.utils")
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
		local gameIds = msg["Game-Ids"]
		local playerId = msg["Player-Id"]
		local typeFilter = msg.Type
		assert(
			typeFilter == "Live" or typeFilter == "Historical" or typeFilter == "undefined" or typeFilter == nil,
			"Type must equal 'Live', 'Historical', 'undefiined' or nil"
		)

		-- Function to trim spaces from strings
		local function trim(s)
			return s:match("^%s*(.-)%s*$")
		end

		-- Parse and trim gameIds
		local gameIdList = {}
		if gameIds then
			for gameId in string.gmatch(gameIds, "([^,]+)") do
				table.insert(gameIdList, trim(gameId)) -- Trim any spaces around the gameId
			end
		end

		if #gameIdList > 0 then
			-- Iterate over each gameId and send the game data if found
			local foundGames = {
				Live = {},
				Historical = {},
			}
			for id, gameId in ipairs(gameIdList) do
				local gameData = LiveGames[gameId] or HistoricalGames[gameId]
				assert(gameData, "Requested game not found: " .. gameId) -- Error if a game is not found
				-- Filter games into Live or Historical
				if not gameData.endTimestamp then
					foundGames.Live[id] = gameData
				else
					foundGames.Historical[id] = gameData
				end
			end
			-- Send the collected game data
			ao.send({
				Target = msg.From,
				Action = actions.GetGames .. "-Notice",
				Data = json.encode(foundGames),
			})
		else
			-- Fetch games by playerId if no gameId is provided
			if playerId then
				-- Error if Player not found
				assert(Players[playerId], "Requested player not found: " .. playerId)
				if Players[playerId] then
					local playerGames = utils.sortPlayerGames(Players[playerId].gameHistory)

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
						Action = actions.GetGames .. "-Notice",
						Data = json.encode(filteredGames),
					})
				end
			else
				-- Return all games if no gameId or playerId is provided
				local allGames = {
					LiveGames = {},
					HistoricalGames = {},
				}
				if typeFilter ~= "Historical" then
					allGames.LiveGames = LiveGames
				end
				if typeFilter ~= "Live" then
					allGames.HistoricalGames = HistoricalGames
				end
				ao.send({
					Target = msg.From,
					Action = actions.GetGames .. "-Notice",
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
