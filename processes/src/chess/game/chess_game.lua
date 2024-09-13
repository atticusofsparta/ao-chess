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
	TestResponsiveness = "Chess-Game.Test-Responsiveness",
	-- write
	JoinGame = "Chess-Game.Join-Game",
	JoinWagerGame = "Chess-Game.Join-Wager-Game",
	Move = "Chess-Game.Move",
}

chess_game.ActionMap = actions
chess_game.init = function()
	local json = require("json")
	local utils = require(".utils")
	local createActionHandler = utils.createActionHandler
	local createForwardedActionHandler = utils.createForwardedActionHandler

	local Chess = require('.chess')

	ChessRegistry = ao.env.Process.Tags["Chess-Registry-Id"]
	Players = {
		wager = {amount = nil, token = nil},
		white = {
			id = ao.env.Process.Tags["Chess-White-Id"] or nil,
			wagerPaid = nil
		},
		black = {
			id = ao.env.Process.Tags["Chess-Black-Id"] or nil,
			wagerPaid = nil
		},
	}
	Game = Chess()
	Players.wager.amount = tonumber(ao.env.Process.Tags['X-Wager-Amount']) or nil
	Players.wager.token = ao.env.Process.Tags['X-Wager-Token']

	createActionHandler(actions.TestResponsiveness, function(msg)
		ao.send({
			Target = msg.From,
			Action = "Test-Response",
			Data = json.encode(ao.env.Process),
			Players = json.encode(Players)
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
		-- ensures wager games will only be handled by a forwarded handler
		assert(not Players.wager.amount)
		-- ensure Player not already in game
		assert(msg.From ~= Players.white.id and msg.From ~= Players.black.id, "Player already joined this game")
		local player = msg['X-Player-Id'] or msg.From
		local playerColor = nil
		--TODO: Allow users to specify color
		if not Players.white.id then
			Players.white.id = player
			playerColor = "white"
		elseif not Players.black.id then
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
			Action = actions.JoinGame .. "-Notice",
			["Player-Color"] = playerColor,
		})
		ao.send({
			Target = ChessRegistry,
			Player = player,
			["Player-Color"] = playerColor,
			Action = actions.JoinGame .. "-Notice",
		})
	end)

	createForwardedActionHandler(actions.JoinWagerGame, function(msg)
		assert(Players.wager.amount, "Please use the Standard Join method")
		-- Ensure Player not already joined
		assert(msg.From ~= Players.white.id and msg.From ~= Players.black.id, "Player already joined this game, no refund")
		assert(tonumber(msg.Quantity) == tonumber(Players.wager.amount), "Improper wager amount, you get no refund")
		assert(Players.wager.token == msg.From, "Improper token")

		local player = msg["X-Player-Id"] or msg.Sender
		local playerColor = nil
		--TODO: Allow users to specify color
		if Players.white.id == nil then
			Players.white.id = player
			Players.white.wagerPaid = true
			playerColor = "white"
		elseif Players.black.id == nil then
			Players.black.id = player
			Players.black.wagerPaid = true
			playerColor = "black"
		else
			ao.send({
				Target = player,
				Data = "Game is full",
				Action = "Chess-Game.Join-Game-Notice",
			})
			ao.send({
				Target = msg.From,
				Quantity = msg.Quantity,
				Recipient = msg.Sender,
				Action = "Transfer",
				['X-Notice'] = "Refund for failed join attempt"
			})

			return
		end
		-- notify player and registry
		ao.send({
			Target = player,
			Data = "You have joined game [" .. ao.id .. "]" .. " as " .. playerColor,
			Action = actions.JoinGame .. "-Notice",
			["Player-Color"] = playerColor,
		})
		ao.send({
			Target = ChessRegistry,
			Player = player,
			["Player-Color"] = playerColor,
			Action = actions.JoinGame .. "-Notice",
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
