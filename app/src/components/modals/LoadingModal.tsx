import { SiChessdotcom } from 'react-icons/si';

import Modal from './Modal';

function LoadingModal({ text }: { text?: string }) {
  return (
    <Modal
      visible={true}
      containerClasses="p-10 flex flex-row justify-center items-center bg-night-sky-thin shadow-foregroundThin z-50"
      className="shadow-primaryThin flex h-[200px] w-[500px] flex-col items-center justify-center rounded-lg border-2 border-primary bg-foreground p-10 text-primary"
    >
      <div className="flex h-full w-full flex-row justify-between">
        <span className="flex w-full flex-row whitespace-nowrap">{text}</span>
        <div className="flex w-fit flex-row justify-end text-white">
          <SiChessdotcom className="animate-spin rounded-full border-2 border-white p-2 text-9xl text-white" />
        </div>
      </div>
    </Modal>
  );
}

export default LoadingModal;
