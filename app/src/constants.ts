import { DEFAULT_SCHEDULER_ID } from '@ar.io/sdk';
import { connect } from '@permaweb/aoconnect';
import Arweave from 'arweave';
import arweaveGraphql from 'arweave-graphql';
import winston, { createLogger, format, transports } from 'winston';

import { Logger } from '../types/index.js';

export const llamaTokenId = 'pazXumQI-HPH7iFGfTC-4_7biSnqz_U67oFAGry5zUY'
export const PROFILE_REGISTRY_ID =
  'SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY';

export const CHESS_REGISTRY_ID = 'SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY';
export const ARWEAVE_HOST = 'arweave.net';
export const NETWORK_DEFAULTS = {
  AO: {
    CU_URL: 'https://cu.ao-testnet.xyz', // ao public cu: https://cu.ao-testnet.xyz
    MU_URL: 'https://mu.ao-testnet.xyz',
    SCHEDULER: DEFAULT_SCHEDULER_ID,
  },
  ARWEAVE: {
    HOST: ARWEAVE_HOST,
    PORT: 443,
    PROTOCOL: 'https',
  },
};

export const DEFAULT_AO = connect(NETWORK_DEFAULTS.AO);
export const DEFAULT_ARWEAVE = Arweave.init({});

export const DEFAULT_GRAPHQL_CLIENT = arweaveGraphql(`${ARWEAVE_HOST}/graphql`);

export const ARNS_TX_ID_REGEX = new RegExp('^[a-zA-Z0-9\\-_s+]{43}$');

export class DefaultLogger implements Logger {
  private logger: winston.Logger;
  constructor({
    level = 'info',
    logFormat = 'simple',
  }: {
    level?: 'info' | 'debug' | 'error' | 'none' | undefined;
    logFormat?: 'simple' | 'json' | undefined;
  } = {}) {
    this.logger = createLogger({
      level,
      silent: level === 'none',
      format: getLogFormat(logFormat),
      transports: [new transports.Console()],
    });
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  info(message: string, ...args: any[]) {
    this.logger.info(message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.logger.warn(message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.logger.error(message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.logger.debug(message, ...args);
  }

  setLogLevel(level: string) {
    this.logger.level = level;
  }

  setLogFormat(logFormat: string) {
    this.logger.format = getLogFormat(logFormat);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

function getLogFormat(logFormat: string) {
  return format.combine(
    format((info) => {
      if (info.stack && info.level !== 'error') {
        delete info.stack;
      }
      return info;
    })(),
    format.errors({ stack: true }), // Ensure errors show a stack trace
    format.timestamp(),
    logFormat === 'json' ? format.json() : format.simple(),
  );
}
