import { useGlobalState } from '@src/services/state/useGlobalState';

import Button from '../buttons/Button';
import Modal from './Modal';

function SigningModal() {
  const signing = useGlobalState((state) => state.signing);
  const setSigning = useGlobalState((state) => state.setSigning);

  return (
    <Modal
      visible={signing}
      containerClasses="p-10 flex flex-row justify-center items-center bg-night-sky-thin shadow-foregroundThin z-50"
      className="shadow-primaryThin flex h-[200px] w-[500px] flex-col items-center justify-center rounded-lg border-2 border-primary bg-foreground p-10 text-primary"
    >
      <div className="flex h-full w-full flex-col justify-between">
        Signing Transaction, please wait...
        <div className="flex w-full flex-row justify-end text-white">
          <Button className="underline" onClick={() => setSigning(false)}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default SigningModal;
