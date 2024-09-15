--[[
    usage:
    local chess_game = require('processes.src.chess.game.chess_game')
    chess_game.init()
    This will mount the chess game handlers to the AOS process
]]

local chess_game = {
	version = '0.0.1',
}

local actions = {
	GetFEN = 'Chess-Game.Get-FEN',
	GetPGN = 'Chess-Game.Get-PGN',
	TestResponsiveness = 'Chess-Game.Test-Responsiveness',
	GetInfo = 'Chess-Game.Get-Info',
	-- write
	JoinGame = 'Chess-Game.Join-Game',
	JoinWagerGame = 'Chess-Game.Join-Wager-Game',
	Move = 'Chess-Game.Move',
}

chess_game.ActionMap = actions
chess_game.init = function()
	local json = require('json')
	local utils = require('.utils')
	local createActionHandler = utils.createActionHandler
	local createForwardedActionHandler = utils.createForwardedActionHandler

	local Chess = require('.chess')

	ChessRegistry = ao.env.Process.Tags['Chess-Registry-Id']
	Players = {
		wager = {
			amount = tonumber(ao.env.Process.Tags['X-Wager-Amount']) or nil,
			token = ao.env.Process.Tags['Wager-Token'],
		},
		white = {
			id = ao.env.Process.Tags['Chess-White-Id'] or nil,
			wagerPaid = nil,
		},
		black = {
			id = ao.env.Process.Tags['Chess-Black-Id'] or nil,
			wagerPaid = nil,
		},
	}
	Game = Chess()
	math.randomseed(os.time())

	createActionHandler(actions.TestResponsiveness, function(msg)
		ao.send({
			Target = msg.From,
			Action = 'Test-Response',
			Data = json.encode(ao.env.Process),
			Players = json.encode(Players),
		})
	end)

	createActionHandler(actions.GetFEN, function(msg)
		local fen = Game.fen()
		ao.send({
			Target = msg.From,
			Data = fen,
			Action = 'Chess-Game.Get-FEN-Notice',
		})
	end)

	createActionHandler(actions.GetPGN, function(msg)
		local pgn = Game.pgn()
		ao.send({
			Target = msg.From,
			Data = pgn,
			Action = 'Chess-Game.Get-PGN-Notice',
		})
	end)

	createActionHandler(actions.JoinGame, function(msg)
		-- ensures wager games will only be handled by a forwarded handler
		assert(not Players.wager.amount)
		-- ensure Player not already in game
		assert(msg.From ~= Players.white.id and msg.From ~= Players.black.id, 'Player already joined this game')
		local player = msg['X-Player-Id'] or msg.From
		local playerColor = nil
		--TODO: Allow users to specify color
		if not Players.white.id then
			Players.white.id = player
			playerColor = 'white'
		elseif not Players.black.id then
			Players.black.id = player
			playerColor = 'black'
		else
			ao.send({
				Target = player,
				Data = 'Game is full',
				Action = 'Chess-Game.Join-Game-Notice',
			})
			return
		end
		-- notify player and registry
		ao.send({
			Target = player,
			Data = 'You have joined game [' .. ao.id .. ']' .. ' as ' .. playerColor,
			Action = actions.JoinGame .. '-Notice',
			['Player-Color'] = playerColor,
		})
		ao.send({
			Target = ChessRegistry,
			Player = player,
			['Player-Color'] = playerColor,
			Action = 'Chess-Registry.Join-Game',
		})
	end)

	createForwardedActionHandler(actions.JoinWagerGame, function(msg)
		assert(Players.wager.amount, 'Please use the Standard Join method')
		-- Ensure Player not already joined
		assert(
			msg.From ~= Players.white.id and msg.From ~= Players.black.id,
			'Player already joined this game, no refund'
		)
		assert(tonumber(msg.Quantity) == tonumber(Players.wager.amount), 'Improper wager amount, you get no refund')
		assert(Players.wager.token == msg.From, 'Improper token')

		local player = msg['X-Player-Id'] or msg.Sender
		local playerColor = nil
		--TODO: Allow users to specify color
		if Players.white.id == nil then
			Players.white.id = player
			Players.white.wagerPaid = true
			playerColor = 'white'
		elseif Players.black.id == nil then
			Players.black.id = player
			Players.black.wagerPaid = true
			playerColor = 'black'
		else
			ao.send({
				Target = player,
				Data = 'Game is full',
				Action = actions.JoinWagerGame .. '-Notice',
			})
			ao.send({
				Target = msg.From,
				Quantity = msg.Quantity,
				Recipient = msg.Sender,
				Action = 'Transfer',
				['X-Notice'] = 'Refund for failed join attempt',
			})

			return
		end
		-- notify player and registry
		ao.send({
			Target = player,
			Data = 'You have joined game [' .. ao.id .. ']' .. ' as ' .. playerColor,
			Action = actions.JoinWagerGame .. '-Notice',
			['Player-Color'] = playerColor,
		})
		ao.send({
			Target = ChessRegistry,
			Player = player,
			['Player-Color'] = playerColor,
			Action = actions.JoinGame .. '-Notice',
		})
	end)

	createActionHandler(actions.Move, function(msg)
		local player = msg.From
		assert(player == Players.white.id or player == Players.black.id, 'Player is not in the game')
		assert(Players.white.id and Players.black.id, 'Game not ready')
		assert(msg.Data, json.encode(msg))
		local move = json.decode(msg.Data)
		-- assert move is valid
		local result = Game.move(move)
		assert(result, 'Invalid move: ' .. json.encode(move))
		local isGameOver, resolution, reason = Game.game_over()
		-- need to generate scores
		-- not included in chess module, so will need to track manually when a piece is taken

		-- notify players
		ao.send({
			Target = Players.white.id,
			Data = Game.fen(),
			Action = 'Chess-Game.Move-Notice',
		})
		ao.send({
			Target = Players.black.id,
			Data = Game.fen(),
			Action = 'Chess-Game.Move-Notice',
		})

		if isGameOver then
			local winner
			assert(resolution, 'Internal error')
			assert(reason, 'Internal error')
			if resolution == '1-0' then
				winner = 'white'
			elseif resolution == '0-1' then
				winner = 'black'
			else
				winner = 'draw'
			end
			ao.send({
				Target = ChessRegistry,
				Data = json.encode({
					Winner = winner,
					Reason = reason,
					['Final-Game-State'] = Game.fen()
				}),
				Action = 'Chess-Registry.Game-Result-Notice',
			})

			-- Send out winnings
			if Players.wager and Players.wager.amount then
				local houseCut = Players.wager.amount * 0.05
				local winnerCut = Players.wager.amount * 0.95

				if winner == 'draw' then
					ao.send({
						Target = Players.wager.token,
						Action = 'Transfer',
						Recipient = Players.white.id,
						Quantity = tostring(winnerCut / 2)
					})
					ao.send({
						Target = Players.wager.token,
						Action = 'Transfer',
						Recipient = Players.black.id,
						Quantity = tostring(winnerCut / 2),
					})
				elseif winner == 'white' then
					ao.send({
						Target = Players.wager.token,
						Action = 'Transfer',
						Recipient = Players.white.id,
						Quantity = tostring(winnerCut),
					})
				elseif winner == 'black' then
					ao.send({
						Target = Players.wager.token,
						Action = 'Transfer',
						Recipient = Players.black.id,
						Quantity = tostring(winnerCut ),
					})
				end
				ao.send({
					Target = Players.wager.token,
					Action = 'Transfer',
					Recipient = ChessRegistry,
					Quantity = tostring(houseCut),
				})
			end
		end
	end)

	createActionHandler(actions.GetInfo, function(msg)
		local info = {
			ChessRegistryId = ChessRegistry,
			ChessModudleId = ChessGameModuleId,
			Players = { white = Players.white.id, black = Players.black.id},
			Wager = {Players.wager},
			fen = Game.fen()
		}


		ao.send({
			Target = msg.From,
			Data = json.encode(info),
			Action = 'Chess-Game.Get-Info-Notice',
		})
	end)
end

return chess_game
