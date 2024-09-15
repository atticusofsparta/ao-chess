import {
  AoProfile,
  Profile,
  spawnProfile,
} from '@src/services/ao/profiles/Profile';
import { errorEmitter } from '@src/services/events';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { bloopSound } from '@src/sounds';
import { camelToReadable, uploadImage } from '@src/utils';
import { useApi } from 'arweave-wallet-kit';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { TbInfoCircle, TbUpload } from 'react-icons/tb';

import Button from '../buttons/Button';
import Tooltip from '../data-display/Tooltip';
import FileInput from '../inputs/file/FileInput';
import InlineTextInput from '../inputs/text/InlineTextInput';
import Modal from './Modal';

/**
 * Requirements:
 * - cover image (add/remove)
 * - profile image (add/remove)
 * - Name (displayName)
 * - Handle (username)
 * - Bio (description)
 */

export type CreateProfileForm = {
  coverImage: string;
  profileImage: string;
  displayName: string;
  username: string;
  description: string;
};

export const defaultCreateProfileForm: CreateProfileForm = {
  coverImage: '',
  profileImage: '',
  displayName: '',
  username: '',
  description: '',
};
function CreateProfileModal({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) {
  const api = useApi();
  const address = useGlobalState((s) => s.address);
  const setSigning = useGlobalState((s) => s.setSigning);
  const signer = useGlobalState((s) => s.aoSigner);
  const updateProfiles = useGlobalState((s) => s.updateProfiles);

  const modalRef = useRef<HTMLDivElement>(null);
  const [formState, setFormState] = useState<CreateProfileForm>(
    defaultCreateProfileForm,
  );

  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [profileImage, setProfileImage] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        event.target &&
        modalRef.current &&
        !modalRef.current.contains(event.target as any)
      ) {
        setShowModal(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, showModal]);

  function handleFormChange(
    v: string | File | undefined,
    key: keyof CreateProfileForm,
  ) {
    if (key === 'coverImage' || key === 'profileImage') {
      if (v instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (key === 'coverImage') {
            setCoverImage(e.target?.result as string);
          } else {
            setProfileImage(e.target?.result as string);
          }
        };

        reader.readAsDataURL(v);

        return;
      }
    }

    setFormState((state) => ({
      ...state,
      [key]: v,
    }));
  }

  async function createProfile() {
    try {
      setSigning(true);
      const newProfile: Partial<AoProfile> = {
        UserName: formState.username,
        DisplayName: formState.displayName,
        Description: formState.description,
        CoverImage: formState.coverImage,
        ProfileImage: formState.profileImage,
      };
      if (formState.coverImage) {
        const coverId = await uploadImage(formState.coverImage, api as any);
        newProfile.CoverImage = coverId;
      }
      if (formState.profileImage) {
        const profileId = await uploadImage(formState.coverImage, api as any);
        newProfile.ProfileImage = profileId;
      }

      if (!address) throw new Error('No address found');
      if (!api || !signer) throw new Error('No signer found');
      const id = await spawnProfile({
        profileSettings: formState as Profile,
        address,
        signer,
      });

      await updateProfiles(address);
      setShowModal(false);
    } catch (error) {
      errorEmitter.emit('error', error);
    } finally {
      setSigning(false);
      setFormState(defaultCreateProfileForm);
    }
  }
  const inputClasses = `bg-[rgb(0,0,0,0.8)] text-primary placeholder:text-sm text-md dark:focus:ring-foreground dark:focus:border-foreground flex flex-row p-1 rounded-md border-2 border-black`;
  return (
    <Modal visible={showModal} className="m-4 rounded-lg bg-foreground">
      <div
        ref={modalRef}
        className="scrollbar-h-50 flex max-h-[70vh] w-[700px] flex-col gap-4 overflow-y-scroll p-6 text-white scrollbar scrollbar-thumb-dark-grey scrollbar-thumb-rounded-full scrollbar-w-2"
      >
        <div className="text-secondary flex h-fit w-full max-w-[600px] flex-col gap-2">
          <h1 className=" border-b-[1px] border-grey p-2 text-xl font-semibold text-white">
            Create Profile
          </h1>
          {/* inputs */}
          <div className="flex w-full flex-col gap-4">
            <div className="relative flex">
              <FileInput
                icon={<></>}
                disabled={!showModal}
                name="coverImage"
                className={
                  'relative flex h-[300px] w-full flex-col items-center justify-center border-dark-grey bg-[rgba(0,0,0,0.8)]'
                }
                variant="rectangle"
                onChange={(f) =>
                  handleFormChange(f?.target?.files?.[0] as any, 'coverImage')
                }
              >
                {/* render upload here */}
                <div className="absolute flex h-full w-full items-center justify-center">
                  {coverImage ? (
                    <img src={coverImage} className="flex h-full w-full" />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <TbUpload size={30} />
                      Select a cover image to upload
                    </div>
                  )}
                </div>
              </FileInput>
              <div className="absolute bottom-[-30px] right-[-10px]">
                <FileInput
                  icon={<></>}
                  disabled={!showModal}
                  className={
                    'border-foregroundThin relative z-10 flex h-[150px] w-[150px] flex-col items-center justify-center border-dark-grey bg-[rgba(0,0,0,0.8)] p-4'
                  }
                  variant="circle"
                  name="profileImage"
                  onChange={(v) =>
                    handleFormChange(v.target.files?.[0] as any, 'profileImage')
                  }
                >
                  {/* render upload here */}
                  <div className="absolute flex h-full w-full items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        className="flex h-full w-full rounded-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <TbUpload size={30} />
                        Profile Image
                      </div>
                    )}
                  </div>
                </FileInput>
              </div>
            </div>
            {Object.keys(formState).map((key: string) => {
              if (key == 'coverImage' || key === 'profileImage') {
                return;
              } else if (key === 'gitIntegrations') {
                return (
                  <div className="flex flex-col text-xl">
                    <span className="flex w-full items-center justify-center">
                      <span className="flex flex-row items-center justify-center gap-2">
                        {camelToReadable(key)}
                        <Tooltip
                          message={
                            <span className="bg-night-sky text-matrix shadow-primaryThin m-2 flex rounded-lg border-2 border-primary p-2">
                              Git integrations allow Omphalos to access your
                              repositories. API keys should be generated from
                              your providers (eg github, gitlab, etc) user
                              settings - for security, ensure that only READ
                              permissions are enabled. Note that Omphalos will
                              encrypt your API key with your connected wallet's
                              public key and store it in your profile. Certain
                              integrations (like automated action setup) may
                              require WRITE permissions.
                            </span>
                          }
                        >
                          <motion.div onMouseEnter={() => bloopSound.play()}>
                            <TbInfoCircle className="hover:text-matrix cursor-pointer" />
                          </motion.div>
                        </Tooltip>
                      </span>
                    </span>
                  </div>
                );
              }

              return (
                <InlineTextInput
                  key={key}
                  title={camelToReadable(key)}
                  className={inputClasses}
                  placeholder={camelToReadable(key)}
                  value={formState[key as keyof CreateProfileForm] as string}
                  setValue={(v) => handleFormChange(v, key as any)}
                />
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="flex w-full flex-row items-center justify-between">
          <Button
            className="bg-secondary hover:bg-ocean-blue-thin flex w-fit rounded-md border-2 border-white p-1 text-white transition-all hover:scale-105"
            onClick={() => {
              setFormState(defaultCreateProfileForm);
              setCoverImage(undefined);
              setProfileImage(undefined);
            }}
          >
            Reset
          </Button>
          <div className="flex flex-row gap-2">
            <Button
              className="bg-secondaryThin hover:bg-secondary rounded-md border-2 border-white p-1 text-white transition-all hover:scale-105"
              onClick={() => {
                setFormState(defaultCreateProfileForm);
                setShowModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-md bg-primary p-1 text-white transition-all hover:scale-105 hover:text-black"
              onClick={() => createProfile()}
            >
              Create
            </Button>{' '}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreateProfileModal;
