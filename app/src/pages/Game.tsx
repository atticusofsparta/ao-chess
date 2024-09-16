import ClickMove from '@src/components/boards/ClickMove';
import EmptyBoard from '@src/components/boards/EmptyBoard';
import DirectMessageChat from '@src/components/forms/DirectMessageChat';
import { useGame } from '@src/hooks/useGame';
import { useProfile } from '@src/hooks/useProfile';
import { ChessGameWritable } from '@src/services/ao/chess/game';
import { errorEmitter } from '@src/services/events';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { formatArweaveAddress, isArweaveTransactionID } from '@src/utils';
import { useEffect } from 'react';
import { RiAccountCircleFill } from 'react-icons/ri';
import { Link, useNavigate, useParams } from 'react-router-dom';

function Game() {
  const address = useGlobalState((state) => state.address);
  const gameId = useParams<{ gameId: string }>().gameId;
  const {
    game,
    move: movePiece,
    orientation,
    isPlayerTurn,
    fen,
    opponent,
    chat,
    gameProcess,
  } = useGame(gameId!);
  const { profile, profileImage } = useProfile(opponent);
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
    <div className="flex h-full w-full flex-col items-center justify-center py-2">
      <div className="flex h-full w-full flex-row justify-center gap-10">
        <div className="w-1/3">
          <div className="flex w-full flex-col gap-1 py-4">
            <div className="flex w-full flex-row gap-2">
              {profileImage ? (
                <img
                  src={profileImage}
                  className="h-[50px] w-[50px] rounded-full"
                />
              ) : (
                <RiAccountCircleFill size={'50px'} />
              )}
              <div className="flex flex-col">
                <span>{profile?.DisplayName ?? 'Opponent'}</span>
                <Link
                  to={`https://ao.link/entity/${opponent}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {formatArweaveAddress(opponent ?? '')}
                </Link>
              </div>
            </div>
          </div>
          {gameId && isArweaveTransactionID(gameId) ? (
            <ClickMove
              game={game}
              movePiece={movePiece}
              orientation={orientation}
              isPlayerTurn={isPlayerTurn}
              fen={fen}
            />
          ) : (
            <EmptyBoard />
          )}
        </div>

        <div className="flex h-[80%] w-1/3 flex-col rounded-xl bg-[rgb(0,0,0,0.2)] p-4">
          <DirectMessageChat
            className="flex h-full w-full flex-col gap-10 "
            chatMessages={chat ?? []}
            userAddress={address ?? ''}
            receiverAddress={opponent ?? ''}
            send={async (message: string) => {
              try {
                await (gameProcess as ChessGameWritable).sendMessage({
                  message,
                });
              } catch (error) {
                errorEmitter.emit('error', error);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Game;
