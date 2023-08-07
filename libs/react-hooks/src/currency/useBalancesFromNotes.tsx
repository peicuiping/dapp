import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ensureHex } from '@webb-tools/dapp-config';
import { CurrencyRole } from '@webb-tools/dapp-types';
import { ResourceId, calculateTypedChainId } from '@webb-tools/sdk-core';
import { hexToU8a } from '@webb-tools/utils';
import { useMemo } from 'react';
import { formatUnits } from 'viem';
import { useNoteAccount } from '../useNoteAccount';

/**
 * The return type of the useBalancesFromNotes
 * Record of balances (currencyId => Record<typedChainId, balance>)
 */
type UseBalancesFromNotesReturnType = Record<number, Record<number, number>>;

/**
 * Get the balances of each fungible currency
 * on the current connected chain from the notes
 * @returns {Record<number, Record<number, number>>} The record of balances (currencyId => Record<typedChainId, balance>)
 */
export const useBalancesFromNotes = (): UseBalancesFromNotesReturnType => {
  const { apiConfig } = useWebContext();

  const { allNotes } = useNoteAccount();

  const allFungibles = useMemo(() => {
    return Currency.fromArray(
      apiConfig.getCurrenciesBy({ role: CurrencyRole.Governable })
    );
  }, [apiConfig]);

  return useMemo(() => {
    return Array.from(allNotes.entries()).reduce(
      (acc, [resourceIdStr, notes]) => {
        try {
          const resourceId = ResourceId.fromBytes(hexToU8a(resourceIdStr));
          const typedChainId = calculateTypedChainId(
            resourceId.chainType,
            resourceId.chainId
          );

          // Iterate through all notes and calculate the balance of each fungible currency
          // on each chain
          notes.forEach(({ note }) => {
            const fungible = allFungibles.find((f) => {
              const anchorIdentifier = apiConfig.getAnchorIdentifier(
                f.id,
                typedChainId
              );

              return (
                anchorIdentifier &&
                f.view.symbol === note.tokenSymbol &&
                f.hasChain(typedChainId) &&
                apiConfig.isEqTargetSystem(
                  ensureHex(anchorIdentifier),
                  resourceId.targetSystem
                )
              );
            });

            if (!fungible) {
              console.error(
                'Not found fungible currency',
                note.tokenSymbol,
                typedChainId
              );
              return;
            }

            const existedRecord = acc[fungible.id];
            // If the record of the fungible currency does not exist
            // then create a new record with the amount of the note
            // on the current chain and return
            if (!existedRecord) {
              const amount = +formatUnits(
                BigInt(note.amount),
                +note.denomination
              );

              acc[fungible.id] = {
                [typedChainId]: amount,
              };

              return;
            }

            // If the record of the fungible currency exists
            // then check if the amount on the current chain exists
            const existedAmount = existedRecord[typedChainId];

            // If the amount on the current chain exists
            // then add the amount of the note to the existed amount
            // and return
            if (existedAmount) {
              const amount = +formatUnits(
                BigInt(note.amount),
                +note.denomination
              );

              acc[fungible.id] = {
                ...existedRecord,
                [typedChainId]: existedAmount + amount,
              };

              return;
            }

            // If the amount on the current chain does not exist
            // then create a new record with the amount of the note
            // on the current chain and return
            const amount = +formatUnits(
              BigInt(note.amount),
              +note.denomination
            );

            acc[fungible.id] = {
              ...existedRecord,
              [typedChainId]: amount,
            };
          });
        } catch (error) {
          console.error('Error parsing note', error);
        }

        return acc;
      },
      {} as Record<number, Record<number, number>>
    );
  }, [allFungibles, allNotes, apiConfig]);
};
