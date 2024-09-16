import { useGlobalState } from "@src/services/state/useGlobalState";
import { useQuery } from "@tanstack/react-query";

// export function usePlayers(ids: string[]) {
//     const chessRegistryProvider = useGlobalState((state) => state.re);

//     return useQuery({
//         queryKey: ['players', ids],
//         queryFn: async () => {
//             const players = 
//         },
//         staleTime: 60 * 1000 * 5
//     })
// }