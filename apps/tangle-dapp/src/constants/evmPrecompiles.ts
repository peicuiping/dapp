import { BN } from '@polkadot/util';
import { SubstrateBytes32Address } from '@webb-tools/webb-ui-components/types/address';
import { Address } from 'viem';

export enum Precompile {
  STAKING,
  VESTING,
  BATCH,
  BALANCES_ERC20,
  LST,
}

export type AbiFunctionName<T extends Precompile> = T extends Precompile.STAKING
  ?
      | 'bond'
      | 'bondExtra'
      | 'chill'
      | 'currentEra'
      | 'erasTotalStake'
      | 'isNominator'
      | 'isValidator'
      | 'maxNominatorCount'
      | 'maxValidatorCount'
      | 'minActiveStake'
      | 'minNominatorBond'
      | 'minValidatorBond'
      | 'nominate'
      | 'payoutStakers'
      | 'rebond'
      | 'setController'
      | 'setPayee'
      | 'unbond'
      | 'validatorCount'
      | 'withdrawUnbonded'
  : T extends Precompile.VESTING
    ? 'vest'
    : T extends Precompile.BATCH
      ? 'batchAll' | 'batchSome' | 'batchSomeUntilFailure'
      : T extends Precompile.BALANCES_ERC20
        ? 'transfer'
        : T extends Precompile.LST
          ?
              | 'join'
              | 'bondExtra'
              | 'unbond'
              | 'poolWithdrawUnbonded'
              | 'withdrawUnbonded'
              | 'create'
              | 'createWithPoolId'
              | 'nominate'
              | 'setState'
              | 'setMetadata'
              | 'setConfigs'
              | 'updateRoles'
          : never;

type AbiType =
  | 'uint256'
  | 'bytes32'
  | 'uint32'
  | 'bool'
  | 'address'
  | 'uint8'
  | 'bytes'
  | 'uint64';

type AbiTypeSuper = AbiType | `${AbiType}[]`;

type InputOutputDef = {
  internalType: AbiTypeSuper;
  name: string;
  type: AbiTypeSuper;
};

// TODO: Use Viem ABI types instead, as they already handle this + providing argument type inference: https://viem.sh/docs/typescript#utilities
export type AbiFunction<T extends Precompile> = {
  inputs: InputOutputDef[];
  name: AbiFunctionName<T>;
  outputs: InputOutputDef[];
  stateMutability: 'nonpayable' | 'view';
  type: 'function';
};

/**
 * Argument type definitions for each EVM precompile function.
 */
export type AbiFunctionArgs = {
  [Precompile.STAKING]: {
    bond: [BN, Address];
    bondExtra: [BN];
    chill: [];
    currentEra: [];
    erasTotalStake: [BN];
    isNominator: [Address];
    isValidator: [Address];
    maxNominatorCount: [];
    maxValidatorCount: [];
    minActiveStake: [];
    minNominatorBond: [];
    minValidatorBond: [];
    nominate: [Address[]];
    payoutStakers: [Address, number];
    rebond: [BN];
    setController: [];
    setPayee: [number];
    unbond: [BN];
    validatorCount: [];
    withdrawUnbonded: [number];
  };

  [Precompile.VESTING]: {
    vest: [];
  };

  [Precompile.BATCH]: {
    batchAll: [Address[], BN[], string[], BN[]];
    batchSome: [Address[], BN[], string[], BN[]];
    batchSomeUntilFailure: [Address[], BN[], string[], BN[]];
  };

  [Precompile.BALANCES_ERC20]: {
    transfer: [Address, BN];
  };

  [Precompile.LST]: {
    join: [BN, BN];
    bondExtra: [BN, number, BN];
    unbond: [SubstrateBytes32Address, BN, BN];
    poolWithdrawUnbonded: [BN, number];
    withdrawUnbonded: [SubstrateBytes32Address, BN, number];
    create: [
      BN,
      SubstrateBytes32Address,
      SubstrateBytes32Address,
      SubstrateBytes32Address,
      string,
      string,
    ];
    nominate: [BN, SubstrateBytes32Address[]];
    setState: [BN, number];
    setMetadata: [BN, string];
    setConfigs: [BN, BN, number, number];
    updateRoles: [
      BN,
      SubstrateBytes32Address,
      SubstrateBytes32Address,
      SubstrateBytes32Address,
    ];
  };
};

// See https://github.com/webb-tools/tangle/tree/main/precompiles for more details.
export enum PrecompileAddress {
  STAKING = '0x0000000000000000000000000000000000000800',
  VESTING = '0x0000000000000000000000000000000000000801',
  BATCH = '0x0000000000000000000000000000000000000808',
  BALANCES_ERC20 = '0x0000000000000000000000000000000000000802',
  LST = '0x0000000000000000000000000000000000000824',
}

export const STAKING_PRECOMPILE_ABI: AbiFunction<Precompile.STAKING>[] = [
  {
    name: 'bond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'payee',
        type: 'bytes32',
      },
    ],
  },
  {
    name: 'bondExtra',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxAdditional',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    name: 'chill',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    outputs: [],
  },
  {
    name: 'currentEra',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
  },
  {
    name: 'erasTotalStake',
    stateMutability: 'view',
    type: 'function',
    inputs: [
      {
        internalType: 'uint32',
        name: 'eraIndex',
        type: 'uint32',
      },
    ],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'isNominator',
    stateMutability: 'view',
    type: 'function',
    inputs: [
      {
        internalType: 'address',
        name: 'stash',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
  },
  {
    name: 'isValidator',
    stateMutability: 'view',
    type: 'function',
    inputs: [
      {
        internalType: 'address',
        name: 'stash',
        type: 'address',
      },
    ],
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
  },
  {
    name: 'maxNominatorCount',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
  },
  {
    name: 'maxValidatorCount',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
  },
  {
    name: 'minActiveStake',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'minNominatorBond',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'minValidatorBond',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    name: 'nominate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'targets',
        type: 'bytes32[]',
      },
    ],
    outputs: [],
  },
  {
    name: 'payoutStakers',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'bytes32',
        name: 'validatorStash',
        type: 'bytes32',
      },
      {
        internalType: 'uint32',
        name: 'era',
        type: 'uint32',
      },
    ],
    outputs: [],
  },
  {
    name: 'rebond',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    name: 'setController',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    outputs: [],
  },
  {
    name: 'setPayee',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint8',
        name: 'payee',
        type: 'uint8',
      },
    ],
    outputs: [],
  },
  {
    name: 'unbond',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    outputs: [],
  },
  {
    name: 'validatorCount',
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
  },
  {
    name: 'withdrawUnbonded',
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'uint32',
        name: 'numSlashingSpans',
        type: 'uint32',
      },
    ],
    outputs: [],
  },
] as const;

// See: https://github.com/webb-tools/tangle/blob/main/precompiles/vesting/src/lib.rs
// Be careful with the input/outputs, as they can lead to a lot of trouble
// if not properly specified.
export const VESTING_PRECOMPILE_ABI: AbiFunction<Precompile.VESTING>[] = [
  {
    name: 'vest',
    type: 'function',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const BATCH_PRECOMPILE_ABI: AbiFunction<Precompile.BATCH>[] = [
  {
    name: 'batchAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'address[]',
        name: 'to',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'value',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'callData',
        type: 'bytes[]',
      },
      {
        internalType: 'uint64[]',
        name: 'gasLimit',
        type: 'uint64[]',
      },
    ],
  },
  {
    name: 'batchSome',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'address[]',
        name: 'to',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'value',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'callData',
        type: 'bytes[]',
      },
      {
        internalType: 'uint64[]',
        name: 'gasLimit',
        type: 'uint64[]',
      },
    ],
  },
  {
    name: 'batchSomeUntilFailure',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      {
        internalType: 'address[]',
        name: 'to',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'value',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'callData',
        type: 'bytes[]',
      },
      {
        internalType: 'uint64[]',
        name: 'gasLimit',
        type: 'uint64[]',
      },
    ],
  },
] as const;

export const BALANCES_ERC20_PRECOMPILE_ABI: AbiFunction<Precompile.BALANCES_ERC20>[] =
  [
    {
      name: 'transfer',
      stateMutability: 'nonpayable',
      type: 'function',
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
    },
  ];

export const LST_PRECOMPILE_ABI: AbiFunction<Precompile.LST>[] = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
    ],
    name: 'join',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'extraType',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'extra',
        type: 'uint256',
      },
    ],
    name: 'bondExtra',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'memberAccount',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'unbondingPoints',
        type: 'uint256',
      },
    ],
    name: 'unbond',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'numSlashingSpans',
        type: 'uint32',
      },
    ],
    name: 'poolWithdrawUnbonded',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'memberAccount',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'numSlashingSpans',
        type: 'uint32',
      },
    ],
    name: 'withdrawUnbonded',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'nominator',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'bouncer',
        type: 'bytes32',
      },
      {
        internalType: 'uint8[]',
        name: 'name',
        type: 'uint8[]',
      },
      {
        internalType: 'uint8[]',
        name: 'icon',
        type: 'uint8[]',
      },
    ],
    name: 'create',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: 'validators',
        type: 'bytes32[]',
      },
    ],
    name: 'nominate',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'state',
        type: 'uint8',
      },
    ],
    name: 'setState',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'metadata',
        type: 'bytes',
      },
    ],
    name: 'setMetadata',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'minJoinBond',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'minCreateBond',
        type: 'uint256',
      },
      {
        internalType: 'uint32',
        name: 'maxPools',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'globalMaxCommission',
        type: 'uint32',
      },
    ],
    name: 'setConfigs',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'poolId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'root',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'nominator',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'bouncer',
        type: 'bytes32',
      },
    ],
    name: 'updateRoles',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export function getPrecompileAddress(
  precompile: Precompile,
): PrecompileAddress {
  switch (precompile) {
    case Precompile.STAKING:
      return PrecompileAddress.STAKING;
    case Precompile.VESTING:
      return PrecompileAddress.VESTING;
    case Precompile.BATCH:
      return PrecompileAddress.BATCH;
    case Precompile.BALANCES_ERC20:
      return PrecompileAddress.BALANCES_ERC20;
    case Precompile.LST:
      return PrecompileAddress.LST;
  }
}

export function getPrecompileAbi(
  precompile: Precompile,
): AbiFunction<Precompile>[] {
  switch (precompile) {
    case Precompile.STAKING:
      return STAKING_PRECOMPILE_ABI;
    case Precompile.VESTING:
      return VESTING_PRECOMPILE_ABI;
    case Precompile.BATCH:
      return BATCH_PRECOMPILE_ABI;
    case Precompile.BALANCES_ERC20:
      return BALANCES_ERC20_PRECOMPILE_ABI;
    case Precompile.LST:
      return LST_PRECOMPILE_ABI;
  }
}
