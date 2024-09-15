import {
  AoMessageResult,
  AoSigner,
  InvalidContractConfigurationError,
  OptionalSigner,
  ProcessConfiguration,
  WithSigner,
  createAoSigner,
  isProcessConfiguration,
  isProcessIdConfiguration,
} from '@ar.io/sdk';

import { AOProcess } from '../process';

export type ChessGamePlayer = {
  id: string;
  wagerPaid?: boolean;
};

export type ChessGamePlayerList = {
  wager?: {
    amount: number;
    token: string;
  };
  white: ChessGamePlayer;
  black: ChessGamePlayer;
};

export interface AoChessGameReadable {
  getFEN(): Promise<string>;
  getPGN(): Promise<string>;
  getInfo(): Promise<{
    ChessRegistryId: string;
    Players: ChessGamePlayerList;
    Fen: string;
  }>;
}

export interface AoChessGameWritable {
  joinGame(): Promise<AoMessageResult>;
  joinWagerGame(p: { address: string }): Promise<AoMessageResult>;
  move(p: {
    move: { to: string; from: string; promotion: string } | 'surrender';
  }): Promise<AoMessageResult>;
}

export class ChessGame {
  static init(
    config: Required<ProcessConfiguration> & { signer?: undefined },
  ): ChessGameReadable;
  static init({
    signer,
    ...config
  }: WithSigner<Required<ProcessConfiguration>>): ChessGameWritable;
  static init({
    signer,
    chessRegistryId,
    wagerTokenId,
    wagerTokenAmount,
    gameId,
    ...config
  }: OptionalSigner<Required<ProcessConfiguration>> & {
    chessRegistryId?: string;
    wagerTokenId?: string;
    wagerTokenAmount?: number;
    gameId?: string;
  }): ChessGameReadable | ChessGameWritable {
    // ao supported implementation
    if (isProcessConfiguration(config) || isProcessIdConfiguration(config)) {
      if (!signer) {
        return new ChessGameReadable(config);
      } else if (
        chessRegistryId &&
        wagerTokenId &&
        wagerTokenAmount &&
        gameId
      ) {
        return new ChessGameWritable({
          signer,
          chessRegistryId,
          wagerTokenId,
          wagerTokenAmount,
          gameId,
          ...config,
        });
      }
    }

    throw new InvalidContractConfigurationError();
  }
}

export class ChessGameReadable implements AoChessGameReadable {
  protected process: AOProcess;

  constructor(config: ProcessConfiguration) {
    if (isProcessConfiguration(config)) {
      this.process = config.process as any as AOProcess;
    } else if (isProcessIdConfiguration(config)) {
      this.process = new AOProcess({
        processId: config.processId,
      });
    } else {
      throw new InvalidContractConfigurationError();
    }
  }

  async getInfo(): Promise<{
    ChessRegistryId: string;
    Players: ChessGamePlayerList;
    Fen: string;
  }> {
    const info = await this.process.read<{
      ChessRegistryId: string;
      Players: ChessGamePlayerList;
      Fen: string;
    }>({
      tags: [{ name: 'Action', value: 'Chess-Game.Get-Info' }],
    });

    return info;
  }

  async getFEN(): Promise<string> {
    const fen = await this.process.read<string>({
      tags: [{ name: 'Action', value: 'Chess-Game.Get-FEN' }],
    });

    return fen;
  }

  async getPGN(): Promise<string> {
    const pgn = await this.process.read<string>({
      tags: [{ name: 'Action', value: 'Chess-Game.Get-PGN' }],
    });

    return pgn;
  }
}

export class ChessGameWritable
  extends ChessGameReadable
  implements AoChessGameWritable
{
  private signer: AoSigner;
  readonly chessRegistryId: string;
  readonly wagerTokenId: string;
  readonly wagerTokenAmount: number;
  readonly gameId: string;

  private wagerProcess: AOProcess;

  constructor({
    signer,
    chessRegistryId,
    wagerTokenId,
    wagerTokenAmount,
    gameId,
    ...config
  }: WithSigner<Required<ProcessConfiguration>> & {
    chessRegistryId: string;
    wagerTokenId: string;
    wagerTokenAmount: number;
    gameId: string;
  }) {
    super(config);
    this.chessRegistryId = chessRegistryId;
    this.wagerTokenId = wagerTokenId;
    this.wagerTokenAmount = wagerTokenAmount;
    this.gameId = gameId;
    this.wagerProcess = new AOProcess({
      processId: this.wagerTokenId,
    });
    this.signer = createAoSigner(signer);
  }

  async joinGame(): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Chess-Game.Join-Game' }],
      signer: this.signer,
    });
  }

  async joinWagerGame({
    address,
  }: {
    address: string;
  }): Promise<AoMessageResult> {
    return this.wagerProcess.send({
      tags: [
        { name: 'Action', value: 'Transfer' },
        { name: 'Quantity', value: this.wagerTokenAmount.toString() },
        { name: 'X-Action', value: 'Chess-Game.Join-Wager-Game' },
        { name: 'X-Game-Id', value: this.gameId },
        { name: 'X-Player-Id', value: address },
      ],
      signer: this.signer,
    });
  }

  async move({
    move,
  }: {
    move: { to: string; from: string; promotion: string } | 'surrender';
  }): Promise<AoMessageResult & { result: string }> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Chess-Game.Move' }],
      data: JSON.stringify(move),
      signer: this.signer,
    }) as Promise<AoMessageResult & { result: string }>;
  }
}
