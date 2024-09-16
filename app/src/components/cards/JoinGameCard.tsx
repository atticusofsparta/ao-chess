import { useGame } from '@src/hooks/useGame';
import Ar from 'arweave/node/ar';

import ArenaCard from './ArenaCard';

function JoinGameCard({ gameId }: { gameId: string }) {
  const { wager, wagerToken, opponent } = useGame(gameId);

  return (
    <div className="flex flex-row rounded-lg border-2 border-white">
      {wager && wagerToken ? (
        <ArenaCard tokenId={wagerToken} wager={wager} />
      ) : (
        <div className="">Invalid game ID</div>
      )}
    </div>
  );
}

export default JoinGameCard;
