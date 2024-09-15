import { notificationEmitter } from '@src/services/events';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { menuSound } from '@src/sounds';
import { formatArweaveAddress } from '@src/utils';
import { useApi } from 'arweave-wallet-kit';
import { motion } from 'framer-motion';
import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';

import Button from '../buttons/Button';
import CopyButton from '../buttons/CopyButton';
import CreateProfileModal from '../modals/CreateProfileModal';
import EditProfileModal from '../modals/EditProfileModal';

function ProfileMenu() {
  const api = useApi();
  const resetState = useGlobalState((state) => state.reset);
  const address = useGlobalState((state) => state.address);
  const setAddress = useGlobalState((state) => state.setAddress);
  const showProfileMenu = useGlobalState((state) => state.showProfileMenu);
  const setShowProfileMenu = useGlobalState(
    (state) => state.setShowProfileMenu,
  );
  const showCreateProfileModal = useGlobalState(
    (state) => state.showCreateProfileModal,
  );
  const setShowCreateProfileModal = useGlobalState(
    (state) => state.setShowCreateProfileModal,
  );
  const showEditProfileModal = useGlobalState(
    (state) => state.showEditProfileModal,
  );
  const setShowEditProfileModal = useGlobalState(
    (state) => state.setShowEditProfileModal,
  );
  const profileId = useGlobalState((state) => state.profileId);
  const profile = useGlobalState((state) => state.profile);
  const menuRef = useRef<HTMLDivElement>();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        event.target &&
        menuRef.current &&
        !menuRef.current.contains(event.target as any)
      ) {
        if (showProfileMenu == true) menuSound.play();
        setShowProfileMenu(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, showProfileMenu]);

  return (
    <>
      <motion.div
        animate={{
          opacity: showProfileMenu ? 1 : 0,
          padding: showProfileMenu ? '6px' : '0',
          width: showProfileMenu ? '33%' : '0%',
          transition: { duration: 0.25 },
        }}
        className={`absolute right-0 top-0 box-border flex h-full backdrop-blur-sm backdrop-filter`}
        ref={menuRef as any}
      >
        <motion.div
          animate={{
            padding: showProfileMenu ? '0px' : '0',
            opacity: showProfileMenu ? 1 : 0,
            width: showProfileMenu ? '100%' : '0%',
            transition: { duration: 0.25 },
          }}
          className={`z-10 flex-row justify-between overflow-hidden rounded-2xl bg-foreground`}
        >
          {/* cover image and profile info */}
          <div className="relative flex h-[33%] w-full rounded-t-2xl">
            <img
              src={
                profile?.CoverImage
                  ? `http://arweave.net/${profile?.CoverImage}`
                  : '/images/mars-texture.webp'
              }
              className="w-full rounded-t-2xl"
              height={'inherit'}
            />

            <div className="absolute bottom-0 left-0 flex h-full w-full flex-col justify-between bg-[rgb(0,0,0,0.8)] p-2 text-white">
              <div className="flex w-full flex-row justify-between">
                <div className="flex flex-col gap-2">
                  {profileId && (
                    <span className="flex items-center justify-center gap-2">
                      Profile: {formatArweaveAddress(profileId ?? '')}{' '}
                      <CopyButton text={profileId ?? ''} />
                    </span>
                  )}
                  <span className="flex items-center justify-center gap-2">
                    Wallet: {formatArweaveAddress(address ?? '')}{' '}
                    <CopyButton text={address ?? ''} />
                  </span>
                  <span>
                    Nickname:{' '}
                    {profile?.DisplayName
                      ? profile.DisplayName.length > 13
                        ? formatArweaveAddress(profile.DisplayName)
                        : profile.DisplayName
                      : 'display name'}
                  </span>
                  <span>
                    Username:{' '}
                    {profile?.UserName
                      ? profile.UserName.length > 13
                        ? formatArweaveAddress(profile.UserName)
                        : profile.UserName
                      : 'username'}
                  </span>
                </div>
                <Button
                  className="shadow-primaryThin relative h-fit rounded-full ring-foreground transition-all duration-300 hover:shadow-primary hover:ring-1"
                  onClick={() => {
                    menuSound.play();
                    setShowProfileMenu(false);
                  }}
                >
                  {profile?.ProfileImage ? (
                    <img
                      src={
                        profile?.ProfileImage
                          ? `http://arweave.net/${profile?.ProfileImage}`
                          : '/images/pfps/naturalist-human/4.webp'
                      }
                      width={'75px'}
                      height={'75px'}
                      alt="profile"
                      className="rounded-full"
                    />
                  ) : (
                    <></>
                  )}
                </Button>
              </div>

              <div className="flex w-full flex-row justify-end">
                {profile !== undefined ? (
                  <Button
                    onClick={() => setShowEditProfileModal(true)}
                    sound={
                      new Howl({
                        src: ['/sounds/bloop.wav'],
                        volume: 0.05,
                        loop: false,
                      })
                    }
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    className="rounded-md border-[1px] border-white bg-foreground p-2 text-white transition-all hover:scale-105 hover:bg-foreground hover:text-primary"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowCreateProfileModal(true);
                    }}
                    sound={
                      new Howl({
                        src: ['/sounds/bloop.wav'],
                        volume: 0.05,
                        loop: false,
                      })
                    }
                  >
                    Create Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="box-border flex h-[66%] w-full items-end justify-end bg-[rgb(0,0,0,0.3)] p-4">
            <Button
              className="h-fit text-lg text-white hover:text-primary"
              onClick={async () => {
                await api?.disconnect();
                setAddress(undefined);
                notificationEmitter.emit('notification', 'Disconnected');
                setShowProfileMenu(false);
                resetState();
              }}
              sound={menuSound}
            >
              Disconnect
            </Button>
          </div>
        </motion.div>
      </motion.div>
      <CreateProfileModal
        showModal={showCreateProfileModal}
        setShowModal={(b: boolean) => setShowCreateProfileModal(b)}
      />
      <EditProfileModal
        showModal={showEditProfileModal}
        setShowModal={(b: boolean) => setShowEditProfileModal(b)}
      />
    </>
  );
}

export default ProfileMenu;
