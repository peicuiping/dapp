/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { ethers, EventFilter, Signer, BigNumber, BigNumberish, PopulatedTransaction } from 'ethers';
import { Contract, ContractTransaction, Overrides, CallOverrides } from '@ethersproject/contracts';
import { BytesLike } from '@ethersproject/bytes';
import { Listener, Provider } from '@ethersproject/providers';
import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi';

interface IusdtInterface extends ethers.utils.Interface {
  functions: {
    '_totalSupply()': FunctionFragment;
    'balanceOf(address)': FunctionFragment;
    'totalSupply()': FunctionFragment;
    'transfer(address,uint256)': FunctionFragment;
    'allowance(address,address)': FunctionFragment;
    'transferFrom(address,address,uint256)': FunctionFragment;
    'approve(address,uint256)': FunctionFragment;
  };

  encodeFunctionData(functionFragment: '_totalSupply', values?: undefined): string;
  encodeFunctionData(functionFragment: 'balanceOf', values: [string]): string;
  encodeFunctionData(functionFragment: 'totalSupply', values?: undefined): string;
  encodeFunctionData(functionFragment: 'transfer', values: [string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'allowance', values: [string, string]): string;
  encodeFunctionData(functionFragment: 'transferFrom', values: [string, string, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'approve', values: [string, BigNumberish]): string;

  decodeFunctionResult(functionFragment: '_totalSupply', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'balanceOf', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'totalSupply', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transfer', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'allowance', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferFrom', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'approve', data: BytesLike): Result;

  events: {
    'Approval(address,address,uint256)': EventFragment;
    'Transfer(address,address,uint256)': EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: 'Approval'): EventFragment;
  getEvent(nameOrSignatureOrTopic: 'Transfer'): EventFragment;
}

export class Iusdt extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IusdtInterface;

  functions: {
    _totalSupply(overrides?: Overrides): Promise<ContractTransaction>;

    '_totalSupply()'(overrides?: Overrides): Promise<ContractTransaction>;

    balanceOf(
      who: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    'balanceOf(address)'(
      who: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    totalSupply(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    'totalSupply()'(
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    transfer(to: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

    'transfer(address,uint256)'(to: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

    allowance(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    'allowance(address,address)'(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<{
      0: BigNumber;
    }>;

    transferFrom(from: string, to: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

    'transferFrom(address,address,uint256)'(
      from: string,
      to: string,
      value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    approve(spender: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

    'approve(address,uint256)'(
      spender: string,
      value: BigNumberish,
      overrides?: Overrides
    ): Promise<ContractTransaction>;
  };

  _totalSupply(overrides?: Overrides): Promise<ContractTransaction>;

  '_totalSupply()'(overrides?: Overrides): Promise<ContractTransaction>;

  balanceOf(who: string, overrides?: CallOverrides): Promise<BigNumber>;

  'balanceOf(address)'(who: string, overrides?: CallOverrides): Promise<BigNumber>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  'totalSupply()'(overrides?: CallOverrides): Promise<BigNumber>;

  transfer(to: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

  'transfer(address,uint256)'(to: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

  allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

  'allowance(address,address)'(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

  transferFrom(from: string, to: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

  'transferFrom(address,address,uint256)'(
    from: string,
    to: string,
    value: BigNumberish,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  approve(spender: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

  'approve(address,uint256)'(spender: string, value: BigNumberish, overrides?: Overrides): Promise<ContractTransaction>;

  callStatic: {
    _totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    '_totalSupply()'(overrides?: CallOverrides): Promise<BigNumber>;

    balanceOf(who: string, overrides?: CallOverrides): Promise<BigNumber>;

    'balanceOf(address)'(who: string, overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    'totalSupply()'(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(to: string, value: BigNumberish, overrides?: CallOverrides): Promise<void>;

    'transfer(address,uint256)'(to: string, value: BigNumberish, overrides?: CallOverrides): Promise<void>;

    allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

    'allowance(address,address)'(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

    transferFrom(from: string, to: string, value: BigNumberish, overrides?: CallOverrides): Promise<void>;

    'transferFrom(address,address,uint256)'(
      from: string,
      to: string,
      value: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    approve(spender: string, value: BigNumberish, overrides?: CallOverrides): Promise<void>;

    'approve(address,uint256)'(spender: string, value: BigNumberish, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    Approval(owner: string | null, spender: string | null, value: null): EventFilter;

    Transfer(from: string | null, to: string | null, value: null): EventFilter;
  };

  estimateGas: {
    _totalSupply(overrides?: Overrides): Promise<BigNumber>;

    '_totalSupply()'(overrides?: Overrides): Promise<BigNumber>;

    balanceOf(who: string, overrides?: CallOverrides): Promise<BigNumber>;

    'balanceOf(address)'(who: string, overrides?: CallOverrides): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    'totalSupply()'(overrides?: CallOverrides): Promise<BigNumber>;

    transfer(to: string, value: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    'transfer(address,uint256)'(to: string, value: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

    'allowance(address,address)'(owner: string, spender: string, overrides?: CallOverrides): Promise<BigNumber>;

    transferFrom(from: string, to: string, value: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    'transferFrom(address,address,uint256)'(
      from: string,
      to: string,
      value: BigNumberish,
      overrides?: Overrides
    ): Promise<BigNumber>;

    approve(spender: string, value: BigNumberish, overrides?: Overrides): Promise<BigNumber>;

    'approve(address,uint256)'(spender: string, value: BigNumberish, overrides?: Overrides): Promise<BigNumber>;
  };

  populateTransaction: {
    _totalSupply(overrides?: Overrides): Promise<PopulatedTransaction>;

    '_totalSupply()'(overrides?: Overrides): Promise<PopulatedTransaction>;

    balanceOf(who: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    'balanceOf(address)'(who: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    'totalSupply()'(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transfer(to: string, value: BigNumberish, overrides?: Overrides): Promise<PopulatedTransaction>;

    'transfer(address,uint256)'(to: string, value: BigNumberish, overrides?: Overrides): Promise<PopulatedTransaction>;

    allowance(owner: string, spender: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    'allowance(address,address)'(
      owner: string,
      spender: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    transferFrom(from: string, to: string, value: BigNumberish, overrides?: Overrides): Promise<PopulatedTransaction>;

    'transferFrom(address,address,uint256)'(
      from: string,
      to: string,
      value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    approve(spender: string, value: BigNumberish, overrides?: Overrides): Promise<PopulatedTransaction>;

    'approve(address,uint256)'(
      spender: string,
      value: BigNumberish,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;
  };
}
