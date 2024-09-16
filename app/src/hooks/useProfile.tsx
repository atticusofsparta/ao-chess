import { AoProfile, Profile } from '@src/services/ao/profiles/Profile';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { useEffect, useState } from 'react';

import { useArweaveImage } from './useArweaveImage';

export function useProfile(address?: string) {
  const profileRegistry = useGlobalState(
    (state) => state.profileRegistryProvider,
  );
  const [profile, setProfile] = useState<AoProfile | undefined>();
  const { data: profileImage } = useArweaveImage({
    txId: profile?.ProfileImage,
  });
  const { data: coverImage } = useArweaveImage({ txId: profile?.CoverImage });

  useEffect(() => {
    async function fetchProfile() {
      if (!address) return;
      const profiles = await profileRegistry.getProfilesByAddress({ address });
      const profileId = profiles[0].ProfileId;
      if (profileId) {
        const profile = await profileRegistry.getMetadataByProfileIds({
          profileIds: [profileId],
        });
        setProfile(profile);
      }
    }
    fetchProfile();
  }, [address]);
  return {
    profile,
    profileImage,
    coverImage,
  };
}
