/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';

import { IDeployer } from './IDeployer';

export class IDeployerFactory {
  static connect(address: string, signerOrProvider: Signer | Provider): IDeployer {
    return new Contract(address, _abi, signerOrProvider) as IDeployer;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_initCode',
        type: 'bytes',
      },
      {
        internalType: 'bytes32',
        name: '_salt',
        type: 'bytes32',
      },
    ],
    name: 'deploy',
    outputs: [
      {
        internalType: 'address payable',
        name: 'createdContract',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
