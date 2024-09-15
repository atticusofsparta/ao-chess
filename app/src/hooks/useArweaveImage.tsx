import { DEFAULT_ARWEAVE, DEFAULT_GRAPHQL_CLIENT } from '@src/constants';
import { isArweaveTransactionID } from '@src/utils';
import { useQuery } from '@tanstack/react-query';
import Arweave from 'arweave';

export function useArweaveImage({
  txId,
  arweave = DEFAULT_ARWEAVE,
  gql = DEFAULT_GRAPHQL_CLIENT,
}: {
  txId?: string;
  arweave?: Arweave;
  gql?: typeof DEFAULT_GRAPHQL_CLIENT;
}) {
  return useQuery({
    queryKey: ['arweave-image', txId ?? 'null', arweave.api.getConfig().host],
    queryFn: async () => {
      if (!txId || !isArweaveTransactionID(txId)) {
        throw new Error('Invalid transaction ID');
      }
      const txResult = await gql
        .getTransactions({
          ids: [txId],
          first: 1,
        })
        .catch((e) => {
          console.error('Failed to fetch image transaction from gql', e);
          return;
        });
      const tx = txResult?.transactions.edges[0];
      if (!tx) {
        throw new Error('Transaction not found');
      }
      const mimeType = tx.node.tags.find(
        (tag) => tag.name === 'Content-Type',
      )?.value;
      const res = await fetch(`https://${arweave.api.getConfig().host}/${txId}`)
        .then((r) => {
          console.log(r);
          if (!r.ok) {
            throw new Error('Failed to fetch image');
          }
          return r.arrayBuffer();
        })
        .catch((e) => {
          console.error('Failed to fetch image', e);
          return;
        });
      if (!res) {
        throw new Error('Failed to fetch image');
      }
      const image = new Blob([new Uint8Array(res as any)], { type: mimeType });
      const url = URL.createObjectURL(image);
      console.log('url', url);
      return url;
    },
    staleTime: Infinity,
  });
}
