import TreasuryAbi from '@/contracts/TreasuryABI.json';

export const TREASURY_ABI = TreasuryAbi;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const TREASURY_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS ?? '';

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
