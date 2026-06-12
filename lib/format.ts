import { formatUnits } from 'ethers';

export function shortAddress(address?: string, chars = 4) {
  if (!address) return '-';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatAmount(value: bigint, decimals: number) {
  try {
    return formatUnits(value, decimals);
  } catch {
    return value.toString();
  }
}

export function formatUnixTime(seconds: bigint) {
  const time = Number(seconds) * 1000;
  if (!Number.isFinite(time) || time <= 0) return '-';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(time));
}

export function isExpired(expiryTime: bigint) {
  if (expiryTime <= BigInt(0)) return false;
  return Date.now() > Number(expiryTime) * 1000;
}

export function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    const anyError = error as {
      shortMessage?: string;
      reason?: string;
      message?: string;
      info?: { error?: { message?: string } };
    };

    return (
      anyError.shortMessage ||
      anyError.reason ||
      anyError.info?.error?.message ||
      anyError.message ||
      'Something went wrong.'
    );
  }

  return 'Something went wrong.';
}
