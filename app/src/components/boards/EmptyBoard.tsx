import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function EmptyBoard() {
  return <Chessboard position={new Chess().fen()} />;
}

export default EmptyBoard;
