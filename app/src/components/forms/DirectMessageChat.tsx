import { useProfile } from '@src/hooks/useProfile';
import { ChatMessage } from '@src/services/ao/chess/game';
import { formatArweaveAddress, formatDate, formatTime } from '@src/utils';
import { useEffect, useState } from 'react';
import { RiAccountCircleFill } from 'react-icons/ri';

import Button from '../buttons/Button';
import InlineTextInput from '../inputs/text/InlineTextInput';

function DirectMessageChat({
  className,
  chatMessages,
  userAddress,
  receiverAddress,
  send,
}: {
  className?: string;
  chatMessages: ChatMessage[];
  userAddress: string;
  receiverAddress: string;
  send: (message: string) => void;
}) {
  const userProfile = useProfile(receiverAddress);
  const receiverProfile = useProfile(userAddress);
  const [sortedChatMessages, setSortedChatMessages] = useState<ChatMessage[]>(
    [],
  );
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setSortedChatMessages(
      [...chatMessages].sort((a, b) => a.timestamp - b.timestamp),
    );
    // get the two senders
  }, [chatMessages]);

  return (
    <div className={className}>
      <div className="flex h-[100%] w-full flex-col gap-3 overflow-auto scrollbar">
        {!sortedChatMessages.length ? (
          <div className="flex h-full w-full flex-row items-center justify-center">
            <span className="text-white">No messages yet</span>
          </div>
        ) : (
          sortedChatMessages.map((message, index) => {
            const image =
              message.sender == userAddress
                ? userProfile.profileImage
                : receiverProfile.profileImage;
            const name =
              message.sender == userAddress
                ? userProfile.profile?.DisplayName
                : receiverProfile.profile?.DisplayName;

            return (
              <div
                key={index}
                className={`flex w-full flex-col whitespace-nowrap ${message.sender !== userAddress ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`flex w-fit min-w-[75%] flex-row items-center justify-between gap-3 whitespace-nowrap rounded-lg p-2 ${message.sender !== userAddress ? 'bg-metallic-grey' : 'bg-primary text-black'}`}
                >
                  {message.sender !== userAddress ? (
                    image ? (
                      <img
                        src={image}
                        className="h-[50px] w-[50px] rounded-full"
                      />
                    ) : (
                      <RiAccountCircleFill size={'50px'} />
                    )
                  ) : (
                    <></>
                  )}

                  <div className="flex w-full flex-col">
                    <div className="flex flex-row gap-4 text-dark-grey">
                      <span className="text-white">
                        {name || formatArweaveAddress(message.sender)}
                      </span>
                    </div>
                    <span className="text-sm">{message.message}</span>
                    <span className="text-xs text-dark-grey">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  {message.sender === userAddress ? (
                    image ? (
                      <img
                        src={image}
                        className="h-[50px] w-[50px] rounded-full"
                      />
                    ) : (
                      <RiAccountCircleFill size={'50px'} />
                    )
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="flex flex-row items-center justify-center">
        <InlineTextInput
          className="h-full w-full rounded-sm border-b-2 border-primary bg-background p-1 text-white focus:outline-none"
          value={message}
          setValue={(v) => setMessage(v)}
          placeholder="Type a message..."
          onPressEnter={() => {
            send(message);
            setMessage('');
          }}
        />
        <Button
          className="rounded-sm bg-dark-grey px-2 py-1 text-primary"
          onClick={() => {
            send(message);
            setMessage('');
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default DirectMessageChat;
