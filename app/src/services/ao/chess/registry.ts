import {
  AoSigner,
  InvalidContractConfigurationError,
  OptionalSigner,
  ProcessConfiguration,
  WithSigner,
  createAoSigner,
  isProcessConfiguration,
  isProcessIdConfiguration,
} from '@ar.io/sdk';
import { CHESS_REGISTRY_ID } from '@src/constants';

import { AOProcess } from '../process';

export type LiveChessGame = {
  startTimestamp: number;
  players: Record<'white' | 'black', string>;
  createdBy: string;
  spawnedWith: string;
  gameName: string;
};

export type HistoricalChessGame = {
  startTimestamp: number;
  endTimestamp: number;
  resolution: 'surrender' | 'stalemate' | 'checkmate';
  players: Record<'white' | 'black', { id: string; score: number }>;
  createdBy: string;
  spawnedWith: string;
  gameName: string;
};

export type ChessPlayerStats = {
  elo: number;
  wins: number;
  losses: number;
  stalemates: number;
  surrenders: number;
};
export type ChessPlayer = {
  stats: ChessPlayerStats;
  gameHistory: Record<string, HistoricalChessGame | LiveChessGame>;
};

export type RegistryPlayerList = Record<string, ChessPlayer>;

export interface AoChessRegistryReadable {
  getGames(p: {
    gameIds?: string[];
    playerId?: string;
    typeFilter?: 'Live' | 'Historical';
  }): Promise<{
    Live: Record<string, LiveChessGame>;
    Historical: Record<string, HistoricalChessGame>;
  }>;
  getPlayers(p: { playerIds: string[] }): Promise<
    Record<
      string,
      {
        stats: ChessPlayerStats;
        gameHistory: string[];
      }
    >
  >;
}

export interface AoChessRegistryWritable {
  createGame(p: {
    gameName: string;
    wagerAmount: number;
    wagerToken: string;
  }): Promise<string>;
}

export class ChessRegistry {
  static init(): AoChessRegistryReadable;
  static init(
    config: Required<ProcessConfiguration> & { signer?: undefined },
  ): AoChessRegistryReadable;
  static init({
    signer,
    ...config
  }: WithSigner<Required<ProcessConfiguration>>): AoChessRegistryWritable;
  static init(
    config?: OptionalSigner<ProcessConfiguration>,
  ): AoChessRegistryReadable | AoChessRegistryWritable {
    if (config && config.signer) {
      const { signer, ...rest } = config;
      return new ChessRegistryWritable({
        ...rest,
        signer,
      } as any);
    }
    return new ChessRegistryReadable(config);
  }
}

export class ChessRegistryReadable implements AoChessRegistryReadable {
  protected process: AOProcess;

  constructor(config?: ProcessConfiguration) {
    if (
      config &&
      (isProcessIdConfiguration(config) || isProcessConfiguration(config))
    ) {
      if (isProcessConfiguration(config)) {
        this.process = config.process as any as AOProcess;
      } else if (isProcessIdConfiguration(config)) {
        this.process = new AOProcess({
          processId: config.processId,
        });
      } else {
        throw new InvalidContractConfigurationError();
      }
    } else {
      this.process = new AOProcess({
        processId: CHESS_REGISTRY_ID,
      });
    }
  }

  async getGames(p?: {
    gameIds?: string[] | undefined;
    playerId?: string | undefined;
    typeFilter?: 'Live' | 'Historical' | undefined;
    spawnedWith?: string | undefined;
  }): Promise<{
    Live: Record<string, LiveChessGame>;
    Historical: Record<string, HistoricalChessGame>;
  }> {
    const gameIdsTag = p?.gameIds
      ? { name: 'Game-Ids', value: JSON.stringify(p.gameIds) }
      : undefined;
    const playerIdTag = p?.playerId
      ? { name: 'Player-Id', value: p.playerId }
      : undefined;
    const typeFilterTag = p?.typeFilter
      ? { name: 'Type', value: p.typeFilter }
      : undefined;
    const spawnedWithTag = p?.spawnedWith
      ? { name: 'Spawned-With', value: p.spawnedWith }
      : undefined;
    return this.process.read({
      tags: [
        { name: 'Action', value: 'Chess-Registry.Get-Games' },
        gameIdsTag,
        playerIdTag,
        typeFilterTag,
        spawnedWithTag,
      ].filter((t) => t !== undefined) as any,
    });
  }

  async getPlayers({
    playerIds,
  }: {
    playerIds: string[];
  }): Promise<
    Record<string, { stats: ChessPlayerStats; gameHistory: string[] }>
  > {
    return this.process.read({
      tags: [
        { name: 'Action', value: 'Chess-Registry.Get-Players' },
        { name: 'Player-Ids', value: JSON.stringify(playerIds) },
      ],
    });
  }
}

export class ChessRegistryWritable
  extends ChessRegistryReadable
  implements AoChessRegistryWritable
{
  private signer: AoSigner;

  constructor({
    signer,
    ...config
  }: WithSigner<Required<ProcessConfiguration>>) {
    super(config);
    this.signer = createAoSigner(signer);
  }

  async createGame({
    gameName,
    wagerAmount,
    wagerToken,
  }: {
    gameName: string;
    wagerAmount: number;
    wagerToken: string;
  }): Promise<string> {
    console.log(this.process);
    const createGameRes = await this.process.send({
      tags: [
        { name: 'Action', value: 'Chess-Registry.Create-Game' },
        { name: 'Game-Name', value: gameName },
        { name: 'Wager-Amount', value: wagerAmount.toString() },
        { name: 'Wager-Token', value: wagerToken },
      ],
      signer: this.signer,
    });
    let gameId: string | undefined = undefined;
    let retries = 0;
    let maxRetries = 10;
    while (!gameId && retries <= maxRetries) {
      retries++;
      const games = await this.getGames({ spawnedWith: createGameRes.id });
      console.log(games);
      if (Object.keys(games.Live).length) {
        gameId = Object.entries(games.Live).find(
          ([, game]) => game.spawnedWith === createGameRes.id,
        )?.[0];
        if (!gameId) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }
    if (!gameId) {
      throw new Error('Game creation failed');
    }
    return gameId;
  }
}
