'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserProvider, Contract, ContractTransactionReceipt, ethers } from 'ethers';
import {
  TREASURY_ABI,
  TREASURY_CONTRACT_ADDRESS,
  TREASURY_OWNER_ADDRESSES,
  TreasuryRequest,
  USDT_TOKEN_ADDRESS
} from '@/lib/contract';
import { getErrorMessage } from '@/lib/format';

const OP_BNB_SMART_CHAIN = {
  chainId: '0xCC', // 204
  chainName: 'opBNB',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://opbnb-mainnet-rpc.bnbchain.org'],
  blockExplorerUrls: ['https://opbnb.bscscan.com']
};

type TreasuryStats = {
  requestCount: bigint;
  approveRequired: bigint;
  isWithdrawalActive: boolean;
  isActionRequestActive: boolean;
  isCurrentWalletOwner: boolean;
  contractOwners: string[];
  usdtContractBalance: bigint;
};

type CreateWithdrawalInput = {
  toAddress: string;
  amount: string;
  decimals: number;
};

export function useTreasury() {
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
const [stats, setStats] = useState<TreasuryStats>({
  requestCount: BigInt(0),
  approveRequired: BigInt(0),
  isWithdrawalActive: false,
  isActionRequestActive: false,
  isCurrentWalletOwner: false,
  contractOwners: TREASURY_OWNER_ADDRESSES,
  usdtContractBalance: BigInt(0)
});

  const hasContractAddress = useMemo(() => ethers.isAddress(TREASURY_CONTRACT_ADDRESS), []);

  const getProvider = useCallback(() => {
    if (!window.ethereum) {
      throw new Error('MetaMask or another EIP-1193 wallet is required.');
    }

    return new BrowserProvider(window.ethereum);
  }, []);

  const getSignerContract = useCallback(async () => {
    if (!hasContractAddress) {
      throw new Error('Please set NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS in .env.');
    }

    const activeProvider = provider ?? getProvider();
    const signer = await activeProvider.getSigner();
    return new Contract(TREASURY_CONTRACT_ADDRESS, TREASURY_ABI, signer);
  }, [getProvider, hasContractAddress, provider]);

  const getReadContract = useCallback(() => {
    if (!hasContractAddress) {
      throw new Error('Please set NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS in .env.');
    }

    const activeProvider = provider ?? getProvider();
    return new Contract(TREASURY_CONTRACT_ADDRESS, TREASURY_ABI, activeProvider);
  }, [getProvider, hasContractAddress, provider]);

const refreshStats = useCallback(
  async (walletAddress = account) => {
    if (!walletAddress || !hasContractAddress) return;

    try {
      const activeProvider = provider ?? getProvider();

      const contractCode = await activeProvider.getCode(TREASURY_CONTRACT_ADDRESS);

      if (contractCode === '0x') {
        setError(
          'No contract found on this address for the connected network. Please check contract address or switch network.'
        );
        return;
      }

      const contract = new Contract(
        TREASURY_CONTRACT_ADDRESS,
        TREASURY_ABI,
        activeProvider
      );

      const connectedAddress = ethers.getAddress(walletAddress);

      const requestCount = await contract.requestCount();
      const approveRequired = await contract.approveRequired();
      const isWithdrawalActive = await contract.isWithdrawlActive();
      const isActionRequestActive = await contract.isActionRequestActive();

      const usdtContractBalance = await contract.getContractBalance(
        USDT_TOKEN_ADDRESS
      );

      let isMultiSigOwner = false;
      let isOwnableOwner = false;

      try {
        isMultiSigOwner = await contract.isOwner(connectedAddress);
      } catch {
        isMultiSigOwner = false;
      }

      try {
        const contractOwner = await contract.owner();

        isOwnableOwner =
          ethers.getAddress(contractOwner) === connectedAddress;
      } catch {
        isOwnableOwner = false;
      }

      const contractOwners: string[] = [];

      for (let index = 0; index < 5; index++) {
        try {
          const ownerAddress = await contract.owners(index);

          if (ethers.isAddress(ownerAddress)) {
            contractOwners.push(ethers.getAddress(ownerAddress));
          }
        } catch {
          // Ignore invalid index.
        }
      }

      const normalizedOwners =
        contractOwners.length > 0
          ? contractOwners
          : TREASURY_OWNER_ADDRESSES.map((ownerAddress) =>
              ethers.getAddress(ownerAddress)
            );

      const isOwnersArrayOwner = normalizedOwners.includes(connectedAddress);

      setStats({
        requestCount,
        approveRequired,
        isWithdrawalActive,
        isActionRequestActive,
        isCurrentWalletOwner:
          isMultiSigOwner || isOwnableOwner || isOwnersArrayOwner,
        contractOwners: normalizedOwners,
        usdtContractBalance
      });
    } catch (refreshError) {
      setError(getErrorMessage(refreshError));
    }
  },
  [account, getProvider, hasContractAddress, provider]
);

const switchToBnbSmartChainTestnet = useCallback(async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask or another EIP-1193 wallet is required.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: OP_BNB_SMART_CHAIN.chainId }]
    });
  } catch (switchError: any) {
    const errorCode =
      switchError?.code ||
      switchError?.data?.originalError?.code ||
      switchError?.data?.code;

    if (errorCode === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [OP_BNB_SMART_CHAIN]
      });

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: OP_BNB_SMART_CHAIN.chainId }]
      });

      return;
    }

    throw switchError;
  }
}, []);

const connectWallet = useCallback(async () => {
  setIsConnecting(true);
  setError('');

  try {
    await switchToBnbSmartChainTestnet();

    const activeProvider = getProvider();

    await activeProvider.send('eth_requestAccounts', []);

    const signer = await activeProvider.getSigner();
    const walletAddress = await signer.getAddress();
    const network = await activeProvider.getNetwork();

    setProvider(activeProvider);
    setAccount(walletAddress);
    setChainId(network.chainId);

    await refreshStats(walletAddress);
  } catch (connectError) {
    setError(getErrorMessage(connectError));
  } finally {
    setIsConnecting(false);
  }
}, [getProvider, refreshStats, switchToBnbSmartChainTestnet]);

  const readRequest = useCallback(async (txId: string | bigint): Promise<TreasuryRequest> => {
    const normalizedTxId = BigInt(txId);
    if (normalizedTxId <= BigInt(0)) throw new Error('Please enter a valid transaction/request ID.');

    const contract = getReadContract();
    const request = await contract.requests(normalizedTxId);
    const approvers = await contract.getWithdrawalApprovers(normalizedTxId);

    return {
      txId: request.txId,
      tokenAddress: request.tokenAddress,
      requester: request.requester,
      toAddress: request.toAddress,
      amount: request.amount,
      expiryTime: request.expiryTime,
      isPending: request.isPending,
      approvalCount: request.approvalCount,
      approvers
    };
  }, [getReadContract]);

  const readLatestRequest = useCallback(async () => {
    const contract = getReadContract();
    const count: bigint = await contract.requestCount();
    if (count <= BigInt(0)) return null;
    return readRequest(count);
  }, [getReadContract, readRequest]);

const createWithdrawalRequest = useCallback(
  async ({ toAddress, amount, decimals }: CreateWithdrawalInput) => {
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Receiver address is invalid.');
    }

    if (!amount || Number(amount) <= 0) {
      throw new Error('Amount must be greater than 0.');
    }

    setIsLoading(true);
    setError('');

    try {
      const contract = await getSignerContract();
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await contract.createWithdrawalRequest(
        USDT_TOKEN_ADDRESS,
        toAddress,
        parsedAmount
      );

      const receipt = await tx.wait();
      const txId = getCreatedWithdrawalTxId(contract, receipt);

      await refreshStats();

      return {
        hash: tx.hash as string,
        txId
      };
    } catch (createError) {
      setError(getErrorMessage(createError));
      throw createError;
    } finally {
      setIsLoading(false);
    }
  },
  [getSignerContract, refreshStats]
);

  const approveWithdrawal = useCallback(async (txId: string | bigint) => {
    const normalizedTxId = BigInt(txId);
    if (normalizedTxId <= BigInt(0)) throw new Error('Please enter a valid transaction/request ID.');

    setIsLoading(true);
    setError('');

    try {
      const contract = await getSignerContract();
      const tx = await contract.approveWithdrawal(normalizedTxId);
      await tx.wait();
      await refreshStats();
      return tx.hash as string;
    } catch (approveError) {
      setError(getErrorMessage(approveError));
      throw approveError;
    } finally {
      setIsLoading(false);
    }
  }, [getSignerContract, refreshStats]);

  useEffect(() => {
    if (!window.ethereum?.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAccount = Array.isArray(accounts) && typeof accounts[0] === 'string' ? accounts[0] : '';
      setAccount(nextAccount);
      if (nextAccount) void refreshStats(nextAccount);
    };

const handleChainChanged = async () => {
  try {
    await switchToBnbSmartChainTestnet();

    const activeProvider = getProvider();
    const network = await activeProvider.getNetwork();

    setProvider(activeProvider);
    setChainId(network.chainId);

    if (account) {
      await refreshStats(account);
    }
  } catch {
    window.location.reload();
  }
};

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [refreshStats]);

  return {
    account,
    chainId,
    error,
    stats,
    isConnecting,
    isLoading,
    hasContractAddress,
    connectWallet,
    refreshStats,
    readRequest,
    readLatestRequest,
    createWithdrawalRequest,
    approveWithdrawal
  };
}

function getCreatedWithdrawalTxId(contract: Contract, receipt: ContractTransactionReceipt | null) {
  if (!receipt) return null;

  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === 'WithdrawalRequestCreated') {
        return parsed.args.txId as bigint;
      }
    } catch {
      // Ignore logs emitted by other contracts in the same transaction.
    }
  }

  return null;
}
