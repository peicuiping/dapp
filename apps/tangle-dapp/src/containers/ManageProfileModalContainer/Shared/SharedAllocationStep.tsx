import { BN, BN_ZERO } from '@polkadot/util';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { Typography } from '@webb-tools/webb-ui-components';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback, useEffect, useState } from 'react';

import { RestakingService } from '../../../types';
import formatTangleBalance from '../../../utils/formatTangleBalance';
import AllocationStepContainer from '../AllocationStepContainer';
import { AllocationChartVariant, RestakingAllocationMap } from '../types';
import SharedAmountInput from './SharedAmountInput';
import SharedRolesInput from './SharedRolesInput';

export type SharedAllocationStepProps = {
  restakeAmount: BN | null;
  setRestakeAmount: (newAmount: BN | null) => void;
  allocations: RestakingAllocationMap;
  setAllocations: (newAllocations: RestakingAllocationMap) => void;
};

const SharedAllocationStep: FC<SharedAllocationStepProps> = ({
  allocations,
  setAllocations,
  restakeAmount,
  setRestakeAmount,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  const remainingAmount = null;

  const [selectedRoles, setSelectedRoles] = useState<RestakingService[]>(
    Object.keys(allocations) as RestakingService[],
  );

  const handleToggleRole = useCallback(
    (role: RestakingService) => {
      const isSelected = selectedRoles.includes(role);

      if (isSelected) {
        setSelectedRoles((roles) =>
          roles.filter((selectedRole) => selectedRole !== role),
        );
      } else {
        setSelectedRoles((roles) => [...roles, role]);
      }
    },
    [selectedRoles],
  );

  // Update allocations when the selected roles changes.
  useEffect(() => {
    const nextAllocations: RestakingAllocationMap = {};

    // Shared roles profile allocations have their amounts
    // set to zero.
    for (const selectedRole of selectedRoles) {
      nextAllocations[selectedRole] = BN_ZERO;
    }

    setAllocations(nextAllocations);
  }, [selectedRoles, setAllocations]);

  return (
    <AllocationStepContainer
      allocatedAmount={restakeAmount ?? BN_ZERO}
      allocations={allocations}
      variant={AllocationChartVariant.SHARED}
    >
      <SharedAmountInput
        id="shared-allocation-amount"
        title="Total Restake"
        amount={restakeAmount ?? BN_ZERO}
        setAmount={setRestakeAmount}
      />

      <SharedRolesInput
        id="shared-allocation-roles-opt-in"
        title="Roles Opt-in"
        services={Object.values(RestakingService)}
        selectedServices={selectedRoles}
        onToggleRole={handleToggleRole}
      />

      <Typography variant="body1" fw="normal" className="self-start">
        Remaining:{' '}
        {remainingAmount !== null
          ? formatTangleBalance(remainingAmount, nativeTokenSymbol)
          : EMPTY_VALUE_PLACEHOLDER}
      </Typography>
    </AllocationStepContainer>
  );
};

export default SharedAllocationStep;
