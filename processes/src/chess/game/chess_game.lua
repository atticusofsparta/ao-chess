--[[
    usage:
    local chess_game = require('processes.src.chess.game.chess_game')
    chess_game.init()
    This will mount the chess game handlers to the AOS process
]]

local chess_game = {
	version = "0.0.1",
}

chess_game.init = function()
	local constants = require("processes.src.common.constants")
	local utils = require("processes.src.common.utils")
	local createActionHandler = utils.createActionHandler
	local chess = require("processes.src.modules.chess")
end

return chess_game
