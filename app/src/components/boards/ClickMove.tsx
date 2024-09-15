import { useGame } from '@src/hooks/useGame';
import { errorEmitter } from '@src/services/events';
import { Square } from 'chess.js';
import { useState } from 'react';
import { Chessboard } from 'react-chessboard';

export default function ClickMove({ gameId }: { gameId: string }) {
  const { game, move: movePiece, orientation, isPlayerTurn } = useGame(gameId);

  const [moveFrom, setMoveFrom] = useState('');

  const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
  const [optionSquares, setOptionSquares] = useState({});

  function getMoveOptions(square: Square) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares: Record<string, any> = {};
    moves.map((move: any) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});

    function resetFirstMove(square: Square) {
      setMoveFrom(square);
      getMoveOptions(square);
    }

    // from square
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }
    if (moveFrom && !isPlayerTurn) {
      errorEmitter.emit('error', 'Not your turn');
    }
    const move = {
      from: moveFrom,
      to: square,
      promotion: 'q', // always promote to a queen for example simplicity
    };
    movePiece({ move });
  }

  //highlighting
  function onSquareRightClick(square: Square) {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  return (
    <Chessboard
      id="myboard"
      animationDuration={200}
      arePiecesDraggable={false}
      position={game.fen()}
      onSquareClick={onSquareClick}
      onSquareRightClick={onSquareRightClick}
      boardOrientation={orientation}
      customSquareStyles={{
        ...optionSquares,
        ...rightClickedSquares,
      }}
      customBoardStyle={{
        borderRadius: '4px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
      }}
    />
  );
}
