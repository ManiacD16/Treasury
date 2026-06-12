'use client';

import { ethers } from 'ethers';
import {
  CheckCircle2,
  Clock3,
  Coins,
  ShieldCheck,
  Users
} from 'lucide-react';
import { USDT_DECIMALS } from '@/lib/contract';

type StatusCardsProps = {
  requestCount: bigint;
  approveRequired: bigint;
  isWithdrawalActive: boolean;
  isActionRequestActive: boolean;
  isCurrentWalletOwner: boolean;
  contractOwners: string[];
  usdtContractBalance: bigint;
};

export function StatusCards({
  requestCount,
  approveRequired,
  isWithdrawalActive,
  isActionRequestActive,
  isCurrentWalletOwner,
  contractOwners,
  usdtContractBalance
}: StatusCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatusCard
          icon={<Clock3 />}
          label="Total Requests"
          value={requestCount.toString()}
          hint="requestCount()"
        />

        <StatusCard
          icon={<Users />}
          label="Required Approvals"
          value={approveRequired.toString()}
          hint="approveRequired()"
        />

        <StatusCard
          icon={<Coins />}
          label="USDT Contract Balance"
          value={`${ethers.formatUnits(usdtContractBalance, USDT_DECIMALS)} USDT`}
          hint="getContractBalance()"
        />

        <StatusCard
          icon={<CheckCircle2 />}
          label="Withdrawal Active"
          value={isWithdrawalActive ? 'Yes' : 'No'}
          hint="isWithdrawlActive()"
        />

        <StatusCard
          icon={<ShieldCheck />}
          label="Connected Owner"
          value={isCurrentWalletOwner ? 'Owner' : 'Not owner'}
          hint={isActionRequestActive ? 'Action request pending' : 'Ready'}
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-cyan-300">
              Contract Owners
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              Multisig owner addresses
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-400">
            owners(0 - 4)
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {contractOwners.map((ownerAddress, index) => (
            <div
              key={ownerAddress}
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
            >
              <p className="text-xs font-medium text-slate-500">
                Owner {index}
              </p>

              <p className="mt-2 break-all font-mono text-sm text-slate-100">
                {ownerAddress}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  hint
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          {icon}
        </div>

        <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-400">
          {hint}
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-1 break-words text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}