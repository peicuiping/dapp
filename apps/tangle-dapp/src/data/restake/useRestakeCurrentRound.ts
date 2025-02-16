import usePolkadotApi from '@webb-tools/tangle-shared-ui/hooks/usePolkadotApi';
import { useObservable, useObservableState } from 'observable-hooks';
import { map, of, switchMap } from 'rxjs';

export default function useRestakeCurrentRound() {
  const { apiRx } = usePolkadotApi();

  const currentRound$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([apiRx]) => {
          if (apiRx.query.multiAssetDelegation?.currentRound === undefined) {
            return of(0);
          }

          return apiRx.query.multiAssetDelegation
            .currentRound()
            .pipe(map((round) => round.toNumber()));
        }),
      ),
    [apiRx],
  );

  const currentRound = useObservableState(currentRound$, 0);

  return {
    currentRound,
    currentRound$,
  };
}
