import { useArweaveImage } from '@src/hooks/useArweaveImage';
import { AoProfile, Profile } from '@src/services/ao/profiles/Profile';
import { errorEmitter } from '@src/services/events';
import { useGlobalState } from '@src/services/state/useGlobalState';
import { camelToReadable, uploadImage } from '@src/utils';
import { useApi } from 'arweave-wallet-kit';
import { s } from 'node_modules/vite/dist/node/types.d-jgA8ss1A';
import { useEffect, useRef, useState } from 'react';
import { TbUpload } from 'react-icons/tb';

import Button from '../buttons/Button';
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
  newCoverImage: string;
  newProfileImage: string;
  displayName: string;
  username: string;
  description: string;
};

export const defaultCreateProfileForm: CreateProfileForm = {
  newCoverImage: '',
  newProfileImage: '',
  displayName: '',
  username: '',
  description: '',
};
function EditProfileModal({
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
  const profile = useGlobalState((s) => s.profile);
  const profileId = useGlobalState((s) => s.profileId);

  const { data: coverImage } = useArweaveImage({ txId: profile?.CoverImage });
  const { data: profileImage } = useArweaveImage({
    txId: profile?.ProfileImage,
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const [formState, setFormState] = useState<CreateProfileForm>(
    defaultCreateProfileForm,
  );

  const [newCoverImage, setNewCoverImage] = useState<string | undefined>(
    coverImage,
  );
  const [newProfileImage, setNewProfileImage] = useState<string | undefined>(
    profileImage,
  );

  useEffect(() => {
    setNewCoverImage(coverImage);
    setNewProfileImage(profileImage);
    if (profile) {
      setFormState({
        newCoverImage: coverImage ?? '',
        newProfileImage: profileImage ?? '',
        displayName: profile.DisplayName,
        username: profile.UserName,
        description: profile.Description,
      });
    }
  }, [profile, coverImage, profileImage]);

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
    if (key === 'newCoverImage' || key === 'newProfileImage') {
      if (v instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (key === 'newCoverImage') {
            setNewCoverImage(e.target?.result as string);
          } else {
            setNewProfileImage(e.target?.result as string);
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

  async function editProfile() {
    try {
      setSigning(true);
      const newProfile: Partial<AoProfile> = {
        UserName: formState.username,
        DisplayName: formState.displayName,
        Description: formState.description,
        CoverImage: profile?.CoverImage ?? '',
        ProfileImage: profile?.ProfileImage ?? '',
      };
      if (newCoverImage) {
        const coverId = await uploadImage(newCoverImage, api as any);
        newProfile.CoverImage = coverId;
      }
      if (newProfileImage) {
        const profileId = await uploadImage(newProfileImage, api as any);
        newProfile.ProfileImage = profileId;
      }

      if (!address) throw new Error('No address found');
      if (!api || !signer) throw new Error('No signer found');

      const id = await (
        Profile.init({
          processId: profileId!,
          signer,
        }) as any
      ).updateProfile(newProfile);

      await updateProfiles(address);
      setShowModal(false);
    } catch (error) {
      errorEmitter.emit('error', error);
    } finally {
      setSigning(false);
      setFormState(defaultCreateProfileForm);
    }
  }
  const inputclassName = `bg-[rgb(0,0,0,0.8)] text-primary placeholder:text-sm text-md dark:focus:ring-foreground dark:focus:border-foreground flex flex-row p-1 rounded-md border-2 border-black`;
  return (
    <Modal visible={showModal} className="m-4 rounded-lg bg-foreground">
      <div
        ref={modalRef}
        className="scrollbar-track-slate-300 scrollbar-h-50 flex max-h-[70vh] w-[700px] flex-col gap-4 overflow-y-scroll p-6 scrollbar scrollbar-thumb-dark-grey scrollbar-thumb-rounded-full scrollbar-w-2"
      >
        <div className="flex h-fit w-full max-w-[600px] flex-col gap-2 text-white">
          <h1 className="text-secondary shadow-primaryThinBottom rounded-md border-[1px] border-primary p-2 text-xl font-bold">
            Edit Profile
          </h1>
          {/* inputs */}
          <div className="flex w-full flex-col gap-4">
            <div className="relative flex">
              <FileInput
                icon={<></>}
                disabled={!showModal}
                name="newCoverImage"
                className={
                  'relative flex h-[300px] w-full flex-col items-center justify-center border-dark-grey bg-[rgba(0,0,0,0.8)]'
                }
                variant="rectangle"
                onChange={(v) =>
                  handleFormChange(v.target.files?.[0] as any, 'newCoverImage')
                }
              >
                {/* render upload here */}
                <div className="absolute flex h-full w-full items-center justify-center">
                  {newCoverImage ? (
                    <img src={newCoverImage} className="flex h-full w-full" />
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
                    'border-secondary relative z-10 flex h-[150px] w-[150px] flex-col items-center justify-center border-dark-grey bg-[rgba(0,0,0,0.8)] p-4'
                  }
                  variant="circle"
                  name="newProfileImage"
                  onChange={(v) =>
                    handleFormChange(
                      v.target.files?.[0] as any,
                      'newProfileImage',
                    )
                  }
                >
                  {/* render upload here */}
                  <div className="absolute flex h-full w-full items-center justify-center">
                    {newProfileImage ? (
                      <img
                        src={newProfileImage}
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
              if (key == 'newCoverImage' || key === 'newProfileImage') {
                return;
              }

              return (
                <InlineTextInput
                  key={key}
                  title={camelToReadable(key)}
                  className={inputclassName}
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
            className="bg-secondary hover:bg-ocean-blue-thin flex w-fit rounded-md border-2 border-black p-1 text-black transition-all"
            onClick={() => {
              setFormState(defaultCreateProfileForm);
              setNewCoverImage(undefined);
              setNewProfileImage(undefined);
            }}
          >
            Reset
          </Button>
          <div className="flex flex-row gap-2">
            <Button
              className="bg-secondaryThin hover:bg-secondary rounded-md border-2 border-black p-1 text-black transition-all"
              onClick={() => {
                setFormState(defaultCreateProfileForm);
                setShowModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-forest-green-thin hover:bg-sunset-orange rounded-md border-2 border-primary p-1 text-primary transition-all hover:text-black"
              onClick={() => editProfile()}
            >
              Edit Profile
            </Button>{' '}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default EditProfileModal;
