import ClickMove from '@src/components/boards/ClickMove';
import EmptyBoard from '@src/components/boards/EmptyBoard';
import { errorEmitter } from '@src/services/events';
import { isArweaveTransactionID } from '@src/utils';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Game() {
  const gameId = useParams<{ gameId: string }>().gameId;
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId || !isArweaveTransactionID(gameId)) {
      errorEmitter.emit(
        'error',
        'Invalid game ID, redirecting to game explorer',
      );
      navigate('/games');
    }
  }, [gameId]);

  return (
    <div>
      {gameId && isArweaveTransactionID(gameId) ? (
        <ClickMove gameId={gameId} />
      ) : (
        <EmptyBoard />
      )}
    </div>
  );
}

export default Game;
