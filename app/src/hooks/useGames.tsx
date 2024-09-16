import { HistoricalChessGame, LiveChessGame } from '@src/services/ao/chess/registry';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { useEffect, useState } from 'react';

export function useGames(filters?: {
  gameIds?: string[];
  playerId?: string;
  typeFilter?: 'Live' | 'Historical';
  spawnedWith?: string;
}) {
  const chessRegistry = useGlobalState((state) => state.chessRegistryProvider);

  const [games, setGames] = useState<{
    Historical: Record<string, HistoricalChessGame>;
    Live: Record<string, LiveChessGame>;
  }>({
    Historical: {},
    Live: {},
  });

  useEffect(() => {
    chessRegistry.getGames(filters).then((games) => {
    setGames(games);
    })
  }, [chessRegistry]);

  return games;
}
