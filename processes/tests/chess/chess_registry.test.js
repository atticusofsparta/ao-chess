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

  it('should register player with username "Karl-Bob-Danny-Frank', async () => {
    const result = await sendMessage({
      Tags: [{
        name: 'Action',
        value: 'Chess-Registry.Join-Registry'
      },
    {
      name: 'Username',
      value: 'Karl-Bob-Danny-Frank'
    }]
    })
    console.dir(result, {depth: null})
    assert(result.Messages[0])
    assert(result.Messages[0].Data == "Successfully registered")
  })

  it('should get player list', async () => {
    const result = await sendMessage({
      Tags: 
        [{
            name: 'Action',
            value: 'Chess-Registry.Get-Players'
        }]
      
    });
    console.dir(result, {depth: null})
    assert(result.Messages[0]);
    const jsonResults = JSON.parse(result.Messages[0].Data)
    console.dir(jsonResults, {depth: null})
    assert(jsonResults.username == "Karl-Bob-Danny-Frank")
    });

  // it('should handle game creation', async () => {
  //   const result = await sendMessage({
  //     Tags: 
  //       [{
  //           name: 'Action',
  //           value: 'Chess-Registry.Create-Game'
  //       }]
      
  //   });
  //   console.dir(result, {depth: null})
  //   assert(result.Messages[0]);

  // });

});
