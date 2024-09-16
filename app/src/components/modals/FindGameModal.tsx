import { llamaTokenId } from '@src/constants';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { SiChessdotcom } from 'react-icons/si';
import { TbX } from 'react-icons/tb';

import ArenaCard from '../cards/ArenaCard';
import Modal from './Modal';

function FindGameModal() {
  const showFindGameModal = useGlobalState((state) => state.showFindGameModal);
  const setShowFindGameModal = useGlobalState(
    (state) => state.setShowFindGameModal,
  );

  return (
    <Modal
      visible={showFindGameModal}
      className="min-w-[600px] rounded-lg border-2 border-primary bg-metallic-grey p-5 pt-4"
    >
      <h1 className="mb-10 flex flex-row items-center justify-between text-2xl">
        Searching for opponent...{' '}
        <button
          onClick={() => setShowFindGameModal(false)}
          className="flex flex-row items-center justify-center"
        >
          <TbX />
        </button>
      </h1>
      <div className="flex w-full flex-col items-center justify-center gap-5">
        <SiChessdotcom className="animate-spin rounded-full border-2 border-white p-2 text-9xl text-white" />
        <div className={`flex flex-row gap-4`}></div>
      </div>
    </Modal>
  );
}

export default FindGameModal;
