'use client';

// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import '@webb-tools/api-derive';

import {
  ApiInitHandler,
  Currency,
  NewNotesTxResult,
  NotificationHandler,
  ProvideCapabilities,
  RelayChainMethods,
  TransactionExecutor,
  TransactionState,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
  calculateProvingLeavesAndCommitmentIndex,
} from '@webb-tools/abstract-api-provider';
import { AccountsAdapter } from '@webb-tools/abstract-api-provider/account/Accounts.adapter';
import { Bridge, WebbState } from '@webb-tools/abstract-api-provider/state';
import { EventBus } from '@webb-tools/app-util';
import { ApiConfig, Wallet } from '@webb-tools/dapp-config';
import {
  ActionsBuilder,
  CurrencyRole,
  InteractiveFeedback,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import {
  ChainType,
  calculateTypedChainId,
  parseTypedChainId,
  toFixedHex,
} from '@webb-tools/dapp-types/TypedChainId';
import { NoteManager } from '@webb-tools/note-manager';
import { CircomUtxo, Utxo, UtxoGenInput } from '@webb-tools/sdk-core';

import { ApiPromise } from '@polkadot/api';
import {
  InjectedAccount,
  InjectedExtension,
} from '@polkadot/extension-inject/types';

import { VoidFn } from '@polkadot/api/types';
import { u8aToHex } from '@polkadot/util';
import { BridgeStorage } from '@webb-tools/browser-utils';
import Storage from '@webb-tools/dapp-types/Storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { PublicClient, zeroAddress } from 'viem';
import { PolkadotProvider } from './ext-provider';
import { getLeaves } from './mt-utils';
import { PolkaTXBuilder } from './transaction';
import { PolkadotBridgeApi } from './webb-provider/bridge-api';
import { PolkadotChainQuery } from './webb-provider/chain-query';
import { PolkadotCrowdloan } from './webb-provider/crowdloan';
import { PolkadotECDSAClaims } from './webb-provider/ecdsa-claims';
import { PolkadotRelayerManager } from './webb-provider/relayer-manager';
import { PolkadotVAnchorActions } from './webb-provider/vanchor-actions';
import { PolkadotWrapUnwrap } from './webb-provider/wrap-unwrap';

export class WebbPolkadot
  extends EventBus<WebbProviderEvents>
  implements WebbApiProvider<WebbPolkadot>
{
  readonly type = 'polkadot';

  state: WebbState;
  noteManager: NoteManager | null = null;

  readonly methods: WebbMethods<'polkadot', WebbApiProvider<WebbPolkadot>>;

  readonly relayChainMethods: RelayChainMethods<WebbApiProvider<WebbPolkadot>>;

  readonly api: ApiPromise;
  readonly txBuilder: PolkaTXBuilder;

  readonly newBlockSub = new Set<VoidFn>();

  readonly typedChainidSubject: BehaviorSubject<number>;

  private _newBlock = new BehaviorSubject<null | bigint>(null);

  // Map to store the max edges for each tree id
  private readonly vAnchorMaxEdges = new Map<string, number>();

  // Map to store the vAnchor levels for each tree id
  private readonly vAnchorLevels = new Map<string, number>();

  private constructor(
    readonly apiPromise: ApiPromise,
    typedChainId: number,
    readonly injectedExtension: InjectedExtension,
    readonly relayerManager: PolkadotRelayerManager,
    readonly config: ApiConfig,
    readonly notificationHandler: NotificationHandler,
    private readonly provider: PolkadotProvider,
    readonly accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
  ) {
    super();

    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

    this.accounts = this.provider.accounts;
    this.api = this.provider.api;
    this.txBuilder = this.provider.txBuilder;

    this.relayChainMethods = {
      crowdloan: {
        enabled: true,
        inner: new PolkadotCrowdloan(this),
      },
    };

    this.methods = {
      bridgeApi: new PolkadotBridgeApi(this),
      chainQuery: new PolkadotChainQuery(this),
      claim: {
        core: new PolkadotECDSAClaims(this),
        enabled: true,
      },
      variableAnchor: {
        actions: {
          enabled: true,
          inner: new PolkadotVAnchorActions(this),
        },
      },
      wrapUnwrap: {
        core: {
          enabled: true,
          inner: new PolkadotWrapUnwrap(this),
        },
      },
    };

    // Take the configured values in the config and create objects used in the
    // api (e.g. Record<number, CurrencyConfig> => Currency[])
    const initialSupportedCurrencies: Record<number, Currency> = {};
    for (const currencyConfig of Object.values(config.currencies)) {
      initialSupportedCurrencies[currencyConfig.id] = new Currency(
        currencyConfig,
      );
    }

    // All supported bridges are supplied by the config, before passing to the state.
    const initialSupportedBridges: Record<number, Bridge> = {};
    for (const bridgeConfig of Object.values(config.bridgeByAsset)) {
      if (Object.keys(bridgeConfig.anchors).includes(typedChainId.toString())) {
        const bridgeCurrency = initialSupportedCurrencies[bridgeConfig.asset];
        const bridgeTargets = bridgeConfig.anchors;
        if (bridgeCurrency.getRole() === CurrencyRole.Governable) {
          initialSupportedBridges[bridgeConfig.asset] = new Bridge(
            bridgeCurrency,
            bridgeTargets,
          );
        }
      }
    }

    this.state = new WebbState(
      initialSupportedCurrencies,
      initialSupportedBridges,
    );

    // set the available bridges of the new chain
    this.state.setBridgeOptions(initialSupportedBridges);

    // Select a reasonable default bridge
    this.state.activeBridge = Object.values(initialSupportedBridges)[0] ?? null;
  }

  capabilities?: ProvideCapabilities | undefined;

  getProvider() {
    return this.provider;
  }

  getBlockNumber(): bigint | null {
    return this._newBlock.getValue();
  }

  async getChainId(): Promise<number> {
    const chainIdentifier =
      this.provider.api.consts.linkableTreeBn254.chainIdentifier;
    if (!chainIdentifier.isEmpty) {
      return parseInt(chainIdentifier.toHex());
    }

    // If the chainId is not set, fallback to the typedChainId
    return parseTypedChainId(this.typedChainId).chainId;
  }

  async awaitMetaDataCheck() {
    /// delay some time till the UI is instantiated and then check if the dApp needs to update extension meta data
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const metaData = await this.provider.checkMetaDataUpdate();

    if (metaData) {
      /// feedback body
      const feedbackEntries = InteractiveFeedback.feedbackEntries([
        {
          header: 'Update Polkadot MetaData',
        },
      ]);
      /// feedback actions
      const actions = ActionsBuilder.init()
        /// update extension metadata
        .action(
          'Update MetaData',
          () => this.provider.updateMetaData(metaData),
          'success',
        )
        .actions();
      const feedback = new InteractiveFeedback(
        'info',
        actions,
        () => {
          return null;
        },
        feedbackEntries,
      );

      /// emit the feedback object
      this.emit('interactiveFeedback', feedback);
    }
  }

  async ensureApiInterface() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const merkleRPC = Boolean(this.api.rpc.mt.getLeaves);
    // merkle rpc
    const merklePallet = this.api.query.merkleTreeBn254;
    const vAnchorPallet = this.api.query.vAnchorBn254;
    if (!merklePallet || !merkleRPC || !vAnchorPallet) {
      throw WebbError.from(WebbErrorCodes.InsufficientProviderInterface);
    }

    return true;
  }

  static async init(
    appName: string, // App name, arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    errorHandler: ApiInitHandler, // Error handler that will be used to catch errors while initializing the provider
    relayerBuilder: PolkadotRelayerManager, // Webb Relayer builder for relaying withdraw
    apiConfig: ApiConfig, // The whole and current app configuration
    notification: NotificationHandler, // Notification handler that will be used for the provider
    typedChainId: number,
    wallet: Wallet, // Current wallet to initialize
  ): Promise<WebbPolkadot> {
    const [apiPromise, injectedExtension] = await PolkadotProvider.getParams(
      appName,
      endpoints,
      errorHandler.onError,
      wallet,
    );

    const accountsFromExtension = await injectedExtension.accounts.get();
    if (accountsFromExtension.length === 0) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notification, injectedExtension),
    );
    const accounts = provider.accounts;
    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      relayerBuilder,
      apiConfig,
      notification,
      provider,
      accounts,
    );
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;

    // await instance.ensureApiInterface();
    const unsub = await instance.listenerBlocks();
    instance.newBlockSub.add(unsub);

    return instance;
  }

  static async getApiPromise(endpoint: string): Promise<ApiPromise> {
    return new Promise((resolve, reject) => {
      resolve(
        PolkadotProvider.getApiPromise([endpoint], (error) => reject(error)),
      );
    });
  }

  async destroy(): Promise<void> {
    await this.provider.destroy();
    this.newBlockSub.forEach((unsub) => unsub());
  }

  private async listenerBlocks() {
    const block = await this.provider.api.query.system.number();
    this._newBlock.next(block.toBigInt());
    const sub = await this.provider.api.rpc.chain.subscribeFinalizedHeads(
      (header) => {
        this._newBlock.next(header.number.toBigInt());
      },
    );
    return sub;
  }

  get newBlock(): Observable<bigint | null> {
    return this._newBlock.asObservable();
  }

  get typedChainId(): number {
    return this.typedChainidSubject.getValue();
  }

  async getVAnchorLeaves(
    api: ApiPromise,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      treeId?: number;
      palletId?: number;
      tx?: TransactionExecutor<NewNotesTxResult>;
    },
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  }> {
    const { treeHeight, targetRoot, commitment, treeId, palletId, tx } =
      options;

    if (typeof treeId === 'undefined' || typeof palletId === 'undefined') {
      throw WebbError.from(WebbErrorCodes.InvalidArguments);
    }

    const chainId = parseInt(
      api.consts.linkableTreeBn254.chainIdentifier.toHex(),
    );
    const typedChainId = calculateTypedChainId(ChainType.Substrate, chainId);
    const chain = this.config.chains[typedChainId];

    const relayers = this.relayerManager.getRelayers({
      baseOn: 'substrate',
      chainId,
    });

    const leavesFromRelayers =
      await this.relayerManager.fetchLeavesFromRelayers(
        relayers,
        api,
        storage,
        {
          ...options,
          palletId,
          treeId,
        },
      );

    // If unable to fetch leaves from the relayers, get them from chain
    if (!leavesFromRelayers) {
      tx?.next(TransactionState.FetchingLeaves, {
        start: 0, // Dummy values
        current: 0, // Dummy values
        end: 0,
      });

      // check if we already cached some values.
      const lastQueriedBlock = await storage.get('lastQueriedBlock');
      const storedLeaves = await storage.get('leaves');
      // The end block number is the current block number
      const endBlock = await api.derive.chain.bestNumber();

      const queryBlock = lastQueriedBlock ? lastQueriedBlock + 1 : 0;

      console.log(
        `Query leaves from chain ${
          chain?.name ?? 'Unknown'
        } of tree id ${treeId} from block ${queryBlock} to ${endBlock.toNumber()}`,
      );

      const leavesFromChain = await getLeaves(
        api,
        treeId,
        queryBlock,
        endBlock.toNumber(),
      );

      const leavesFromChainHex = leavesFromChain
        .map((leaf) => u8aToHex(leaf))
        .filter((leaf) => leaf !== zeroAddress); // Filter out zero leaves

      // Merge the leaves from chain with the stored leaves
      // and fixed them to 32 bytes
      const leaves = [...storedLeaves, ...leavesFromChainHex].map((leaf) =>
        toFixedHex(leaf),
      );

      console.log(`Got ${leaves.length} leaves from chain`);

      tx?.next(TransactionState.ValidatingLeaves, undefined);
      // Validate the leaves
      const { leafIndex, provingLeaves } =
        await calculateProvingLeavesAndCommitmentIndex(
          treeHeight,
          leaves,
          targetRoot,
          commitment.toString(),
        );

      // If the leafIndex is -1, it means the commitment is not in the tree
      // and we should continue to the next relayer
      if (leafIndex === -1) {
        tx?.next(TransactionState.ValidatingLeaves, false);
      } else {
        tx?.next(TransactionState.ValidatingLeaves, true);
      }

      // Cached the new leaves if not local chain
      if (chain?.tag !== 'dev') {
        await storage.set('lastQueriedBlock', endBlock.toNumber());
        await storage.set('leaves', leaves);
      }

      return {
        provingLeaves,
        commitmentIndex: leafIndex,
      };
    }

    return leavesFromRelayers;
  }

  async getVAnchorMaxEdges(
    treeId: string,
    provider?: PublicClient | ApiPromise,
  ): Promise<number> {
    // If provider is not instance of ApiPromise, display error and use `this.api` instead
    if (!(provider instanceof ApiPromise)) {
      console.error(
        '`provider` of the type `providers.Provider` is not supported in polkadot provider overriding to `this.api`',
      );
      provider = this.api;
    }

    const storedMaxEdges = this.vAnchorMaxEdges.get(treeId);
    if (storedMaxEdges) {
      return storedMaxEdges;
    }

    const api = provider || this.api;
    const maxEdges = await api.query.linkableTreeBn254.maxEdges(treeId);
    if (maxEdges.isEmpty) {
      console.error(`Max edges for tree ${treeId} is empty`);
      return 0;
    }

    this.vAnchorMaxEdges.set(treeId, parseInt(maxEdges.toHex()));
    return parseInt(maxEdges.toHex());
  }

  async getVAnchorLevels(
    treeId: string,
    provider?: PublicClient | ApiPromise,
  ): Promise<number> {
    if (!(provider instanceof ApiPromise)) {
      console.error(
        '`provider` of the type `providers.Provider` is not supported in polkadot provider overriding to `this.api`',
      );
      provider = this.api;
    }

    const storedLevels = this.vAnchorLevels.get(treeId);
    if (storedLevels) {
      return storedLevels;
    }

    const api = provider || this.api;
    const treeData = await api.query.merkleTreeBn254.trees(treeId);
    if (treeData.isEmpty) {
      throw WebbError.from(WebbErrorCodes.AnchorIdNotFound);
    }

    const treeMedata = (treeData as any).unwrap();
    const levels = treeMedata.depth.toNumber();

    this.vAnchorLevels.set(treeId, levels);

    return levels;
  }

  generateUtxo(input: UtxoGenInput): Promise<Utxo> {
    return CircomUtxo.generateUtxo(input);
  }

  async sign(message: string): Promise<string> {
    const { web3Accounts, web3FromSource } = await import(
      '@polkadot/extension-dapp'
    );

    const account = await this.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const allAccounts = await web3Accounts();
    const injectedAccount = allAccounts.find(
      (acc) =>
        acc.address === account.address &&
        acc.meta.name === account.name &&
        acc.meta.source === this.injectedExtension.name,
    );

    if (!injectedAccount) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const injector = await web3FromSource(injectedAccount.meta.source);

    // this injector object has a signer and a signRaw method
    // to be able to sign raw bytes
    const signRaw = injector?.signer?.signRaw;

    if (!signRaw) {
      throw WebbError.from(WebbErrorCodes.NoSignRaw);
    }

    const { signature } = await signRaw({
      address: account.address,
      data: message,
      type: 'bytes',
    });

    return signature;
  }
}
