--[[
    usage:
    local chess_registry = require('processes.src.chess.chess_registry')
    chess_registry.init()
    This will mount the chess registry handlers to the AOS process
]]

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
