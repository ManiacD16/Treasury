'use client';

import { FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { TreasuryRequest, ZERO_ADDRESS } from '@/lib/contract';
import { formatAmount, formatUnixTime, isExpired, shortAddress } from '@/lib/format';

type RequestDetailsProps = {
  latestRequestId: bigint;
  request: TreasuryRequest | null;
  onLookup: (txId: string) => Promise<void>;
};

export function RequestDetails({ latestRequestId, request, onLookup }: RequestDetailsProps) {
  const [txId, setTxId] = useState(latestRequestId > 0 ? latestRequestId.toString() : '');
  const [displayDecimals, setDisplayDecimals] = useState(18);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onLookup(txId);
  }

  const expired = request ? isExpired(request.expiryTime) : false;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl xl:col-span-2">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-300">Read Contract</p>
          <h2 className="mt-1 text-xl font-bold text-white">Withdrawal request details</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Reads `requestCount()`, `requests(txId)`, and approvers from the contract.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={txId}
            onChange={(event) => setTxId(event.target.value)}
            inputMode="numeric"
            placeholder="Request ID"
            className="w-32 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-violet-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-violet-300"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <label className="mt-5 block max-w-xs">
        <span className="text-xs text-slate-500">Display decimals</span>
        <input
          value={displayDecimals}
          onChange={(event) => setDisplayDecimals(Number(event.target.value))}
          type="number"
          min={0}
          max={36}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300"
        />
      </label>

      {!request ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
          No request loaded yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Detail label="Tx ID" value={request.txId.toString()} />
          <Detail
            label="Status"
            value={request.isPending ? (expired ? 'Expired but still marked pending' : 'Pending') : 'Closed / Executed'}
          />
          <Detail label="Token" value={request.tokenAddress === ZERO_ADDRESS ? 'Native coin' : shortAddress(request.tokenAddress, 6)} mono />
          <Detail label="Amount" value={`${formatAmount(request.amount, displayDecimals)} (${request.amount.toString()} raw)`} />
          <Detail label="Requester" value={shortAddress(request.requester, 6)} mono />
          <Detail label="Receiver" value={shortAddress(request.toAddress, 6)} mono />
          <Detail label="Approvals" value={request.approvalCount.toString()} />
          <Detail label="Expiry" value={formatUnixTime(request.expiryTime)} />

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 md:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Approvers</p>
            {request.approvers.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {request.approvers.map((address) => (
                  <span key={address} className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-mono text-xs text-emerald-200">
                    {shortAddress(address, 6)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No approvals yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className={`mt-2 break-all text-sm font-semibold text-slate-100 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}
