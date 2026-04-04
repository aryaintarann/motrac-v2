'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const BalanceContext = createContext({
  isHidden: false,
  toggle: () => {},
});

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [isHidden, setIsHidden] = useState(false);
  
  useEffect(() => {
    const stored = localStorage.getItem('DANAROUTE_hideBalance');
    if (stored) setIsHidden(stored === 'true');
  }, []);
  
  const toggle = () => {
    setIsHidden(prev => {
      const next = !prev;
      localStorage.setItem('DANAROUTE_hideBalance', String(next));
      return next;
    });
  };
  
  return <BalanceContext.Provider value={{ isHidden, toggle }}>{children}</BalanceContext.Provider>;
}

export function useBalance() {
  return useContext(BalanceContext);
}
