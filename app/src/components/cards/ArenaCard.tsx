import { useArweaveImage } from '@src/hooks/useArweaveImage';
import { useTokenInfo } from '@src/hooks/useTokenInfo';
import { Token, isArweaveTransactionID } from '@src/utils';

function ArenaCard({
  tokenId,
  wager,
  onClick,
}: {
  tokenId: string;
  wager: number;
  onClick?: (p: {
    tokenId: string;
    wager: number;
    tokenInfo: {
      Name: string;
      Denomination: string | number;
      Logo: string;
      Ticker: string;
    };
  }) => void;
}) {
  const { data: tokenInfo } = useTokenInfo(tokenId);
  const { data: tokenLogo } = useArweaveImage({ txId: tokenInfo?.Logo });

  if (!isArweaveTransactionID(tokenId)) {
    return <div>Invalid token ID</div>;
  }
  return (
    <button
      onClick={() =>
        onClick
          ? onClick({
              tokenId,
              wager: new Token(wager, tokenInfo?.Denomination)
                .toMToken()
                .valueOf(),
              tokenInfo: {
                Name: tokenInfo?.Name,
                Denomination: tokenInfo?.Denomination,
                Logo: tokenInfo?.Logo,
                Ticker: tokenInfo?.Ticker,
              },
            })
          : null
      }
      className="flex h-[150px] w-[150px] flex-col items-center justify-between rounded-lg border-2 border-foreground bg-foreground hover:border-primary"
    >
      {!tokenInfo ? (
        <div className="flex h-full w-full flex-row items-center justify-center">
          Loading...
        </div>
      ) : (
        <>
          <h2 className="flex w-full flex-row p-1 text-xl">
            {tokenInfo?.Name}
          </h2>
          <img src={tokenLogo} alt="Arena Badge" className="h-[75px] w-[75]" />
          <span className="flex w-full flex-row items-center justify-center rounded-b-lg bg-warning font-semibold text-black">
            Wager: {new Token(wager, tokenInfo?.Denomination).valueOf()}
          </span>
        </>
      )}
    </button>
  );
}

export default ArenaCard;
