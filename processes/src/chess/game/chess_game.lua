--[[
    usage:
    local chess_game = require('processes.src.chess.game.chess_game')
    chess_game.init()
    This will mount the chess game handlers to the AOS process
]]

local chess_game = {
	version = "0.0.1",
}

local actions = {
	GetFEN = "Chess-Game.Get-FEN",
	GetPGN = "Chess-Game.Get-PGN",
	-- write
	JoinGame = "Chess-Game.Join-Game",
	Move = "Chess-Game.Move",
}

chess_game.ActionMap = actions
chess_game.init = function()
	local json = require("json")

	local utils = require(".utils")
	local createActionHandler = utils.createActionHandler

	local Chess = require('.chess')

	ChessRegistry = ao.env.Process.Tags["Chess-Registry-Id"]
	Players = {
		white = {
			id = ao.env.Process.Tags["Chess-White-Id"] or nil,
		},
		black = {
			id = ao.env.Process.Tags["Chess-Black-Id"] or nil,
		},
	}
	Game = Chess()

	createActionHandler("potato", function(msg)
		ao.send({
			Target = msg.From,
			Action = "Test-Response",
			Data = json.encode(ao.env.Process),
		})
	end)

	createActionHandler(actions.GetFEN, function(msg)
		local fen = Game:fen()
		ao.send({
			Target = msg.From,
			Data = fen,
			Action = "Chess-Game.Get-FEN-Notice",
		})
	end)

	createActionHandler(actions.GetPGN, function(msg)
		local pgn = Game:pgn()
		ao.send({
			Target = msg.From,
			Data = pgn,
			Action = "Chess-Game.Get-PGN-Notice",
		})
	end)

	createActionHandler(actions.JoinGame, function(msg)
		local player = msg.From
		local playerColor = nil
		if Players.white.id == nil then
			Players.white.id = player
			playerColor = "white"
		elseif Players.black.id == nil then
			Players.black.id = player
			playerColor = "black"
		else
			ao.send({
				Target = player,
				Data = "Game is full",
				Action = "Chess-Game.Join-Game-Notice",
			})
			return
		end
		-- notify player and registry
		ao.send({
			Target = player,
			Data = "You have joined game [" .. ao.id .. "]" .. " as " .. playerColor,
			Action = "Chess-Game.Join-Game-Notice",
			["Player-Color"] = playerColor,
		})
		ao.send({
			Target = ChessRegistry,
			Player = player,
			["Player-Color"] = playerColor,
			Action = "Chess-Registry.Join-Game",
		})
	end)

	createActionHandler(actions.Move, function(msg)
		local player = msg.From
		assert(player == Players.white.id or player == Players.black.id, "Player is not in the game")
		local move = json.decode(msg.Data)
		-- assert move is valid
		local result = Game:move(move)
		local isGameOver, resolution = Game:game_over()

		-- need to generate scores
		-- not included in chess module, so will need to track manually when a piece is taken

		-- notify players
		ao.send({
			Target = Players.white.id,
			Data = Game:fen(),
			Action = "Chess-Game.Move-Notice",
		})
		ao.send({
			Target = Players.black.id,
			Data = Game:fen(),
			Action = "Chess-Game.Move-Notice",
		})

		if isGameOver then
			ao.send({
				Target = ChessRegistry,
				Data = {
					-- ... send points and resolution
				},
				Action = "Chess-Registry.Game-Result",
			})
		end
	end)
end

return chess_game
