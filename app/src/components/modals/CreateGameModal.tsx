import { llamaTokenId } from "@src/constants";
import ArenaCard from "../cards/ArenaCard";
import Modal from "./Modal";
import { useGlobalState } from "@src/services/state/useGlobalState";
import { TbX } from "react-icons/tb";


function CreateGameModal() {
    const showCreateGameModal = useGlobalState((state) => state.showCreateGameModal);
    const setShowCreateGameModal = useGlobalState((state) => state.setShowCreateGameModal);


    return <Modal visible={showCreateGameModal} className="bg-metallic-grey p-5 pt-4 border-2 border-primary rounded-lg">
        <h1 className="flex flex-row justify-between items-center text-2xl mb-10">Create Game <button onClick={()=> setShowCreateGameModal(false)} className="flex flex-row items-center justify-center"><TbX /></button></h1>
            <div className="flex flex-col w-full items-center justify-center gap-5">
         <h1 className="text-xl text-white p-1 px-5 border-2 border-white rounded-full">Choose Arena</h1>
        <div className={`flex flex-row gap-4`}>
        <ArenaCard tokenId={llamaTokenId} wager={10} />
         <ArenaCard tokenId={llamaTokenId} wager={50} />
          <ArenaCard tokenId={llamaTokenId} wager={100} />
           <ArenaCard tokenId={llamaTokenId} wager={200} />
    </div>
    </div>
    </Modal>
}

export default CreateGameModal