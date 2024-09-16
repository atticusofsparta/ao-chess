import ArenaCard from '@src/components/cards/ArenaCard';
import CreateGameModal from '@src/components/modals/CreateGameModal';
import FindGameModal from '@src/components/modals/FindGameModal';
import { llamaTokenId } from '@src/constants';
import { useGames } from '@src/hooks/useGames';
import { useGlobalState } from '@src/services/state/useGlobalState';

function Games() {
  const address = useGlobalState((state) => state.address);
  const allGames = useGames({playerId: address});
  const setShowCreateGameModal = useGlobalState(
    (state) => state.setShowCreateGameModal,
  );
  const setShowFindGameModal = useGlobalState(
    (state) => state.setShowFindGameModal,
  );
  return (
    <div className="flex h-full w-full flex-col gap-6 pt-4">
      <div className="flex flex-row items-center justify-center gap-10 py-5">
        <button
          onClick={() => setShowCreateGameModal(true)}
          className="flex h-[150px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-foreground bg-foreground hover:border-primary"
        >
          Create Game
        </button>

        <button
          onClick={() => setShowFindGameModal(true)}
          className="flex h-[150px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-foreground bg-foreground hover:border-primary"
        >
          Find a Game
        </button>
      </div>
      <div className="flex w-full flex-col">
        <h1 className='flex flex-row text-2xl border-b-2 border-dark-grey p-4 w-full justify-center items-center'>Current Games</h1>
        <div className='flex flex-col gap-2 w-full'>
          {Object.entries(allGames?.Live)?.map(([gameId, game]) => {

            return (
             <div>
              <span>{gameId}</span>
             </div>
            );
          })}
        </div>
      </div>

      <CreateGameModal />
      <FindGameModal />
    </div>
  );
}

export default Games;
