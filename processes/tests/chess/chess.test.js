import assert from 'node:assert';
import { describe, it, before } from 'node:test';
import { createAntAosLoader } from './utils.js';
import {
  AO_LOADER_HANDLER_ENV,
  STUB_ADDRESS,
  DEFAULT_HANDLE_OPTIONS,
} from '../../tools/constants.js';

describe('Chess Registry', async () => {
  let handle;
  let startMemory;

  before(async () => {
    const loader = await createAntAosLoader();
    handle = loader.handle;
    startMemory = loader.memory;
  });

  async function sendMessage(options = {}, mem = startMemory) {
    return handle(
      mem,
      {
        ...DEFAULT_HANDLE_OPTIONS,
        ...options,
      },
      AO_LOADER_HANDLER_ENV,
    );
  }

  it('should handle game creation', async () => {
    const { memory, result } = await sendMessage({
      Method: 'CreateGame',
      Args: {
        White: STUB_ADDRESS,
        Black: STUB_ADDRESS,
      },
    });

    assert.strictEqual(memory, startMemory);
    assert.strictEqual(result, 'Game created');
  });

});
