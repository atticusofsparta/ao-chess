import { Chess, Square } from 'chess.js';
import { useRef, useState } from 'react';
import { Chessboard, ChessboardDnDProvider } from 'react-chessboard';

export default function ClickMove({
  game,
  movePiece,
  orientation,
  isPlayerTurn,
  fen,
}: {
  game: Chess;
  movePiece: (p: {
    move: { to: string; from: string; promotion: string };
  }) => Promise<void>;
  orientation: 'white' | 'black' | undefined;
  isPlayerTurn: boolean;
  fen: string;
}) {
  const chessboardRef = useRef<any>();

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

  function onSquareClick(square: Square, isTurn: boolean) {
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
    if (moveFrom && !isTurn) {
      console.error('Not your turn');
    }
    const move = {
      from: moveFrom,
      to: square,
      promotion: 'q', // always promote to a queen for example simplicity
    };
    movePiece({ move }).finally(() => {
      setOptionSquares({});
      setMoveFrom('');
    });
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
  if (!game) {
    return null;
  }

  return (
    <ChessboardDnDProvider>
      <Chessboard
        id="myboard"
        animationDuration={200}
        position={fen}
        onSquareClick={(square: Square) => onSquareClick(square, isPlayerTurn)}
        arePiecesDraggable={false}
        onSquareRightClick={onSquareRightClick}
        boardOrientation={orientation as any}
        customSquareStyles={{
          ...optionSquares,
          ...rightClickedSquares,
        }}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
        }}
        ref={chessboardRef}
      />
    </ChessboardDnDProvider>
  );
}
