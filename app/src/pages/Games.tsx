import ArenaCard from "@src/components/cards/ArenaCard";
import CreateGameModal from "@src/components/modals/CreateGameModal";
import FindGameModal from "@src/components/modals/FindGameModal";
import { llamaTokenId } from "@src/constants";
import { useGlobalState } from "@src/services/state/useGlobalState";

function Games() {
    const setShowCreateGameModal = useGlobalState((state) => state.setShowCreateGameModal);
    const setShowFindGameModal = useGlobalState((state) => state.setShowFindGameModal);
  return <div className="flex h-full w-full flex-col pt-4 gap-6">
   
   <div className="flex flex-row justify-center items-center py-5 gap-10">
    <button onClick={()=> setShowCreateGameModal(true)} className="flex flex-col justify-center items-center flex-1 h-[150px] bg-foreground rounded-xl border-2 border-foreground hover:border-primary">
    Create Game
    </button>

        <button onClick={()=> setShowFindGameModal(true)} className="flex flex-col justify-center items-center flex-1 h-[150px] bg-foreground rounded-xl border-2 border-foreground hover:border-primary">
    Find a Game
    </button>

   </div>
   <div className="flex flex-row w-full border-2 border-white rounded-lg">
    <div className="flex flex-1 min-h-[100px]">
        <h1>Chat</h1>
    </div>
    <div className="flex flex-1">
        <h1>Current games</h1>
    </div>
   </div>

<CreateGameModal/>
<FindGameModal/>
  </div>;
}

export default Games;
