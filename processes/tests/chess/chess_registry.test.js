import assert from 'node:assert';
import { describe, it, before } from 'node:test';
import { createChessRegistryAosLoader } from '../../tools/utils.js';
import {
  AO_LOADER_HANDLER_ENV,
  STUB_ADDRESS,
  DEFAULT_HANDLE_OPTIONS,
} from '../../tools/constants.js';

describe('Chess Registry', async () => {
  let handle;
  let startMemory;

  before(async () => {
    const loader = await createChessRegistryAosLoader();
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
    const result = await sendMessage({
      Tags: 
        [{
            name: 'Action',
            value: 'Chess-Registry.Create-Game'
        }]
      
    });
    console.dir(result, {depth: null})
    assert(result.Messages[0]);

  });

});
