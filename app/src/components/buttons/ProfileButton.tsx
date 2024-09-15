import { useGlobalState } from '@src/services/state/useGlobalState';
import { menuSound } from '@src/sounds';
import { formatArweaveAddress } from '@src/utils';
import { useActiveAddress } from 'arweave-wallet-kit';
import { motion } from 'framer-motion';
import { RiAccountCircleFill } from 'react-icons/ri';

import Button from './Button';
import ConnectButton from './ConnectButton';

function ProfileButton() {
  const address = useActiveAddress();
  const showProfileMenu = useGlobalState((state) => state.showProfileMenu);
  const setShowProfileMenu = useGlobalState(
    (state) => state.setShowProfileMenu,
  );
  const profile = useGlobalState((state) => state.profile);

  if (!address) {
    return <ConnectButton />;
  }

  return (
    <motion.div
      className="flex flex-row gap-5 rounded-full border-[1px] border-primary bg-background pl-4 text-white"
      animate={{
        opacity: showProfileMenu ? 0 : 1,
        transition: { duration: 0.25 },
      }}
    >
      <div className="text-secondary flex flex-col gap-2 p-1">
        <span>
          {profile?.DisplayName
            ? profile.DisplayName.length > 13
              ? formatArweaveAddress(profile.DisplayName)
              : profile.DisplayName
            : formatArweaveAddress(address)}
        </span>
      </div>
      <Button
        className="shadow-primaryThin relative h-[50px] w-[50px] rounded-full bg-primary ring-primary transition-all duration-300 hover:scale-110 hover:ring-1"
        onClick={() => {
          menuSound.play();
          setShowProfileMenu(!showProfileMenu);
        }}
        disabled={showProfileMenu}
      >
        {profile?.ProfileImage ? (
          <img
            src={`https://arweave.net/${profile?.ProfileImage}`}
            width={'50px'}
            height={'50px'}
            alt="profile"
            className="rounded-full"
          />
        ) : (
          <RiAccountCircleFill size={'50px'} />
        )}
      </Button>
    </motion.div>
  );
}

export default ProfileButton;
