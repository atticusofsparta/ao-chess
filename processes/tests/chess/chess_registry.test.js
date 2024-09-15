import assert from "node:assert";
import { describe, it, before } from "node:test";
import { createChessRegistryAosLoader, getHandlers } from "../../tools/utils.js";
import {
  AO_LOADER_HANDLER_ENV,
  STUB_ADDRESS,
  DEFAULT_HANDLE_OPTIONS,
  ALTERNATE_HANDLE_OPTIONS,
} from "../../tools/constants.js";

describe("Chess Registry", async () => {
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

  // it('should register player with username "Karl-Bob-Danny-Frank', async () => {
  //   const result = await sendMessage({
  //     Tags: [{
  //       name: 'Action',
  //       value: 'Chess-Registry.Join-Registry'
  //     },
  //   {
  //     name: 'Username',
  //     value: 'Karl-Bob-Danny-Frank'
  //   }]
  //   }, registerMemory)
  //   console.dir(result, {depth: null})
  //   assert(result.Messages[0])
  //   assert(result.Messages[0].Data == "Successfully registered")
  //   registerMemory = result.Memory
  // })

  // it('should register a second player with no username', async () => {
  //   const result = await alternateSendMessage({
  //     Tags: [
  //       { name: "Action",
  //         value: "Chess-Registry.Join-Registry"
  //       }
  //     ]
  //   }, registerMemory)
  //   console.dir(result, {depth: null})
  //   assert(result.Messages[0])
  //   assert(result.Messages[0].Data == "Successfully registered")
  //   registerMemory = result.Memory
  // })

  // it('should set alternate user\'s username to "Volciferon"', async () => {
  //   const result = await alternateSendMessage({
  //     Tags: [
  //       {name: "Action", value: "Chess-Registry.Edit-Profile"},
  //       {name: "Username", value: "Volciferon"}
  //     ]
  //   }, registerMemory)
  //   console.dir(result, {depth: null})
  //   assert(result.Messages[0])
  //   assert(result.Messages[0].Data = "Username updated")
  //   registerMemory = result.Memory
  // })

  it("should handle game creation", async () => {
    const result = await sendMessage({
      Id: "".padEnd(43,"create-game-id"),
      Tags: [
        {
          name: "Action",
          value: "Chess-Registry.Create-Game",
        },
        {
          name: "Player-Id",
          value: DEFAULT_HANDLE_OPTIONS.Id,
        },
        {
          name: "Game-Id",
          value: DEFAULT_HANDLE_OPTIONS.Id,
        },
        {
          name: "Game-Name",
          value: "Test-Game-Name",
        },
      ],
    });
   
    const handlers = await getHandlers(sendMessage, result.Memory)
    console.dir(handlers, {depth: null})
    assert(result.Spawns[0]);
    registerMemory = result.Memory;
    const continueing = await sendMessage({
      Owner: "".padEnd(43, "7"),
      From: "".padEnd(43, "7"),
      Tags: [
        { name: 'X-Create-Game-Id', value: "".padEnd(43,"create-game-id")},

      ]
    }, result.Memory)
   console.dir(continueing, { depth: null });
   const handlers2 = await getHandlers(sendMessage, continueing.Memory)
   console.dir(handlers2, {depth: null})
  });

  // it("should get all games", async () => {
  //   const result = await sendMessage(
  //     {
  //       Tags: [
  //         { name: "Action", value: "Chess-Registry.Get-Games" },
  //         { name: "Type", value: "Live" },
  //       ],
  //     },
  //     registerMemory,
  //   );
  //   console.dir(result, { depth: null });
  //   assert(result.Messages[0]);
  //   registerMemory = result.Memory;
  // });

  // it("should join a player to the game", async () => {
  //   const result = await sendMessage(
  //     {
  //       Tags: [
  //         { name: "Action", value: "Chess-Registry.Join-Game-Notice" },
  //         { name: "Player", value: ALTERNATE_HANDLE_OPTIONS.Id },
  //         { name: "Player-Color", value: "black" },
  //       ],
  //     },
  //     registerMemory,
  //   );
  //   console.dir(result, { depth: null });
  //   const tags = result.Messages[0].Tags;

  //   // Find the object where name is "Player-Color"
  //   const actionTag = tags.find((tag) => tag.name === "Action");

  //   // Assert that the value is "black"
  //   assert(
  //     actionTag && actionTag.value != "Invalid-Chess-Registry.Join-Game-Notice",
  //   );
  //   registerMemory = result.Memory;
  // });

  // it("should join a second to the game", async () => {
  //   const result = await sendMessage(
  //     {
  //       Tags: [
  //         { name: "Action", value: "Chess-Registry.Join-Game" },
  //         { name: "Player", value: DEFAULT_HANDLE_OPTIONS.Id },
  //         { name: "Player-Color", value: "white" },
  //       ],
  //     },
  //     registerMemory,
  //   );
  //   console.dir(result, { depth: null });
  //   const tags = result.Messages[0].Tags;

  //   // Find the object where name is "Player-Color"
  //   const actionTag = tags.find((tag) => tag.name === "Action");

  //   // Assert that the value is "black"
  //   assert(
  //     actionTag && actionTag.value != "Invalid-Chess-Registry.Join-Game-Notice",
  //   );
  //   registerMemory = result.Memory;
  // });

  // it("should get the specific, joined game", async () => {
  //   const result = await sendMessage(
  //     {
  //       Tags: [
  //         { name: "Action", value: "Chess-Registry.Get-Games" },
  //         {
  //           name: "Game-Ids",
  //           value: JSON.stringify([DEFAULT_HANDLE_OPTIONS.Id]),
  //         },
  //       ],
  //     },
  //     registerMemory,
  //   );
  //   console.dir(result, { depth: null });
  //   const tags = result.Messages[0].Tags;

  //   // Find the object where name is "Player-Color"
  //   const actionTag = tags.find((tag) => tag.name === "Action");

  //   // Assert that the value is "black"
  //   assert(
  //     actionTag && actionTag.value != "Invalid-Chess-Registry.Get-Game-Notice",
  //   );
  //   registerMemory = result.Memory;
  // });

  // it("should get Player by Id", async () => {
  //   const array = [DEFAULT_HANDLE_OPTIONS.Id];
  //   const result = await sendMessage(
  //     {
  //       Tags: [
  //         { name: "Action", value: "Chess-Registry.Get-Players" },
  //         {
  //           name: "Player-Ids",
  //           value: JSON.stringify(array),
  //         },
  //       ],
  //     },
  //     registerMemory,
  //   );
  //   console.dir(result, { depth: null });
  //   assert(result.Messages[0]);
  //   const jsonResults = JSON.parse(result.Messages[0].Data);
  //   assert(jsonResults[DEFAULT_HANDLE_OPTIONS.Id]);
  // });

  // it("should update module-id", async () => {
  //   const result = await sendMessage(
  //     {
  //       Tags: [
  //         { name: "Action", value: "Chess-Registry.Update-Game-Module-Id" },
  //         { name: "Module-Id", value: "7" },
  //       ],
  //     },
  //     registerMemory,
  //   );
  //   console.dir(result, { depth: null });
  //   assert(!result.Messages[0].Error);
  //   registerMemory = result.Memory;
  // });

  // it("should handle gameResults", async () => {
  //   const result = await sendMessage(
  //     {
  //       Tags: [{ name: "Action", value: "Chess-Registry.Game-Result-Notice" }],
  //       Data: JSON.stringify({
  //         Winner: "white",
  //         Reason: "Checkmate",
  //         "Final-Game-State":
  //           "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
  //       }),
  //     },
  //     registerMemory,
  //   );
  //   console.dir(result, { depth: null });
  //   registerMemory = result.Memory;
  // });

  // it("should get full player list", async () => {
  //   const result = await sendMessage(
  //     {
  //       Tags: [
  //         {
  //           name: "Action",
  //           value: "Chess-Registry.Get-Players",
  //         },
  //       ],
  //     },
  //     registerMemory,
  //   );
  //   console.dir(result, { depth: null });
  //   assert(result.Messages[0]);
  //   const jsonResults = JSON.parse(result.Messages[0].Data);
  //   assert(jsonResults[DEFAULT_HANDLE_OPTIONS.Id]);
  //   assert(jsonResults[ALTERNATE_HANDLE_OPTIONS.Id]);
  // });
});
