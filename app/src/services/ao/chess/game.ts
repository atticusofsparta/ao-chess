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

export type ChatMessage = {
  sender: string;
  message: string;
  timestamp: number;
};

export interface AoChessGameReadable {
  getFEN(): Promise<string>;
  getPGN(): Promise<string>;
  getInfo(): Promise<{
    ChessRegistryId: string;
    Players: ChessGamePlayerList;
    fen: string;
    chat: ChatMessage[];
  }>;
}

export interface AoChessGameWritable {
  joinGame(): Promise<AoMessageResult>;
  joinWagerGame(p: { address: string }): Promise<AoMessageResult>;
  move(p: {
    move: { to: string; from: string; promotion: string } | 'surrender';
  }): Promise<AoMessageResult>;
  sendMessage(p: { message: string }): Promise<AoMessageResult>;
}

export class ChessGame {
  static init(): ChessGameReadable;
  static init(
    config: Required<ProcessConfiguration> & { signer?: undefined },
  ): ChessGameReadable;
  static init({
    signer,
    ...config
  }: WithSigner<Required<ProcessConfiguration>>): ChessGameWritable;
  static init(
    config?: OptionalSigner<Required<ProcessConfiguration>> & {
      chessRegistryId?: string;
      wagerTokenId?: string;
      wagerTokenAmount?: number;
      gameId?: string;
    },
  ): ChessGameReadable | ChessGameWritable {
    if (config && config.signer) {
      const { signer, ...rest } = config;
      return new ChessGameWritable({
        ...rest,
        signer,
      } as any);
    }
    const readConfig = config as any;
    return new ChessGameReadable({
      processId: readConfig?.processId,
      process: readConfig?.process,
    } as any);
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
    fen: string;
    chat: ChatMessage[];
  }> {
    const info = await this.process.read<{
      ChessRegistryId: string;
      Players: ChessGamePlayerList;
      fen: string;
      chat: ChatMessage[];
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
        { name: 'Recipient', value: this.gameId },
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

  async sendMessage({
    message,
  }: {
    message: string;
  }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Chess-Game.Send-Message' }],
      data: message,
      signer: this.signer,
    });
  }
}
