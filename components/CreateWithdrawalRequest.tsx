'use client';

import { FormEvent, useState } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { USDT_DECIMALS, USDT_TOKEN_ADDRESS } from '@/lib/contract';

type CreateWithdrawalRequestProps = {
  disabled: boolean;
  isLoading: boolean;
  onCreate: (input: {
    toAddress: string;
    amount: string;
    decimals: number;
  }) => Promise<{
    hash: string;
    txId: bigint | null;
  }>;
  onSuccess: (txId?: bigint | null) => void;
};

export function CreateWithdrawalRequest({
  disabled,
  isLoading,
  onCreate,
  onSuccess
}: CreateWithdrawalRequestProps) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [decimals, setDecimals] = useState(USDT_DECIMALS);
  const [successHash, setSuccessHash] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessHash('');

    const result = await onCreate({
      toAddress,
      amount,
      decimals
    });

    setSuccessHash(result.hash);
    onSuccess(result.txId);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-cyan-300">Create Request</p>
          <h2 className="mt-1 text-xl font-bold text-white">
            New USDT withdrawal request
          </h2>
        </div>

        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
          Owner only
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="USDT Token Address"
          helper="This token address is hardcoded and cannot be changed."
        >
          <input
            value={USDT_TOKEN_ADDRESS}
            readOnly
            className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 outline-none"
          />
        </Field>

        <Field
          label="Receiver Address"
          helper="Address that will receive USDT after enough approvals."
        >
          <input
            value={toAddress}
            onChange={(event) => setToAddress(event.target.value)}
            placeholder="0xReceiver..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-[1fr_140px]">
          <Field
            label="USDT Amount"
            helper="Human amount. Example: 10.5"
          >
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="10.5"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
            />
          </Field>

          <Field label="Decimals" helper="Default is 18.">
            <input
              value={decimals}
              onChange={(event) => setDecimals(Number(event.target.value))}
              type="number"
              min={0}
              max={36}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={disabled || isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
          Create USDT Withdrawal Request
        </button>
      </form>

      {successHash ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          Transaction submitted:{' '}
          <span className="break-all font-mono">{successHash}</span>
        </div>
      ) : null}
    </section>
  );
}

function Field({
  label,
  helper,
  children
}: {
  label: string;
  helper: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-slate-500">
        {helper}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}