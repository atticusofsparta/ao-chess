import {
  ChessGame,
  ChessGameReadable,
  ChessGameWritable,
} from '@src/services/ao/chess/game';
import { errorEmitter } from '@src/services/events';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { Chess } from 'chess.js';
import { useCallback, useEffect, useState } from 'react';

export function useGame(id: string) {
  const address = useGlobalState((state) => state.address);
  const signer = useGlobalState((state) => state.aoSigner);
  const [gameProcess, setGameProcess] = useState<
    ChessGameReadable | ChessGameWritable
  >(ChessGame.init({ processId: id, signer: signer as any }));
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState<'white' | 'black'>();
  const [opponent, setOpponent] = useState<string>();
  const [wager, setWager] = useState<number>();
  const [wagerToken, setWagerToken] = useState<string>();
  const [chessRegistryId, setChessRegistryId] = useState<string>();

  const updateGame = useCallback(
    async (newFen?: string) => {
      try {
        const info = await gameProcess.getInfo();
        const whiteId = info.Players.white.id;
        const blackId = info.Players.black.id;
        if (whiteId === address) {
          setOrientation('white');
          setOpponent(blackId);
        } else {
          setOrientation('black');
          setOpponent(whiteId);
        }
        setWager(info.Players?.wager?.amount);
        setWagerToken(info.Players?.wager?.token);
        setChessRegistryId(info.ChessRegistryId);
        const fen = newFen ?? info.Fen;
        if (fen && fen !== game.fen()) {
          const gameCopy: any = { ...game };
          gameCopy.load(fen);
          setGame(gameCopy);
        }
      } catch (error) {
        errorEmitter.emit('error', error);
      }
    },
    [game, gameProcess, address],
  );
  const move = useCallback(
    async ({
      move,
    }: {
      move: {
        to: string;
        from: string;
        promotion: string;
      };
    }) => {
      try {
        const res = await (gameProcess as any as ChessGameWritable)
          .move({ move })
          .catch((e: any) => {
            throw new Error('Invalid move: ' + e.message);
          });
        const newFen = res.result;
        updateGame(newFen);
      } catch (error) {
        errorEmitter.emit('error', error);
      }
    },
    [gameProcess, updateGame],
  );

  useEffect(() => {
    const newGameProcess = ChessGame.init({
      processId: id,
      signer: signer as any,
    });
    setGameProcess(newGameProcess);
  }, [signer, id]);

  useEffect(() => {
    const interval = setInterval(updateGame, 5000);
    return () => clearInterval(interval);
  }, [id, updateGame]);

  return {
    game,
    gameProcess,
    move,
    orientation,
    opponent,
    wager,
    wagerToken,
    chessRegistryId,
    isPlayerTurn: orientation ? game.turn() === orientation?.charAt(0) : false,
  };
}
