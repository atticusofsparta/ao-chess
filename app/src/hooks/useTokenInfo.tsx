import { AOProcess } from "@ar.io/sdk";
import { DEFAULT_AO } from "@src/constants";
import { useGlobalState } from "@src/services/state/useGlobalState";
import { useQuery } from "@tanstack/react-query";

export function useTokenInfo(id:string) {
    return useQuery({
        queryKey: ['tokenInfo', id],
        queryFn: async () => {
            const tokenProcess = new AOProcess({
                processId: id,
            })
            const res = await DEFAULT_AO.dryrun({
                process: id,
                tags: [{ name: 'Action', value: 'Info' }],
            });
            const infoTags = res.Messages[0].Tags;
            const info = infoTags.reduce((acc: Record<string, string>, tag: {name:string, value: string}) => {
                acc[tag.name] = tag.value;
                return acc;
            }, {} as Record<string, string>);
            return {
                Name: info.Name,
                Logo: info.Logo,
                Ticker: info.Ticker,
                Denomination: info.Denomination,
            }
        },
        staleTime: Infinity
    })
}