'use client';

import { FormEvent, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

type ApproveWithdrawalProps = {
  disabled: boolean;
  isLoading: boolean;
  defaultTxId: string;
  onApprove: (txId: string) => Promise<string>;
  onSuccess: (txId: string) => void;
};

export function ApproveWithdrawal({ disabled, isLoading, defaultTxId, onApprove, onSuccess }: ApproveWithdrawalProps) {
  const [txId, setTxId] = useState(defaultTxId);
  const [successHash, setSuccessHash] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessHash('');

    const hash = await onApprove(txId || defaultTxId);
    setSuccessHash(hash);
    onSuccess(txId || defaultTxId);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
      <div>
        <p className="text-sm font-semibold text-emerald-300">Approve Request</p>
        <h2 className="mt-1 text-xl font-bold text-white">Approve withdrawal</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          The request creator cannot approve their own withdrawal. When approvals reach the required count, the contract executes the transfer automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Request / Tx ID</span>
          <input
            value={txId || defaultTxId}
            onChange={(event) => setTxId(event.target.value)}
            inputMode="numeric"
            placeholder="1"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-300"
          />
        </label>

        <button
          type="submit"
          disabled={disabled || isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Approve Withdrawal
        </button>
      </form>

      {successHash ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          Approval transaction: <span className="break-all font-mono">{successHash}</span>
        </div>
      ) : null}
    </section>
  );
}
