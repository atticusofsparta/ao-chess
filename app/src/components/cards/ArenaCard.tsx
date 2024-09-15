import { useArweaveImage } from "@src/hooks/useArweaveImage";
import { useTokenInfo } from "@src/hooks/useTokenInfo";
import { Token, isArweaveTransactionID } from "@src/utils";

function ArenaCard({tokenId, wager}:{tokenId: string, wager: number}) {

    const {data: tokenInfo} = useTokenInfo(tokenId);
    const {data: tokenLogo} = useArweaveImage({txId: tokenInfo?.Logo});



    if (!isArweaveTransactionID(tokenId)) {
        return <div>Invalid token ID</div>;
    }
  return (
    <button className="flex flex-col w-[200px] h-[200px] bg-foreground rounded-lg justify-between items-center border-2 border-foreground hover:border-primary">{
        !tokenInfo ? <div className="flex flex-row h-full w-full justify-center items-center">Loading...</div> :<>
        <h2 className="flex flex-row w-full text-xl p-1">{tokenInfo?.Name}</h2>
        <img src={tokenLogo} alt="Arena Badge" className="w-[100px] h-[100px]"/>
        <span className="flex flex-row items-center justify-center w-full rounded-b-lg font-semibold bg-warning text-black">
            Wager: {new Token(wager, tokenInfo?.Denomination).valueOf()}
            </span></>
    }</button>
  );
}


export default ArenaCard;