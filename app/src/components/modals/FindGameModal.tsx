import { llamaTokenId } from "@src/constants";
import ArenaCard from "../cards/ArenaCard";
import Modal from "./Modal";
import { useGlobalState } from "@src/services/state/useGlobalState";
import { TbX } from "react-icons/tb";
import { SiChessdotcom } from "react-icons/si";



function FindGameModal() {
    const showFindGameModal = useGlobalState((state) => state.showFindGameModal);
    const setShowFindGameModal = useGlobalState((state) => state.setShowFindGameModal);


    return <Modal visible={showFindGameModal} className="bg-metallic-grey p-5 pt-4 border-2 border-primary rounded-lg min-w-[600px]">
        <h1 className="flex flex-row justify-between items-center text-2xl mb-10">Searching for opponent... <button onClick={()=> setShowFindGameModal(false)} className="flex flex-row items-center justify-center"><TbX /></button></h1>
            <div className="flex flex-col w-full items-center justify-center gap-5">
    <SiChessdotcom className="text-9xl text-white animate-spin border-2 border-white rounded-full p-2"/>
        <div className={`flex flex-row gap-4`}>
        
    </div>
    </div>
    </Modal>
}

export default FindGameModal