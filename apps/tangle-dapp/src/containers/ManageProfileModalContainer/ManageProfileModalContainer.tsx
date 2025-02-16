import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import useIsMountedRef from '@webb-tools/webb-ui-components/hooks/useIsMountedRef';
import assert from 'assert';
import { FC, useCallback, useEffect, useState } from 'react';

import { useErrorCountContext } from '../../context/ErrorsContext';
import { RestakingProfileType } from '../../types';
import AllocationStep from './AllocationStep';
import useSharedRestakeAmountState from './Shared/useSharedRestakeAmountState';
import { ManageProfileModalContainerProps, ManageProfileStep } from './types';
import useAllocationsState from './useAllocationsState';

function getStepDiff(
  currentStep: ManageProfileStep,
  isNext: boolean,
): ManageProfileStep | null {
  const difference = isNext ? 1 : -1;

  if (Object.values(ManageProfileStep).includes(currentStep + difference)) {
    return currentStep + difference;
  }

  return null;
}

function getStepTitle(
  step: ManageProfileStep,
  profileType: RestakingProfileType,
  isCreatingProfile: boolean,
): string {
  switch (step) {
    case ManageProfileStep.CHOOSE_METHOD:
      return 'Choose Your Restaking Method';
    case ManageProfileStep.ALLOCATION: {
      const profileKindString =
        profileType === RestakingProfileType.INDEPENDENT
          ? 'Independent'
          : 'Shared';

      const actionPrefix = isCreatingProfile ? 'Create' : 'Manage';

      return `${actionPrefix} ${profileKindString} Profile`;
    }
    case ManageProfileStep.CONFIRM_ALLOCATIONS:
      return 'Review and Confirm Your Allocations:';
  }
}

function getStepNextButtonLabel(step: ManageProfileStep): string {
  switch (step) {
    case ManageProfileStep.CHOOSE_METHOD:
      return 'Next';
    case ManageProfileStep.ALLOCATION:
      return 'Review Changes';
    case ManageProfileStep.CONFIRM_ALLOCATIONS:
      return 'Confirm';
  }
}

function getStepPreviousButtonLabel(step: ManageProfileStep): string {
  switch (step) {
    case ManageProfileStep.CHOOSE_METHOD:
      return "What's the Difference?";
    case ManageProfileStep.ALLOCATION:
      return 'Back';
    case ManageProfileStep.CONFIRM_ALLOCATIONS:
      return 'Go Back and Edit';
  }
}

function getStepDescription(
  step: ManageProfileStep,
  profileType: RestakingProfileType,
  isCreatingProfile: boolean,
): string | null {
  switch (step) {
    case ManageProfileStep.CHOOSE_METHOD:
      return 'To participate in MPC services, allocate your staked TNT tokens using one of the available restaking methods. Your choice determines your risk allocation strategy. Would you like to restake as independent or shared?';
    case ManageProfileStep.ALLOCATION:
      return isCreatingProfile
        ? profileType === RestakingProfileType.INDEPENDENT
          ? 'Independent restaking allows you to allocate specific amounts of your stake to individual roles. Active roles may have their stake increased. Inactive roles are flexible for both stake adjustments and removal.'
          : 'Shared restaking allows your entire restake to be allocated across selected roles, amplifying your participation. You can increase the total stake but cannot reduce it until every active service ends. Role removal is possible only if they are inactive.'
        : profileType === RestakingProfileType.INDEPENDENT
          ? 'Independent restaking allows you to allocate specific amounts of your stake to individual roles. Active roles may have their stake increased. Inactive roles are flexible for both stake adjustments and removal.'
          : 'Shared restaking allows your entire restake to be allocated across selected roles, amplifying your participation. You can increase the total stake but cannot reduce it until every active service ends. Role removal is possible only if they are inactive.';
    case ManageProfileStep.CONFIRM_ALLOCATIONS:
      return null;
  }
}

const ManageProfileModalContainer: FC<ManageProfileModalContainerProps> = ({
  hasExistingProfile,
  isModalOpen,
  profileTypeOpt,
  setIsModalOpen,
}) => {
  const [profileType, setProfileType] = useState(
    RestakingProfileType.INDEPENDENT,
  );

  const {
    sharedRestakeAmount,
    setSharedRestakeAmount,
    isLoading: isLoadingSharedRestakeAmount,
    resetToSubstrateAmount: resetSharedRestakeAmount,
  } = useSharedRestakeAmountState();

  const [step, setStep] = useState(ManageProfileStep.CHOOSE_METHOD);
  const isMountedRef = useIsMountedRef();

  const {
    allocations,
    setAllocations,
    setAllocationsDispatch,
    isLoading: isLoadingAllocations,
    reset: resetAllocations,
  } = useAllocationsState(profileType);

  const handlePreviousStep = useCallback(() => {
    const diff = getStepDiff(step, false);
    const previousStep = diff ?? ManageProfileStep.CHOOSE_METHOD;

    if (previousStep === ManageProfileStep.CHOOSE_METHOD) {
      resetAllocations();
    }

    setStep(previousStep);
  }, [resetAllocations, step]);

  const handleNextStep = useCallback(() => {
    const nextStep = getStepDiff(step, true);

    if (nextStep !== null) {
      setStep(nextStep);

      return;
    }

    // Have reached the end; submit the transaction.
    if (profileType === RestakingProfileType.INDEPENDENT) {
      return;
    } else {
      assert(
        sharedRestakeAmount !== null,
        'Shared restake amount should be set if updating shared profile',
      );
    }
  }, [profileType, sharedRestakeAmount, step]);

  const resetAllocationState = useCallback(() => {
    resetAllocations();
    resetSharedRestakeAmount();
  }, [resetAllocations, resetSharedRestakeAmount]);

  const { errors, clearErrors } = useErrorCountContext();

  // Reset allocations when the selected profile type changes.
  // This is necessary because the allocations are specific to
  // the profile type, and if the user switches between the
  // independent and shared profile types, the allocations
  // should be reset to an empty object.
  useEffect(() => {
    resetAllocationState();
  }, [profileType, resetAllocationState]);

  // Clear errors when the user changes the step
  // to the "choose method" step, which essentially
  // resets the state of the modal.
  useEffect(() => {
    if (step === ManageProfileStep.CHOOSE_METHOD) {
      clearErrors();
    }
  }, [clearErrors, step]);

  // Reset state when modal is closed.
  useEffect(() => {
    if (isModalOpen) {
      return;
    }

    // Use a timeout to prevent the state reset from being visible
    // to the user as the modal is closing (the closing animation takes
    // a few hundred milliseconds to complete).
    const timeoutHandle = setTimeout(() => {
      if (isMountedRef.current) {
        setProfileType(RestakingProfileType.INDEPENDENT);
        setStep(ManageProfileStep.CHOOSE_METHOD);
        resetAllocationState();
      }
    }, 500);

    return () => clearTimeout(timeoutHandle);
  }, [isModalOpen, isMountedRef, resetAllocations, resetAllocationState]);

  // TODO: This will be `false` if it's still loading. It'll default to `true`, but hat's fine for now since it's used to show text/copy in the UI. Ideally would want a loading state to show the user, before showing everything else in this component.
  const isCreatingProfile =
    hasExistingProfile === false || profileTypeOpt?.value !== profileType;

  const stepDescription = getStepDescription(
    step,
    profileType,
    isCreatingProfile,
  );

  const isLoading =
    isLoadingSharedRestakeAmount ||
    isLoadingAllocations ||
    hasExistingProfile === null;

  const canContinue =
    step === ManageProfileStep.CHOOSE_METHOD ||
    (!isLoading && errors.size === 0);

  return (
    <Modal open>
      <ModalContent
        onInteractOutside={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        size="lg"
      >
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          {getStepTitle(step, profileType, isCreatingProfile)}
        </ModalHeader>

        <ModalBody className="py-3">
          {stepDescription !== null && (
            <Typography variant="body2" fw="normal">
              {stepDescription}
            </Typography>
          )}

          <AllocationStep
            step={step}
            profileType={profileType}
            setProfileType={setProfileType}
            allocations={allocations}
            sharedRestakeAmount={sharedRestakeAmount}
            setSharedRestakeAmount={setSharedRestakeAmount}
            setAllocations={setAllocations}
            setAllocationsDispatch={setAllocationsDispatch}
          />
        </ModalBody>

        <ModalFooter className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button isFullWidth variant="secondary" onClick={handlePreviousStep}>
            {getStepPreviousButtonLabel(step)}
          </Button>

          <Button
            onClick={handleNextStep}
            isFullWidth
            className="!mt-0"
            // Prevent the user from continuing or making changes while
            // the existing allocations are being fetched, while transactions
            // are being processed, or if there are input errors.
            isDisabled={!canContinue}
            isLoading={isLoading}
          >
            {getStepNextButtonLabel(step)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManageProfileModalContainer;
