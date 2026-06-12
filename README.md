# Treasury Withdrawal UI

A modern Next.js + Tailwind CSS UI for a multi-signature treasury contract.

## Features

- Connect wallet using `window.ethereum` / MetaMask
- Read `requestCount()` and latest request
- Read `requests(txId)` details
- Create withdrawal requests with `createWithdrawalRequest(tokenAddress, toAddress, amount)`
- Approve requests with `approveWithdrawal(txId)`
- Show required approvals, current wallet owner status, active withdrawal status, and request approvers

## Setup

```bash
npm install
cp .env.example .env.local
```

Set your deployed treasury contract address:

```env
NEXT_PUBLIC_TREASURY_CONTRACT_ADDRESS=0xYourTreasuryContractAddressHere
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important notes

1. For native chain coin withdrawals, the UI sends token address as `0x0000000000000000000000000000000000000000`.
2. For ERC20/BEP20 withdrawals, paste the token contract address.
3. The contract expects the amount in raw token units. The UI uses `ethers.parseUnits(amount, decimals)` before sending.
4. Your contract modifier requires the connected wallet to be an owner. Non-owners can connect and read, but create/approve buttons are disabled.
5. The withdrawal creator cannot approve their own request because the contract has `require(msg.sender != request.requester)`.

## Suggested production improvements

- Add chain validation and a "switch network" button.
- Add block explorer links using the current chain ID.
- Fetch ERC20 decimals automatically from the token contract.
- Add toast notifications instead of inline success messages.
- Add server-side deployment config for Vercel/Render.
