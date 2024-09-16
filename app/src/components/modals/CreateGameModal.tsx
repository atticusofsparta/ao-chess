import {
  CHESS_REGISTRY_ID,
  expTokenId,
  jooseTokenId,
  llamaTokenId,
  pixlTokenId,
  tioTokenId,
  trunkTokenId,
  warTokenId,
} from '@src/constants';
import { ChessGame } from '@src/services/ao/chess/game';
import { ChessRegistryWritable } from '@src/services/ao/chess/registry';
import { errorEmitter } from '@src/services/events';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { set } from 'lodash';
import { useState } from 'react';
import { SiChessdotcom } from 'react-icons/si';
import { TbX } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';

import ArenaCard from '../cards/ArenaCard';
import LoadingModal from './LoadingModal';
import Modal from './Modal';

const tokenIds = [
  llamaTokenId,
  jooseTokenId,
  tioTokenId,
  expTokenId,
  warTokenId,
  pixlTokenId,
  trunkTokenId,
];

function CreateGameModal() {
  const navigate = useNavigate();
  const signer = useGlobalState((state) => state.aoSigner);
  const showCreateGameModal = useGlobalState(
    (state) => state.showCreateGameModal,
  );
  const setShowCreateGameModal = useGlobalState(
    (state) => state.setShowCreateGameModal,
  );
  const chessRegistryProvider = useGlobalState(
    (state) => state.chessRegistryProvider,
  );
  const address = useGlobalState((state) => state.address);
  const [creatingGame, setCreatingGame] = useState(false);
  const [newGameId, setNewGameId] = useState<string>();

  async function createGame({
    tokenId,
    wager,
    tokenInfo,
  }: {
    tokenId: string;
    wager: number;
    tokenInfo: {
      Name: string;
      Denomination: string | number;
      Logo: string;
      Ticker: string;
    };
  }) {
    try {
      setCreatingGame(true);
      if (!signer || !address) {
        throw new Error(
          'You need to connect with a wallet first before creating a game, chiquito.',
        );
      }
      const gameId = await (
        chessRegistryProvider as ChessRegistryWritable
      ).createGame({
        wagerToken: tokenId,
        wagerAmount: wager,
        gameName: `${tokenInfo.Name} Game`,
      });
      console.log(gameId);
      const gameProcess = ChessGame.init({
        processId: gameId,
        signer,
        chessRegistryId: CHESS_REGISTRY_ID,
        gameId,
        wagerTokenId: tokenId,
        wagerTokenAmount: wager,
      } as any);
      const joinRes = await (gameProcess as any).joinWagerGame({ address });
      console.log(joinRes);

      setNewGameId(gameId);
      // navigate(0); // this is a hack to force a refresh of the game

      setShowCreateGameModal(false);
    } catch (error) {
      errorEmitter.emit('error', error);
    } finally {
      setCreatingGame(false);
    }
  }

  return (
    <>
      <Modal
        visible={showCreateGameModal}
        className="rounded-lg border-2 border-primary bg-metallic-grey p-5 pt-4"
      >
        <h1 className="mb-10 flex flex-row items-center justify-between text-2xl">
          Create Game{' '}
          <button
            onClick={() => setShowCreateGameModal(false)}
            className="flex flex-row items-center justify-center"
          >
            <TbX />
          </button>
        </h1>
        <div className="flex w-full flex-col items-center justify-center gap-5">
          <h1 className="rounded-full border-2 border-white p-1 px-5 text-xl text-white">
            Choose Arena
          </h1>
          <div
            className={`flex max-h-[400px] flex-col flex-nowrap gap-3 overflow-auto scrollbar scrollbar-thumb-primary scrollbar-thumb-rounded scrollbar-w-2`}
          >
            {tokenIds.map((tokenId) => (
              <div
                className="mx-2 flex flex-row gap-4"
                key={'token-row-' + tokenId}
              >
                {[0.000001, 50, 100, 200, 500].map((wager, index) => (
                  <ArenaCard
                    key={tokenId + index}
                    tokenId={tokenId}
                    wager={wager}
                    onClick={createGame}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Modal>
      {creatingGame && <LoadingModal text={'Creating game, please wait...'} />}
      {newGameId && (
        <Modal
          visible={true}
          className="flex h-[200px] w-[300px] flex-col justify-between rounded-lg border-2 border-dark-grey bg-foreground"
        >
          <h1 className="flex flex-row p-2">Game Created!</h1>
          <SiChessdotcom className="m-auto animate-bounce p-2 text-6xl text-white" />
          <Link
            to={`/game/${newGameId}`}
            className="flex w-full animate-pulse flex-row items-center justify-center bg-primary p-3 transition-all hover:bg-success"
          >
            Join Game
          </Link>
        </Modal>
      )}
    </>
  );
}

export default CreateGameModal;
