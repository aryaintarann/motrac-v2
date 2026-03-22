'use client';

import { useBalance } from './BalanceContext';

export function HidableBalance({ amount }: { amount: string }) {
  const { isHidden } = useBalance();
  
  if (isHidden) {
    return <span>••••••••</span>;
  }
  
  return <span>{amount}</span>;
}
