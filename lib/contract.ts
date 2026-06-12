import TreasuryAbi from '@/contracts/TreasuryABI.json';

export const TREASURY_ABI = TreasuryAbi;

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const USDT_TOKEN_ADDRESS = '0xAC4e59F42eE53AC4276bD2541096F2681c565472';

export const USDT_DECIMALS = 18;

export const TREASURY_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS ?? '';

export const TREASURY_OWNER_ADDRESSES = [
  '0xBb996B51e074Cf1ad52891c01f8B9e22dB9b9fA7',
  '0xeFe37291AE0F7022CDCb9b5CA6Cb10fe581B0069',
  '0x9CdFb3C503d8317E93fF8b697D16Dc073D8473d2',
  '0x59a6D2a6BDc0e15fCdF84Cd93aaE90CC66BF2cd8',
  '0xb6dCa9B46B3De7eEcEd4980b3Fc61aB878d991AF'
];

export type TreasuryRequest = {
  txId: bigint;
  tokenAddress: string;
  requester: string;
  toAddress: string;
  amount: bigint;
  expiryTime: bigint;
  isPending: boolean;
  approvalCount: bigint;
  approvers: string[];
};