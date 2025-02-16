import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';

import useCurrentEra from '../staking/useCurrentEra';
import { ValidatorReward } from '../types';
import useClaimedRewards from './useClaimedRewards';
import useErasRewardsPoints from './useErasRewardsPoints';
import { usePayoutsStore } from './usePayoutsStore';

/**
 * Defined constant empty array to return on every render
 * to make sure it's always the same reference
 * and avoid unnecessary re-renders
 */
const EMPTY_ARRAY: ValidatorReward[] = [];

/**
 * Get all unclaimed rewards of the active account's nominations
 */
export default function useNominationsUnclaimedRewards() {
  const maxEras = usePayoutsStore((state) => state.eraRange);
  const activeSubstrateAddress = useSubstrateAddress();
  const { result: currentEra } = useCurrentEra();

  // Retrieve all validators that the account has nominated
  const { result: validators } = useApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) {
          return null;
        }

        return api.query.staking
          .nominators(activeSubstrateAddress)
          .pipe(
            map((nominators) =>
              nominators.isNone
                ? null
                : nominators
                    .unwrap()
                    .targets.map((target) =>
                      assertSubstrateAddress(target.toString()),
                    ),
            ),
          );
      },
      [activeSubstrateAddress],
    ),
  );

  const { result: claimedRewards } = useClaimedRewards();

  const { result: erasRewardsPoints } = useErasRewardsPoints();

  return useMemo(() => {
    // Returned empty array if the data is not ready
    if (
      validators === null ||
      validators.length === 0 ||
      erasRewardsPoints === null ||
      erasRewardsPoints.length === 0 ||
      claimedRewards === null ||
      claimedRewards.size === 0 ||
      currentEra === null
    ) {
      return EMPTY_ARRAY;
    }

    const startEra = currentEra - maxEras;

    return validators.reduce((unclaimedRewards, validator) => {
      erasRewardsPoints.forEach(([era, reward]) => {
        const claimedErasLength = claimedRewards.get(era)?.get(validator)?.size;
        const hasClaimed = claimedErasLength ? claimedErasLength >= 1 : false;

        // If the reward has claimed, do nothing
        if (hasClaimed) return;

        // If the era is not in the range, do nothing
        if (era < startEra || era > currentEra) return;

        unclaimedRewards.push({
          era,
          eraTotalRewardPoints: reward.total,
          validatorAddress: validator,
          validatorRewardPoints: reward.individual.get(validator) ?? 0,
        });
      });

      return unclaimedRewards;
    }, [] as ValidatorReward[]);
  }, [claimedRewards, currentEra, erasRewardsPoints, maxEras, validators]);
}
