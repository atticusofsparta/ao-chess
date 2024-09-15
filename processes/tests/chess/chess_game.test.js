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

  it('should get game info', async () => {
    const result = await sendMessage({
      Tags: [
        {name: "Action", value: "Chess-Game.Get-Info"}
      ]
    }, startMemory)
    console.dir(result, {depth: null})
    assert(result.Messages[0])
    const tags = result.Messages[0].Tags;

    // Find the object where name is "Action"
    const actionTag = tags.find(tag => tag.name === "Action");

    assert(actionTag && actionTag.value === "Chess-Game.Get-Info-Notice");
    startMemory = result.Memory
  })

  it('should submit the first move', async () => {
    const moveObject = {from: 'e2', to: 'e4'}
    const result = await sendMessage({
      Data: JSON.stringify(moveObject),
      Tags: [
        { name: "Action", value: "Chess-Game.Move"},
      ]
    }, startMemory)
      console.dir(result, {depth: null})
      assert(result.Messages[0])

    const tags = result.Messages[0].Tags;

    // Find the object where name is "Player-Color"
    const errorTag = tags.find(tag => tag.name === "Action");

    // Assert that the value is "black"
    assert(errorTag && errorTag.value === "Chess-Game.Move-Notice");
      startMemory = result.Memory
  })

  it('should submit the second move', async () => {
    const moveObject = {from: 'e7', to: 'e5'}
    const result = await alternateSendMessage({
      Data: JSON.stringify(moveObject),
      Tags: [
        { name: "Action", value: "Chess-Game.Move"},
      ]
    }, startMemory)
      console.dir(result, {depth: null})
      assert(result.Messages[0])

    const tags = result.Messages[0].Tags;

    // Find the object where name is "Player-Color"
    const errorTag = tags.find(tag => tag.name === "Action");

    // Assert that the value is "black"
    assert(errorTag && errorTag.value === "Chess-Game.Move-Notice");
      startMemory = result.Memory
  })

   it('should finish a game and get the results', async () => {
    const firstMoveObject = {from: 'f1', to: 'c4'}
    const secondMoveObject = {from: 'g8', to: 'f6'}
    const thirdMoveobject = {from: 'd1', to: 'h5'}
    const fourthMoveObject = {from: 'b8', to: 'c6'}
    const lastMoveobject = {from: 'h5', to: 'f7'}
    const result = await sendMessage({
      Data: JSON.stringify(firstMoveObject),
      Tags: [
        { name: "Action", value: "Chess-Game.Move"},
      ]
    }, startMemory)
      startMemory = result.Memory

      const result2 = await alternateSendMessage({
        Data: JSON.stringify(secondMoveObject),
        Tags: [
          { name: "Action", value: "Chess-Game.Move"}
        ]
      }, startMemory)
    startMemory = result2.Memory

    const result3 = await sendMessage({
        Data: JSON.stringify(thirdMoveobject),
        Tags: [
          { name: "Action", value: "Chess-Game.Move"}
        ]
      }, startMemory)
    startMemory = result3.Memory

    const result4 = await alternateSendMessage({
        Data: JSON.stringify(fourthMoveObject),
        Tags: [
          { name: "Action", value: "Chess-Game.Move"}
        ]
      }, startMemory)
    startMemory = result4.Memory


  const result5 = await sendMessage({
        Data: JSON.stringify(lastMoveobject),
        Tags: [
          { name: "Action", value: "Chess-Game.Move"}
        ]
      }, startMemory)
    startMemory = result5.Memory
      console.dir(result5, {depth: null})
      assert(result5.Messages[2])
      const finalResult = JSON.parse(result5.Messages[2].Data)
      assert(finalResult.Winner == 'white' && finalResult.Reason == 'Checkmate' && finalResult['Final-Game-State'] == "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4")
    })
});
