import assert from 'node:assert';
import { describe, it, before } from 'node:test';
import { createChessRegistryAosLoader } from '../../tools/utils.js';
import {
  AO_LOADER_HANDLER_ENV,
  STUB_ADDRESS,
  DEFAULT_HANDLE_OPTIONS,
  ALTERNATE_HANDLE_OPTIONS
} from '../../tools/constants.js';

describe('Chess Registry', async () => {
  let handle;
  let startMemory;
  let registerMemory;

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
    }, registerMemory)
    console.dir(result, {depth: null})
    assert(result.Messages[0])
    assert(result.Messages[0].Data == "Successfully registered")
    registerMemory = result.Memory
  })

  it('should register a second player with no username', async () => {
    const result = await alternateSendMessage({
      Tags: [
        { name: "Action",
          value: "Chess-Registry.Join-Registry"
        }
      ]
    }, registerMemory)
    console.dir(result, {depth: null})
    assert(result.Messages[0])
    assert(result.Messages[0].Data == "Successfully registered")
    registerMemory = result.Memory
  })

  it('should get Player by Id', async () => {
    const array = [DEFAULT_HANDLE_OPTIONS.Id]
    const result = await sendMessage({
      Tags: [
        { name: "Action", value: "Chess-Registry.Get-Players"
        },
        {
          name: "Player-Ids",
          value: JSON.stringify(array)
        }
      ]
    }, registerMemory)
    console.dir(result, {depth: null})
    assert(result.Messages[0])
    const jsonResults = JSON.parse(result.Messages[0].Data)
    assert(jsonResults[DEFAULT_HANDLE_OPTIONS.Id].username == "Karl-Bob-Danny-Frank")
  })

  it('should set alternate user\'s username to "Volciferon"', async () => {
    const result = await alternateSendMessage({
      Tags: [
        {name: "Action", value: "Chess-Registry.Edit-Profile"},
        {name: "Username", value: "Volciferon"}
      ]
    }, registerMemory)
    console.dir(result, {depth: null})
    assert(result.Messages[0])
    assert(result.Messages[0].Data = "Username updated")
    registerMemory = result.Memory
  })

  it('should get full player list', async () => {
    const result = await sendMessage({
      Tags: 
        [{
            name: 'Action',
            value: 'Chess-Registry.Get-Players'
        }]
      
    }, registerMemory);
    console.dir(result, {depth: null})
    assert(result.Messages[0]);
    const jsonResults = JSON.parse(result.Messages[0].Data)
    assert(jsonResults[DEFAULT_HANDLE_OPTIONS.Id].username == "Karl-Bob-Danny-Frank")
    assert(jsonResults[ALTERNATE_HANDLE_OPTIONS.Id].username == "Volciferon")
    });

  it('should handle game creation', async () => {
    const result = await sendMessage({
      Tags: 
        [
          {
            name: 'Action',
            value: 'Chess-Registry.Create-Game'
          },
          {
            name: "Player-Id",
            value: DEFAULT_HANDLE_OPTIONS.Id
          },
          {
            name: "Game-Id",
            value: "Test-Game-Id"
          },
          {
            name: "Game-Name",
            value: "Test-Game-Name"
          }]
      
    });
    console.dir(result, {depth: null})
    assert(result.Spawns[0]);

  });

});
