import { ArrowRightUp, ShieldedCheckLineIcon } from '@webb-tools/icons';
import useSubstrateExplorerUrl from '@webb-tools/tangle-shared-ui/hooks/useSubstrateExplorerUrl';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { type FC } from 'react';
import { Hash } from 'viem';

const SuccessClient: FC<{ blockHash: Hash }> = ({ blockHash }) => {
  const { getExplorerUrl } = useSubstrateExplorerUrl();

  const txExplorerUrl = getExplorerUrl(blockHash, 'block');

  return (
    <AppTemplate.Content>
      <AppTemplate.Title
        title="You have successfully claimed $TNT airdrop!"
        subTitle="CONGRATULATIONS!"
        overrideSubTitleProps={{
          className: 'text-blue-70 dark:text-blue-50',
        }}
      />

      <AppTemplate.Body>
        <div className="flex flex-col gap-4 p-9">
          <ShieldedCheckLineIcon
            width={54}
            height={54}
            className="mx-auto fill-green-70 dark:fill-green-30"
          />

          <Typography variant="body1" ta="center">
            You have successfully claimed TNT airdrop! Your transaction has been
            confirmed on the Tangle network. View transaction details on the
            explorer link below.
          </Typography>

          {txExplorerUrl ? (
            <Button
              target="_blank"
              href={txExplorerUrl.toString()}
              size="sm"
              variant="link"
              className="mx-auto"
              rightIcon={
                <ArrowRightUp className="fill-current dark:fill-current" />
              }
            >
              View Explorer
            </Button>
          ) : blockHash ? (
            <KeyValueWithButton
              label="Transaction Hash"
              size="sm"
              className="mx-auto"
              keyValue={blockHash}
            />
          ) : null}
        </div>
      </AppTemplate.Body>
    </AppTemplate.Content>
  );
};

export default SuccessClient;
