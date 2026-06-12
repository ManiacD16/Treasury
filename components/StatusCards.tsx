'use client';

import { CheckCircle2, Clock3, ShieldCheck, Users } from 'lucide-react';

type StatusCardsProps = {
  requestCount: bigint;
  approveRequired: bigint;
  isWithdrawalActive: boolean;
  isActionRequestActive: boolean;
  isCurrentWalletOwner: boolean;
};

export function StatusCards({
  requestCount,
  approveRequired,
  isWithdrawalActive,
  isActionRequestActive,
  isCurrentWalletOwner
}: StatusCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatusCard icon={<Clock3 />} label="Total Requests" value={requestCount.toString()} hint="requestCount()" />
      <StatusCard icon={<Users />} label="Required Approvals" value={approveRequired.toString()} hint="approveRequired()" />
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
  );
}

function StatusCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          {icon}
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-400">{hint}</span>
      </div>
      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
