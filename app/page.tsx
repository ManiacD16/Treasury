'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ApproveWithdrawal } from '@/components/ApproveWithdrawal';
import { ConnectWallet } from '@/components/ConnectWallet';
import { CreateWithdrawalRequest } from '@/components/CreateWithdrawalRequest';
import { RequestDetails } from '@/components/RequestDetails';
import { StatusCards } from '@/components/StatusCards';
import { TreasuryRequest } from '@/lib/contract';
import { getErrorMessage } from '@/lib/format';
import { useTreasury } from '@/hooks/useTreasury';

export default function HomePage() {
  const treasury = useTreasury();
  const [loadedRequest, setLoadedRequest] = useState<TreasuryRequest | null>(null);
  const [pageError, setPageError] = useState('');

  async function loadLatestRequest() {
    setPageError('');
    try {
      const request = await treasury.readLatestRequest();
      setLoadedRequest(request);
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  }

  async function lookupRequest(txId: string) {
    setPageError('');
    try {
      const request = await treasury.readRequest(txId);
      setLoadedRequest(request);
    } catch (error) {
      setPageError(getErrorMessage(error));
    }
  }

  useEffect(() => {
    if (treasury.account) {
      void loadLatestRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treasury.account, treasury.stats.requestCount]);

  const blockingError = treasury.error || pageError;
  const actionsDisabled = !treasury.account || !treasury.hasContractAddress || !treasury.stats.isCurrentWalletOwner;
  const latestRequestId = treasury.stats.requestCount;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl space-y-6">
        <ConnectWallet
          account={treasury.account}
          chainId={treasury.chainId}
          isConnecting={treasury.isConnecting}
          hasContractAddress={treasury.hasContractAddress}
          onConnect={treasury.connectWallet}
        />

        {blockingError ? (
          <div className="flex gap-3 rounded-3xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
            <p className="break-words">{blockingError}</p>
          </div>
        ) : null}

        {!treasury.hasContractAddress ? (
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            Add your deployed contract address in <span className="font-mono">.env</span> as{' '}
            <span className="font-mono">NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS</span>, then restart the dev server.
          </div>
        ) : null}

        <StatusCards {...treasury.stats} />

        <div className="grid gap-6 xl:grid-cols-2">
          <CreateWithdrawalRequest
            disabled={actionsDisabled}
            isLoading={treasury.isLoading}
            onCreate={treasury.createWithdrawalRequest}
            onSuccess={(txId) => {
              if (txId) void lookupRequest(txId.toString());
              else void loadLatestRequest();
            }}
          />

          <ApproveWithdrawal
            disabled={actionsDisabled}
            isLoading={treasury.isLoading}
            defaultTxId={latestRequestId > BigInt(0) ? latestRequestId.toString() : ''}
            onApprove={treasury.approveWithdrawal}
            onSuccess={(txId) => void lookupRequest(txId)}
          />
        </div>

        <RequestDetails latestRequestId={latestRequestId} request={loadedRequest} onLookup={lookupRequest} />
      </div>
    </main>
  );
}
