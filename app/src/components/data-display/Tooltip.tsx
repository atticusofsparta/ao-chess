import * as ReactTooltip from '@radix-ui/react-tooltip';

const Tooltip = ({
  message,
  children,
  useMaxWidth = true,
}: {
  message: React.ReactNode;
  children: React.ReactNode;
  useMaxWidth?: boolean;
}) => {
  return (
    <div className="relative flex">
      <ReactTooltip.Provider>
        <ReactTooltip.Root delayDuration={0}>
          <ReactTooltip.Trigger asChild={true}>
            <div>{children}</div>
          </ReactTooltip.Trigger>
          <ReactTooltip.Portal>
            <ReactTooltip.Content
              className={`z-50 mb-1 w-fit ${useMaxWidth ? 'max-w-[25rem]' : undefined} border-grey-500 bg-containerL0 rounded-md border px-6 py-3`}
            >
              {/* <ReactTooltip.Arrow className={`${marginBottom}`} /> */}
              <div className="text-low text-sm">{message}</div>
              <div
                className={`border-grey-500 bg-containerL0 absolute bottom-0 left-[48.8%] size-2.5 rotate-45 border [clip-path:polygon(0%_100%,100%_0,100%_100%)]    `}
              />
            </ReactTooltip.Content>
          </ReactTooltip.Portal>
        </ReactTooltip.Root>
      </ReactTooltip.Provider>
    </div>
  );
};

export default Tooltip;
