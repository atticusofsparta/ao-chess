import {
  AOS_MODULE_ID,
  AoClient,
  AoMessageResult,
  AoSigner,
  ContractSigner,
  DEFAULT_SCHEDULER_ID,
  InvalidContractConfigurationError,
  OptionalSigner,
  ProcessConfiguration,
  WithSigner,
  createAoSigner,
  isProcessConfiguration,
  isProcessIdConfiguration,
} from '@ar.io/sdk';
import { DEFAULT_AO, PROFILE_REGISTRY_ID } from '@src/constants';

import { AOProcess } from '../process';
import { ProfileRegistry, ProfileUpdateProps } from './ProfileRegistry';
import LuaProfileCode from './profile-process.lua';

export type AoProfile = {
  UserName: string;
  ProfileImage: string;
  CoverImage: string;
  Description: string;
  DisplayName: string;
  Version: string;
  DataUpdated: number;
  DataCreated: number;
};

export type AoProfileAsset = {
  Quantity: number;
  Id: string;
};

export type AoProfileCollection = {
  Id: string;
  Name: string;
  SortOrder: number;
};

export type ProfileInfoResponse = {
  Profile: AoProfile;
  Assets: AoProfileAsset[];
  Collections: AoProfileCollection[];
  Owner: string;
};

export interface AoProfileRead {
  getInfo(): Promise<ProfileInfoResponse>;
  getProject({ name }: { name: string }): Promise<any>;
  getAllProjects(): Promise<any>;
}

export interface AoProfileWrite extends AoProfileRead {
  updateProfile(p: ProfileUpdateProps): Promise<AoMessageResult>;
  transfer(p: { to: string }): Promise<AoMessageResult>;

  addUploadedAsset(p: {
    id: string;
    quantity: number;
  }): Promise<AoMessageResult>;
  addCollection(p: { id: string; name: string }): Promise<AoMessageResult>;
  sortCollections(p: { ids: string[] }): Promise<AoMessageResult>;
  runAction(p: {
    target: string;
    action: string;
    input: string;
    tags: Record<string, any>;
  }): Promise<AoMessageResult>;
  setProfileRegistry(p: { registryId: string }): Promise<AoMessageResult>;

  addProject(p: {
    name: string;
    version: string;
    location: string;
    transactionId: string;
  }): Promise<AoMessageResult>;
  addVersion(p: {
    name: string;
    version: string;
    location: string;
    transactionId: string;
  }): Promise<AoMessageResult>;
  updateVersion(p: {
    name: string;
    version: string;
    location: string;
    transactionId: string;
  }): Promise<AoMessageResult>;
  removeVersion(p: { name: string; version: string }): Promise<AoMessageResult>;
}

export class Profile {
  static init(
    config: Required<ProcessConfiguration> & { signer?: undefined },
  ): AoProfileRead;
  static init({
    signer,
    ...config
  }: WithSigner<Required<ProcessConfiguration>>): AoProfileWrite;
  static init({
    signer,
    ...config
  }: OptionalSigner<Required<ProcessConfiguration>>):
    | AoProfileRead
    | AoProfileWrite {
    // ao supported implementation
    if (isProcessConfiguration(config) || isProcessIdConfiguration(config)) {
      if (!signer) {
        return new ProfileReadable(config);
      }
      return new ProfileWritable({ signer, ...config });
    }

    throw new InvalidContractConfigurationError();
  }
}

export class ProfileReadable implements AoProfileRead {
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

  async getInfo(): Promise<ProfileInfoResponse> {
    const info = await this.process.read<ProfileInfoResponse>({
      tags: [{ name: 'Action', value: 'Info' }],
    });
    return info;
  }

  async getProject({ name }: { name: string }): Promise<any> {
    return this.process.read({
      tags: [{ name: 'Action', value: 'Get-Project' }],
      data: JSON.stringify({
        Domain: name,
      }),
    });
  }

  async getAllProjects(): Promise<any> {
    return this.process.read({
      tags: [{ name: 'Action', value: 'Get-All-Projects' }],
    });
  }
}

export class ProfileWritable extends ProfileReadable implements AoProfileWrite {
  private signer: AoSigner;

  constructor({
    signer,
    ...config
  }: WithSigner<Required<ProcessConfiguration>>) {
    super(config);
    this.signer = createAoSigner(signer);
  }

  async updateProfile(p: ProfileUpdateProps): Promise<AoMessageResult> {
    // remove keys with empty string
    return this.process.send({
      tags: [{ name: 'Action', value: 'Update-Profile' }],
      data: JSON.stringify({
        UserName: p.username,
        ProfileImage: p.profileImage,
        CoverImage: p.coverImage,
        Description: p.description,
        DisplayName: p.displayName,
      }),
      signer: this.signer,
    });
  }
  transfer(p: { to: string }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [
        { name: 'Action', value: 'Transfer' },
        { name: 'Target', value: p.to },
      ],

      signer: this.signer,
    });
  }
  addUploadedAsset(p: {
    id: string;
    quantity: number;
  }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Add-Uploaded-Asset' }],
      data: JSON.stringify({
        Id: p.id,
        Quantity: p.quantity,
      }),
      signer: this.signer,
    });
  }

  addCollection(p: { id: string; name: string }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Add-Collection' }],
      data: JSON.stringify({
        Id: p.id,
        Name: p.name,
      }),
      signer: this.signer,
    });
  }

  sortCollections(p: { ids: string[] }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Sort-Collections' }],
      data: JSON.stringify({
        Ids: p.ids,
      }),
      signer: this.signer,
    });
  }

  runAction(p: {
    target: string;
    action: string;
    input: string;
    tags: Record<string, any>;
  }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Run-Action' }],
      data: JSON.stringify({
        Target: p.target,
        Action: p.action,
        Input: p.input,
        Tags: p.tags,
      }),
      signer: this.signer,
    });
  }

  setProfileRegistry(p: { registryId: string }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Set-Profile-Registry' }],
      data: JSON.stringify({
        RegistryId: p.registryId,
      }),
      signer: this.signer,
    });
  }

  async addProject(p: {
    name: string;
    version: string;
    location: string;
    transactionId: string;
  }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Add-Project' }],
      data: JSON.stringify({
        Domain: p.name,
        Version: p.version,
        Location: p.location,
        TransactionId: p.transactionId,
      }),
      signer: this.signer,
    });
  }

  async addVersion(p: {
    name: string;
    version: string;
    location: string;
    transactionId: string;
  }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Add-Version' }],
      data: JSON.stringify({
        Domain: p.name,
        Version: p.version,
        Location: p.location,
        TransactionId: p.transactionId,
      }),
      signer: this.signer,
    });
  }

  async updateVersion(p: {
    name: string;
    version: string;
    location: string;
    transactionId: string;
  }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Update-Version' }],
      data: JSON.stringify({
        Domain: p.name,
        Version: p.version,
        Location: p.location,
        TransactionId: p.transactionId,
      }),
      signer: this.signer,
    });
  }

  removeVersion(p: {
    name: string;
    version: string;
  }): Promise<AoMessageResult> {
    return this.process.send({
      tags: [{ name: 'Action', value: 'Remove-Version' }],
      data: JSON.stringify({
        Domain: p.name,
        Version: p.version,
      }),
      signer: this.signer,
    });
  }
}

export async function spawnProfile({
  profileSettings,
  address,
  signer,
  registryId = PROFILE_REGISTRY_ID,
  ao = DEFAULT_AO,
}: {
  profileSettings: ProfileUpdateProps;
  address: string;
  signer: ContractSigner;
  registryId?: string;
  ao?: AoClient;
}): Promise<string> {
  const profileRegistry = ProfileRegistry.init({ processId: registryId });
  const aoSigner = await createAoSigner(signer);
  const processId = await ao.spawn({
    scheduler: DEFAULT_SCHEDULER_ID,
    module: AOS_MODULE_ID,
    signer: aoSigner as any,
    tags: [{ name: 'Profile-Registry-Id', value: registryId }],
  });

  const aosClient = new AOProcess({
    processId,
    ao,
  });

  await aosClient.send({
    tags: [{ name: 'Action', value: 'Eval' }],
    data: LuaProfileCode,
    signer: aoSigner,
  });

  const profile = Profile.init({
    processId,
    signer,
  }) as ProfileWritable;
  const updateRes = await profile.updateProfile(profileSettings);

  // poll the registry for the profile id
  let registered = false;
  let attempts = 0;
  while (!registered && attempts < 5) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await profileRegistry.getProfilesByAddress({
      address: address,
    });

    registered = res.some((p) => p.ProfileId === processId);
    attempts++;
  }

  return processId;
}
