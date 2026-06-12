'use client';

import { Wallet } from 'lucide-react';
import { shortAddress } from '@/lib/format';

type ConnectWalletProps = {
  account: string;
  chainId: bigint | null;
  isConnecting: boolean;
  hasContractAddress: boolean;
  onConnect: () => void;
};

export function ConnectWallet({ account, chainId, isConnecting, hasContractAddress, onConnect }: ConnectWalletProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-glow backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Treasury Wallet</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Withdrawal approvals dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Create a withdrawal request, inspect pending requests, and approve valid multi-signature treasury transfers.
          </p>
        </div>

        <button
          type="button"
          onClick={onConnect}
          disabled={isConnecting || !hasContractAddress}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wallet className="h-4 w-4" />
          {account ? shortAddress(account) : isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
        <InfoPill label="Wallet" value={account ? shortAddress(account, 6) : 'Not connected'} />
        <InfoPill label="Chain ID" value={chainId ? chainId.toString() : '-'} />
        <InfoPill label="Contract" value={hasContractAddress ? 'Configured' : 'Missing env'} />
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-100">{value}</p>
    </div>
  );
}
