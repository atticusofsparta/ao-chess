import {
  InvalidContractConfigurationError,
  OptionalSigner,
  ProcessConfiguration,
  isProcessConfiguration,
  isProcessIdConfiguration,
} from '@ar.io/sdk';
import { PROFILE_REGISTRY_ID } from '@src/constants';

import { AOProcess } from '../process';
import { AoProfile } from './Profile';

export type ProfileAssociation = {
  ProfileId: string;
  CallerAddress: string;
  // clarify this type (role)
  Role: string;
};

export type ProfileUpdateProps = {
  username?: string;
  profileImage?: string | Blob;
  coverImage?: string | Blob;
  description?: string;
  displayName?: string;
};

export type ProfileCreateProps = ProfileUpdateProps & {};

export interface AoProfileRegistryReadable {
  getProfilesByAddress({
    address,
  }: {
    address: string;
  }): Promise<ProfileAssociation[]>;
  getMetadataByProfileIds({
    profileIds,
  }: {
    profileIds: string[];
  }): Promise<AoProfile & { ProfileId: string }[]>;
}

export class ProfileRegistry {
  static init(): AoProfileRegistryReadable;
  static init({ processId }: { processId: string }): AoProfileRegistryReadable;
  static init(
    config?: OptionalSigner<ProcessConfiguration>,
  ): AoProfileRegistryReadable {
    return new ProfileRegistryReadable(config);
  }
}

export class ProfileRegistryReadable implements AoProfileRegistryReadable {
  protected process: AOProcess;

  constructor(config?: ProcessConfiguration) {
    if (!config) {
      this.process = new AOProcess({
        processId: PROFILE_REGISTRY_ID,
      });
    } else if (isProcessConfiguration(config)) {
      this.process = config.process as any as AOProcess;
    } else if (isProcessIdConfiguration(config)) {
      this.process = new AOProcess({
        processId: config.processId,
      });
    } else {
      throw new InvalidContractConfigurationError();
    }
  }

  async getProfilesByAddress({
    address,
  }: {
    address: string;
  }): Promise<ProfileAssociation[]> {
    return this.process.read<ProfileAssociation[]>({
      tags: [{ name: 'Action', value: 'Get-Profiles-By-Delegate' }],
      data: JSON.stringify({ Address: address }),
    });
  }

  async getMetadataByProfileIds({
    profileIds,
  }: {
    profileIds: string[];
  }): Promise<AoProfile & { ProfileId: string }[]> {
    return this.process.read<AoProfile & { ProfileId: string }[]>({
      tags: [{ name: 'Action', value: 'Get-Metadata-By-Profile-Ids' }],
      data: JSON.stringify({ ProfileIds: profileIds }),
    });
  }
}
