import { errorEmitter } from '@src/services/events';
import { useConnection } from 'arweave-wallet-kit';

import Button from './Button';

function ConnectButton() {
  const { connect } = useConnection();
  async function handleConnect() {
    try {
      await connect();
    } catch (error) {
      errorEmitter.emit('error', error);
    }
  }
  return (
    <Button
      onClick={handleConnect}
      className="ml-4 flex flex-row rounded-md bg-white px-3 py-0.5 font-semibold text-black transition-all hover:scale-110"
    >
      Connect
    </Button>
  );
}

export default ConnectButton;
