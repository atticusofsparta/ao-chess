import assert from 'node:assert';
import { describe, it, before } from 'node:test';
import { createChessGameAosLoader } from '../../tools/utils.js';
import {
  AO_LOADER_HANDLER_ENV,
  STUB_ADDRESS,
  DEFAULT_HANDLE_OPTIONS,
  ALTERNATE_HANDLE_OPTIONS
} from '../../tools/constants.js';

describe('Chess Game', async () => {
  let handle;
  let startMemory;

  before(async () => {
    const loader = await createChessGameAosLoader();
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

    async function alternateSendMessage(options = {}, mem = startMemory) {
    return handle(
      mem,
      {
        ...ALTERNATE_HANDLE_OPTIONS,
        ...options,
      },
      AO_LOADER_HANDLER_ENV,
    );
  }


  it('should receive a response', async () => {
    const result = await sendMessage({
      Tags: [
        { name: "Action", value: "Chess-Game.Test-Responsiveness"}
      ]
    })
    // console.dir(result, {depth: null})
  })

  it('should handle game join', async () => {
    const result = await sendMessage({
      Tags: 
        [{
            name: 'Action',
            value: 'Chess-Game.Join-Game'
        }]
      
    });
    console.dir(result, {depth: null})
    assert(result.Messages[0]);
    startMemory = result.Memory
  });

  it('should error on joining game again', async () => {
    const result = await sendMessage({
      Tags: [
        {name: "Action", value: "Chess-Game.Join-Game"}
      ]
    }, startMemory)
    console.dir(result, {depth: null})
    assert(result.Messages[0])

    const tags = result.Messages[0].Tags;

    // Find the object where name is "Player-Color"
    const errorTag = tags.find(tag => tag.name === "Error");

    // Assert that the value is "black"
    assert(errorTag && errorTag.value === "Chess-Game.Join-Game-Error");
    startMemory = result.Memory
  })

  it('should join a second player', async () => {
    const result = await alternateSendMessage({
      Tags: [
        {name: "Action", value: "Chess-Game.Join-Game"}
      ]
    }, startMemory)
    // console.dir(result, {depth: null})
    assert(result.Messages[0])
    const tags = result.Messages[0].Tags;

    // Find the object where name is "Player-Color"
    const playerColorTag = tags.find(tag => tag.name === "Player-Color");

    // Assert that the value is "black"
    assert(playerColorTag && playerColorTag.value === "black");
    startMemory = result.Memory
  })

  

});
