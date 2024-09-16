--[[
    usage:
    local chess_registry = require('processes.src.chess.chess_registry')
    chess_registry.init()
    This will mount the chess registry handlers to the AOS process
]]
local json = require('json')
local chess_registry = {
	version = '0.0.1',
}
-- setting name space of 'Chess-Registry' prevents conflicts with other processes if they are composed
local actions = {
	-- read
	GetGames = 'Chess-Registry.Get-Games',
	GetPlayers = 'Chess-Registry.Get-Players',

	-- write
	JoinRegistry = 'Chess-Registry.Join-Registry',
	EditProfile = 'Chess-Registry.Edit-Profile',
	CreateGame = 'Chess-Registry.Create-Game',
	Spawned = 'Spawned', -- reserved name for aos spawned process that the spawned process calls back when it is ready
	JoinGame = 'Chess-Registry.Join-Game',
	GameResult = 'Chess-Registry.Game-Result-Notice',
	UpdateGameModuleId = 'Chess-Registry.Update-Game-Module-Id',
}
chess_registry.ActionMap = actions
ChessGameModuleId = ao.env.Module.Id or 'no module id set'
ChessGameCode = require('.bundled_cheat_code')
chess_registry.init = function()
	local constants = require('.constants')
	local utils = require('.utils')
	local createActionHandler = utils.createActionHandler

	LiveGames = LiveGames or {
		-- ['game id'] = {
		-- 	startTimestamp = 0,
		-- 	['players'] = {
		-- 		['white'] = 'player id',
		-- 		['black'] = 'player id',
		-- 	},
		-- },
	}
	HistoricalGames = HistoricalGames or {
		-- ['game id'] = {
		-- startTimestamp = 0,
		-- endTimestamp = 0,
		-- resolution = 'surrender | checkmate | stalemate',
		-- ['players'] = {
		-- 	['white'] = {
		-- 		id = 'player id',
		-- 		score = 0,
		-- 	},
		-- 	['black'] = {
		-- 		id = 'player id',
		-- 		score = 0,
		-- 	},
		-- },
		-- },
	}
	Players = Players or {
		--[[ ['player id'] = {
		 	stats = {
		 		elo = constants.DEFAULT_ELO,
		 		wins = 0,
		 		losses = 0,
		 		stalemates = 0,
		 		surrenders = 0,
		 	},
		 	gameHistory = { -- Linked list of game ids, allows for easy retrieval by player address
		 		['game id'] = HistoricalGames['game id'] or LiveGames['game id'],
		 	},
		 	username = 'username',
		 },
		 ]]
	}

	createActionHandler(actions.GetGames, function(msg)
		print('GetGames')
		local gameIds = msg['Game-Ids']
		local playerId = msg['Player-Id']
		local typeFilter = msg.Type
		local spawnMessage = msg['Spawned-With']
		assert(
			typeFilter == 'Live' or typeFilter == 'Historical' or typeFilter == 'undefined' or typeFilter == nil,
			'Type must equal Live, Historical, undefiined or nil'
		)

		if spawnMessage then
			local desiredGame = {Live = {}, Historical = {}}
	
			-- Loop over LiveGames and look for a match in spawnedWith
			for gameId, game in pairs(LiveGames) do
				if game.spawnedWith == spawnMessage then
					desiredGame.Live[gameId] = game
					break -- Exit loop once found
				end
			end
	
			-- If not found in LiveGames, check HistoricalGames
			if not desiredGame then
				for gameId, game in pairs(HistoricalGames) do
					if game.spawnedWith == spawnMessage then
						desiredGame.Historical[gameId] = game
						break -- Exit loop once found
					end
				end
			end
	
			-- If a game is found, handle the result (sending or processing the desired game)
			if desiredGame then
				-- Process desiredGame (you can add your own logic here)
				print("Found game with Spawned-With: " .. spawnMessage)
				-- Return or send the desiredGame as necessary
				ao.send({
					Target = msg.From,
					Action = actions.GetGames .. "-Notice",
					Data = json.encode(desiredGame)
				})
			else
				print("No game found with Spawned-With: " .. spawnMessage)
			end
		end

		-- decode gameIds if they exist
		if gameIds then
			gameIds = json.decode(gameIds)
			assert(utils.isArray(gameIds), 'Game-Ids must be provided as a stringified array.')
		end

		if gameIds and #gameIds > 0 then
			-- Iterate over each gameId and send the game data if found
			local foundGames = {
				Live = {},
				Historical = {},
			}
			for _, gameId in ipairs(gameIds) do
				-- assert(false, json.encode(gameId))
				local gameData = LiveGames[gameId] or HistoricalGames[gameId]
				assert(gameData, 'Requested game not found: ' .. gameId) -- Error if a game is not found
				-- Filter games into Live or Historical
				if not gameData.endTimestamp then
					foundGames.Live[gameId] = gameData
				else
					foundGames.Historical[gameId] = gameData
				end
			end
			-- Send the collected game data
			ao.send({
				Target = msg.From,
				Action = actions.GetGames .. '-Notice',
				Data = json.encode(foundGames),
			})
		else
			-- Fetch games by playerId if no gameId is provided
			if playerId then
				-- Error if Player not found
				assert(Players[playerId], 'Requested player not found: ' .. playerId)
				if Players[playerId] then
					local playerGames = utils.sortPlayerGames(Players[playerId].gameHistory)

					-- Apply typeFilter for Live or Historical games
					local filteredGames = {}
					if typeFilter ~= 'Historical' then
						filteredGames.Live = playerGames.Live
					end
					if typeFilter ~= 'Live' then
						filteredGames.Historical = playerGames.Historical
					end
					-- Send filtered game data
					ao.send({
						Target = msg.From,
						Action = actions.GetGames .. '-Notice',
						Data = json.encode(filteredGames),
					})
				end
			else
				-- Return all games if no gameId or playerId is provided
				local allGames = {
					LiveGames = {},
					HistoricalGames = {},
				}
				if typeFilter ~= 'Historical' then
					allGames.LiveGames = LiveGames
				end
				if typeFilter ~= 'Live' then
					allGames.HistoricalGames = HistoricalGames
				end
				ao.send({
					Target = msg.From,
					Action = actions.GetGames .. '-Notice',
					Data = json.encode(allGames),
				})
			end
		end
	end)

	createActionHandler(actions.GetPlayers, function(msg)
		print('GetPlayers')
		local playerIds = msg['Player-Ids']
		local playerList = {}
		if playerIds then
			playerIds = json.decode(playerIds)
			assert(utils.isArray(playerIds), 'Player-Ids must be provided as a stringified array.')

			for _, playerId in ipairs(playerIds) do
				playerId = tostring(playerId)
				assert(Players[playerId], 'Player not found: ' .. playerId)
				playerList[playerId] = Players[playerId]
			end
			-- Send requested player
			ao.send({
				Target = msg.From,
				Action = actions.GetPlayers .. '-Notice',
				Data = json.encode(utils.compressPlayerList(playerList)),
			})
		else
			-- Send all players if specific player not specified
			ao.send({
				Target = msg.From,
				Action = actions.GetPlayers .. '-Notice',
				Data = json.encode(utils.compressPlayerList(Players)),
			})
		end
	end)

	createActionHandler(actions.CreateGame, function(msg)

		if not Players[msg.From] then
			local playerTable = {
				stats = {
					elo = constants.DEFAULT_ELO,
					wins = 0,
					losses = 0,
					stalemates = 0,
					surrenders = 0,
				},
				username = msg.Username,
				gameHistory = {}
			}
			Players[tostring(msg.From)] = playerTable
		end

		assert(Players[msg.From], 'Player not registered')

		local gameProcess = Spawn(ChessGameModuleId, {
			Tags = {
				['Chess-Registry-Id'] = ao.id,
				['Player-Id'] = msg.From,
				['X-Create-Game-Id'] = msg['Id'],
				['Game-Name'] = msg['Game-Name'],
				['Wager-Amount'] = msg['Wager-Amount'],
				['Wager-Token'] = msg['Wager-Token'],
				['Authority'] = ao.authorities[1]
			},
		}).receive({['X-Create-Game-Id'] = msg['Id']})
		 

		print('Game Process ID: ' .. gameProcess.Process)

		local evalResult = Send({
			Target = gameProcess.Process,
			Action = "Eval",
			Data = ChessGameCode
		})

	

		local evalResult2 = Send({
			Target = gameProcess.Process,
			Action = "Eval",
			Data = "Handlers.list"
		})


		ao.send({
			Target = msg.From,
			Action = actions.CreateGame .. '-Notice',
			Data = gameProcess.Process,
		})

		LiveGames[gameProcess.Process] = { startTimestamp = tostring(msg.Timestamp) }
		LiveGames[gameProcess.Process]['players'] = {}
		LiveGames[gameProcess.Process].createdBy = msg.From
		LiveGames[gameProcess.Process].spawnedWith = msg['Id']
		LiveGames[gameProcess.Process]['wasAtSomePointTheMostRecentlyCreatedGame'] = true
		--TODO: send join message for player who created
	end)
	-- createActionHandler(actions.Spawned, function(msg)
	-- 	-- add game ID and player ID to the LiveGames table
	-- 	print('Spawned')
	-- 	print(msg)
	-- 	-- msg.Tags.['X-Player-Id']
	-- end)
	createActionHandler(actions.JoinGame, function(msg)
		print('JoinGame')
		local gameId = msg.From
		assert(LiveGames[gameId], 'Joining is handled by Game processes: ' .. gameId)
		assert(msg.Player, 'Must specify player')

		if not Players[msg.Player] then
			local playerTable = {
				stats = {
					elo = constants.DEFAULT_ELO,
					wins = 0,
					losses = 0,
					stalemates = 0,
					surrenders = 0,
				},
				username = msg.Username,
				gameHistory = {}
			}
			Players[tostring(msg.Player)] = playerTable
		end

		assert(Players[msg.Player], 'Player not registerd')

		local playerColor = msg['Player-Color']
		for _, tag in ipairs(msg.Tags) do
			if tag.name == 'Player-Color' then
				playerColor = tag.value
				break
			end
		end
		assert(playerColor, 'Player color must be specified')
		-- Ensure not double joining
		assert(not LiveGames[gameId]['players'][playerColor], 'Color ' .. playerColor .. 'is already occupied')
		LiveGames[gameId]['players'][playerColor] = msg.Player
		print(LiveGames[gameId])
		Players[msg.Player].gameHistory[gameId] = LiveGames[gameId]
		-- Send a confirmation message
		ao.send({
			Target = gameId,
			Action = actions.JoinGame .. '-Notice',
			Data = 'Successful Join operation',
		})
	end)
	createActionHandler(actions.GameResult, function(msg)
		print('GameResult')
		local gameId = msg.From
		assert(LiveGames[gameId], "failed at get id from live")
		local live = LiveGames[gameId]
		assert(live, 'Not a valid game')
		local gameResult = json.decode(msg.Data)
		assert(msg.Timestamp, "Failed at timestamp")
		local Timestamp = tostring(msg.Timestamp)

		-- update game
		live.endTimeStamp = Timestamp
		assert(live.endTimeStamp, "failed setting timestamp")
		live.winner = gameResult.Winner
		assert(live.winner, "failed at setting winner")

		assert(LiveGames[gameId].players, "failed pulling players")
		local whiteId = LiveGames[gameId].players.white
		local blackId = LiveGames[gameId].players.black
		local fen = gameResult['Final-Game-State']

		local whiteScore, blackScore = calculateScores(fen)

		live.players.white = { id = whiteId, score = whiteScore }
		live.players.black = { id = blackId, score = blackScore }

		-- copy to historical
		HistoricalGames[gameId] = live
		-- delete from live
		LiveGames[gameId] = nil

		print(json.encode(HistoricalGames[gameId]))
		if gameResult.Winner == 'white' then
			Players[whiteId].stats.wins = Players[whiteId].stats.wins + 1
			Players[blackId].stats.losses = Players[blackId].stats.losses + 1
		elseif gameResult.Winner == 'black' then
			Players[whiteId].stats.loses = Players[whiteId].stats.loses + 1
			Players[blackId].stats.wins = Players[blackId].stats.wins + 1
		elseif gameResult.Winner == 'draw' then
			Players[whiteId].stats.stalemates = Players[whiteId].stats.stalemates + 1
			Players[blackId].stats.stalemates = Players[blackId].stats.stalemates + 1
		end

		calculateAndUpdateElo(HistoricalGames[gameId].players.white, HistoricalGames[gameId].players.black)
		assert(HistoricalGames[gameId], "failed setting historical game")
		Players[whiteId].gameHistory[gameId] = HistoricalGames[gameId]
		Players[blackId].gameHistory[gameId] = HistoricalGames[gameId]
	end)

	function calculateAndUpdateElo(whitePlayer, blackPlayer)
		-- Get the current ELO ratings from the Players table
		local whiteElo = Players[whitePlayer.id].stats.elo or 1500
		local blackElo = Players[blackPlayer.id].stats.elo or 1500
		local K = 20 -- K-factor for Elo calculation

		-- Determine game outcome (1 for win, 0.5 for draw, 0 for loss)
		local whiteActualScore, blackActualScore
		if whitePlayer.score > blackPlayer.score then
			whiteActualScore, blackActualScore = 1, 0
		elseif blackPlayer.score > whitePlayer.score then
			whiteActualScore, blackActualScore = 0, 1
		else
			whiteActualScore, blackActualScore = 0.5, 0.5
		end

		-- Calculate expected scores
		local whiteExpected = 1 / (1 + 10 ^ ((blackElo - whiteElo) / 400))
		local blackExpected = 1 / (1 + 10 ^ ((whiteElo - blackElo) / 400))

		-- Calculate new Elo ratings
		local newWhiteElo = whiteElo + K * (whiteActualScore - whiteExpected)
		local newBlackElo = blackElo + K * (blackActualScore - blackExpected)

		-- Update the Elo ratings in the Players table
		Players[whitePlayer.id].stats.elo = newWhiteElo
		Players[blackPlayer.id].stats.elo = newBlackElo

		-- Print new ELO ratings for debugging/logging
		print('New ELO for White (ID: ' .. whitePlayer.id .. '): ' .. newWhiteElo)
		print('New ELO for Black (ID: ' .. blackPlayer.id .. '): ' .. newBlackElo)
	end

	function calculateScores(fen)
		local pieceValues = {
			p = 1,
			P = 1,
			n = 3,
			N = 3,
			b = 3,
			B = 3,
			r = 5,
			R = 5,
			q = 9,
			Q = 9,
			k = 0,
			K = 0, -- King is not scored
		}
		-- Get the board setup part of the FEN (first part before the first space)
		local boardSetup = fen:match('([^ ]+)')

		-- Initialize scores
		local whiteScore = 0
		local blackScore = 0

		-- Iterate over each character in the board setup
		for char in boardSetup:gmatch('.') do
			if pieceValues[char] then
				-- If it's a lowercase letter, it's a black piece
				if char:lower() == char then
					blackScore = blackScore + pieceValues[char]
				-- If it's an uppercase letter, it's a white piece
				else
					whiteScore = whiteScore + pieceValues[char]
				end
			end
		end

		return whiteScore, blackScore
	end

	createActionHandler(actions.UpdateGameModuleId, function(msg)
		assert(msg.From == Owner or msg.From == ao.id, 'Unauthorized')
		assert(msg['Module-Id'] and type(msg['Module-Id']) == 'string')
		ChessGameModuleId = msg['Module-Id']
		ao.send({
			Target = msg.From,
			Action = actions.UpdateGameModuleId .. '-Notice',
			Data = 'Successfully updated Module Id to ' .. ChessGameModuleId,
		})
	end)
end

return chess_registry
