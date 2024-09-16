import { AoSigner } from '@ar.io/sdk';
import { CHESS_REGISTRY_ID } from '@src/constants';
import { create } from 'zustand';

import {
  AoChessRegistryReadable,
  AoChessRegistryWritable,
  ChessRegistry,
  ChessRegistryReadable,
  ChessRegistryWritable,
} from '../ao/chess/registry';
import {
  AoProfile,
  AoProfileRead,
  AoProfileWrite,
  Profile,
  ProfileInfoResponse,
} from '../ao/profiles/Profile';
import {
  AoProfileRegistryReadable,
  ProfileRegistry,
} from '../ao/profiles/ProfileRegistry';

export type GlobalState = {
  // modal states
  signing: boolean;
  showProfileMenu: boolean;
  showEditProfileModal: boolean;
  showCreateProfileModal: boolean;
  showCreateGameModal: boolean;
  showFindGameModal: boolean;
  //account state
  aoSigner?: AoSigner;
  address?: string;
  profileId?: string;
  profile?: AoProfile;
  profiles?: Record<string, ProfileInfoResponse>;
  profileProvider?: AoProfileRead | AoProfileWrite;
  profileRegistryProvider: AoProfileRegistryReadable;
  // chess state
  chessRegistryId: string;
  chessRegistryProvider: ChessRegistryReadable | ChessRegistryWritable;
};

export type GlobalStateActions = {
  //modal actions
  setSigning: (signing: boolean) => void;
  setShowProfileMenu: (show: boolean) => void;
  setShowEditProfileModal: (show: boolean) => void;
  setShowCreateProfileModal: (show: boolean) => void;
  setShowCreateGameModal: (show: boolean) => void;
  setShowFindGameModal: (show: boolean) => void;
  //account actions
  setAddress: (address?: string) => void;
  setAoSigner: (signer: AoSigner) => void;
  setProfile: (profile: AoProfile) => void;
  setProfileId: (profileId: string) => void;
  setProfiles: (profiles: Record<string, ProfileInfoResponse>) => void;
  updateProfiles: (address: string) => Promise<void>;
  // set provider actions
  setChessRegistryProvider: (
    provider: AoChessRegistryReadable | AoChessRegistryWritable,
  ) => void;
  reset: () => void;
};

export const initialGlobalState: GlobalState = {
  signing: false,
  showCreateProfileModal: false,
  showEditProfileModal: false,
  showProfileMenu: false,
  showCreateGameModal: false,
  showFindGameModal: false,
  profileRegistryProvider: ProfileRegistry.init(),
  chessRegistryId: CHESS_REGISTRY_ID,
  chessRegistryProvider: ChessRegistry.init() as any,
};

export class GlobalStateActionBase implements GlobalStateActions {
  constructor(
    private set: (props: any) => void,

    private initialGlobalState: GlobalState,
  ) {}
  setSigning = (signing: boolean) => {
    this.set({ signing });
  };
  setAddress = (address?: string) => {
    this.set({ address });
  };
  setAoSigner = (signer: AoSigner) => {
    this.set({ aoSigner: signer });
  };

  setShowProfileMenu = (show: boolean) => {
    this.set({ showProfileMenu: show });
  };
  setShowEditProfileModal = (show: boolean) => {
    this.set({ showEditProfileModal: show });
  };
  setShowCreateProfileModal = (show: boolean) => {
    this.set({ showCreateProfileModal: show });
  };
  setShowCreateGameModal = (show: boolean) => {
    this.set({ showCreateGameModal: show });
  };
  setShowFindGameModal = (show: boolean) => {
    this.set({ showFindGameModal: show });
  };
  setProfile = (profile: AoProfile) => {
    this.set({ profile });
  };
  setProfileId = (profileId: string) => {
    this.set({ profileId });
  };
  setProfiles = (profiles: Record<string, ProfileInfoResponse>) => {
    this.set({ profiles });
  };
  updateProfiles = async (address: string) => {
    const registry = this.initialGlobalState.profileRegistryProvider;
    const profileIds = await registry.getProfilesByAddress({
      address,
    });

    const profiles: Record<string, ProfileInfoResponse> = {};
    await Promise.all(
      profileIds?.map(async ({ ProfileId }) => {
        const provider = Profile.init({ processId: ProfileId });
        const p = await provider.getInfo();
        profiles[ProfileId] = p;
      }),
    );
    const profileId = Object.keys(profiles)[0];
    const profile = profiles[profileId];
    this.setProfiles(profiles);
    this.setProfile(profile?.Profile);
    this.setProfileId(profileId);
  };

  setChessRegistryProvider = (
    provider: AoChessRegistryReadable | AoChessRegistryWritable,
  ) => {
    this.set({ chessRegistryProvider: provider });
  };
  reset = () => {
    this.set({ ...this.initialGlobalState });
  };
}

export interface GlobalStateInterface extends GlobalState, GlobalStateActions {}
export const useGlobalState = create<GlobalStateInterface>()((set: any) => ({
  ...initialGlobalState,
  ...new GlobalStateActionBase(set, initialGlobalState),
}));
