import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../src/utils/supabase';
import { Account, Transaction } from '@motrac/shared';

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  
  // Dashboard Metrics
  const [monthIncome, setMonthIncome] = useState(0);
  const [monthExpense, setMonthExpense] = useState(0);
  
  const [budgetNeeds, setBudgetNeeds] = useState(0);
  const [budgetWants, setBudgetWants] = useState(0);
  const [budgetSavings, setBudgetSavings] = useState(0);
  
  const [spentNeeds, setSpentNeeds] = useState(0);
  const [spentWants, setSpentWants] = useState(0);
  const [spentSavings, setSpentSavings] = useState(0);
  
  const [hasBudget, setHasBudget] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      subscription.unsubscribe();
    }
  }, [])

  useEffect(() => {
    if (!session?.user) return;

    fetchUnreadCount();

    const channel = supabase.channel('realtime-mobile-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const fetchUnreadCount = async () => {
    if (!session?.user?.id) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
      
    setUnreadCount(count || 0);
  };

  useFocusEffect(
    useCallback(() => {
      if (session) {
        fetchData();
        fetchUnreadCount();
      }
    }, [session])
  )

  async function fetchData() {
    // 1. Fetch Accounts
    const { data: accData } = await supabase.from('accounts').select('*').order('name');
    if (accData) {
      setAccounts(accData as Account[]);
      setTotalBalance(accData.reduce((sum, acc) => sum + Number(acc.balance), 0));
    }

    // 2. Fetch Recent Transactions
    const { data: txnData, error: txnErr } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (txnErr) console.error("Recent Txn Error:", txnErr);
    if (txnData) {
      setTransactions(txnData as Transaction[]);
    }

    // 3. Fetch Monthly Metrics & Budgets
    const currentMonthStr = new Date().toISOString().slice(0, 7)
    const { data: budgetData } = await supabase.from('budgets').select('*').eq('month', currentMonthStr).single()
    
    if (budgetData) {
      setHasBudget(true);
      setBudgetNeeds(Number(budgetData.needs_amount));
      setBudgetWants(Number(budgetData.wants_amount));
      setBudgetSavings(Number(budgetData.savings_amount));
    } else {
      setHasBudget(false);
    }

    const { data: monthTxns } = await supabase
      .from('transactions')
      .select('amount, type, category_id, date, categories(budget_type)')
      .gte('date', `${currentMonthStr}-01T00:00:00Z`)

    const allTxns = monthTxns || []
    setMonthIncome(allTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0))
    setMonthExpense(allTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0))

    setSpentNeeds(allTxns.filter(t => t.type === 'expense' && (t.categories as any)?.budget_type === 'needs').reduce((sum, t) => sum + Number(t.amount), 0))
    setSpentWants(allTxns.filter(t => t.type === 'expense' && (t.categories as any)?.budget_type === 'wants').reduce((sum, t) => sum + Number(t.amount), 0))
    setSpentSavings(allTxns.filter(t => t.type === 'expense' && (t.categories as any)?.budget_type === 'savings').reduce((sum, t) => sum + Number(t.amount), 0))
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [session]);

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  
  // Pacing Logic
  const allowableSpend = budgetNeeds + budgetWants;
  const remaining = allowableSpend - monthExpense;
  const spentPercent = allowableSpend > 0 ? (monthExpense / allowableSpend) * 100 : 0;
  
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);
  const weeksInMonth = daysInMonth / 7;
  
  const budgetNeedsPerWeek = budgetNeeds > 0 ? budgetNeeds / weeksInMonth : 0;
  const needsAllocatedSoFar = budgetNeedsPerWeek * weekNumber;
  const needsRemainingThisWeek = needsAllocatedSoFar - spentNeeds;
  const needsPct = needsAllocatedSoFar > 0 ? Math.min((spentNeeds / needsAllocatedSoFar) * 100, 100) : 0;
  
  const budgetWantsPerWeek = budgetWants > 0 ? budgetWants / weeksInMonth : 0;
  const wantsAllocatedSoFar = budgetWantsPerWeek * weekNumber;
  const wantsRemainingThisWeek = wantsAllocatedSoFar - spentWants;
  const wantsPct = wantsAllocatedSoFar > 0 ? Math.min((spentWants / wantsAllocatedSoFar) * 100, 100) : 0;

  const renderProgressBar = (spent: number, total: number, colorClass: string) => {
    const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
    const isDanger = pct > 90;
    const isWarning = pct > 70 && pct <= 90;
    const finalColorClass = isDanger ? 'bg-danger' : isWarning ? 'bg-warning' : colorClass;
    
    return (
      <View className="h-1.5 w-full bg-border rounded-full overflow-hidden mt-1.5">
        <View className={`h-full rounded-full ${finalColorClass}`} style={{ width: `${pct}%` }} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <View className="flex-row items-center gap-3">
          {/* Profile Avater & Badge */}
          <TouchableOpacity onPress={() => router.push('/profile')} className="relative">
            <View className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 items-center justify-center border border-slate-100">
              <Text className="text-xl font-bold text-slate-500">
                {session?.user?.email ? session.user.email.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View className="absolute -bottom-1.5 left-0 right-0 items-center">
              <View className="bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-200">
                <Text className="text-[10px] font-bold text-slate-800">Pro</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Greeting Text */}
          <View className="ml-1">
            <Text className="text-[19px] font-extrabold text-[#111827] mb-0.5 tracking-tight">
              Hey! {session?.user?.user_metadata?.full_name?.split(' ')[0] || session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z]/g, ' ') || 'User'} 👋
            </Text>
            <Text className="text-[14px] text-[#A1A1AA] font-medium tracking-tight">
              How are you Today?
            </Text>
          </View>
        </View>

        {/* Notification Button */}
        <TouchableOpacity onPress={() => router.push('/notifications')} className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100 relative">
          <MaterialCommunityIcons name="bell-outline" size={24} color="#71717A" />
          {unreadCount > 0 && (
            <View className="absolute top-[8px] right-[8px] w-3 h-3 bg-red-500 rounded-full border-2 border-white items-center justify-center" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Total Balance Card */}
        <View className="bg-card rounded-2xl border border-border p-3 shadow-sm mb-3">
          <Text className="text-muted font-medium text-sm">Total Balance</Text>
          <View className="flex-row items-baseline mt-1">
            <Text className="text-foreground font-bold text-3xl tracking-tight leading-none">{formatter.format(totalBalance).replace('Rp', '').trim()}</Text>
            <Text className="text-muted font-semibold text-base ml-1">IDR</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View className="mb-2 mt-1">
          <Text className="font-bold text-foreground text-lg mb-4">Quick Action</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity onPress={() => router.push('/add-transaction')} className="bg-card w-[31%] h-24 rounded-[16px] flex-col items-center justify-center shadow-sm border border-border mb-3">
              <MaterialCommunityIcons name="swap-horizontal" size={28} color="#2563EB" />
              <Text className="text-foreground text-[12px] font-bold mt-2 text-center" numberOfLines={1}>Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/add-transaction')} className="bg-card w-[31%] h-24 rounded-[16px] flex-col items-center justify-center shadow-sm border border-border mb-3">
              <MaterialCommunityIcons name="atm" size={28} color="#2563EB" />
              <Text className="text-foreground text-[12px] font-bold mt-2 text-center" numberOfLines={1}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/add-transaction')} className="bg-card w-[31%] h-24 rounded-[16px] flex-col items-center justify-center shadow-sm border border-border mb-3">
              <MaterialCommunityIcons name="cash-plus" size={28} color="#2563EB" />
              <Text className="text-foreground text-[12px] font-bold mt-2 text-center" numberOfLines={1}>Deposit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/accounts')} className="bg-card w-[31%] h-24 rounded-[16px] flex-col items-center justify-center shadow-sm border border-border mb-0">
              <MaterialCommunityIcons name="credit-card-outline" size={28} color="#2563EB" />
              <Text className="text-foreground text-[12px] font-bold mt-2 text-center" numberOfLines={1}>My Cards</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/reports')} className="bg-card w-[31%] h-24 rounded-[16px] flex-col items-center justify-center shadow-sm border border-border mb-0">
              <MaterialCommunityIcons name="chart-bar" size={28} color="#2563EB" />
              <Text className="text-foreground text-[12px] font-bold mt-2 text-center" numberOfLines={1}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/budgets')} className="bg-card w-[31%] h-24 rounded-[16px] flex-col items-center justify-center shadow-sm border border-border mb-0">
              <MaterialCommunityIcons name="chart-line-variant" size={28} color="#2563EB" />
              <Text className="text-foreground text-[12px] font-bold mt-2 text-center" numberOfLines={1}>Budget</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Income / Expense Card */}
        <View className="bg-card rounded-2xl border border-border p-3 shadow-sm mb-3">
          <Text className="text-muted font-medium text-sm mb-2">This Month</Text>
          <View className="flex-row justify-between mb-3">
            <View className="flex-1">
              <Text className="text-success font-bold text-xs uppercase tracking-wider mb-1">Income</Text>
              <Text className="text-foreground font-bold text-xl tracking-tight">{formatter.format(monthIncome).replace('Rp', '+Rp ')}</Text>
            </View>
            <View className="w-px bg-border mx-3" />
            <View className="flex-1">
              <Text className="text-danger font-bold text-xs uppercase tracking-wider mb-1">Expense</Text>
              <Text className="text-foreground font-bold text-xl tracking-tight">{formatter.format(monthExpense).replace('Rp', '-Rp ')}</Text>
            </View>
          </View>
          
          <View className="h-2 w-full bg-border rounded-full overflow-hidden flex-row">
            {(monthIncome + monthExpense) > 0 && (
              <>
                <View className="h-full bg-success" style={{ width: `${(monthIncome / (monthIncome + monthExpense)) * 100}%` }} />
                <View className="h-full bg-danger" style={{ width: `${(monthExpense / (monthIncome + monthExpense)) * 100}%` }} />
              </>
            )}
          </View>
          <Text className="text-muted text-xs mt-2">
            Net: <Text className={`font-bold ${monthIncome - monthExpense >= 0 ? 'text-success' : 'text-danger'}`}>{formatter.format(monthIncome - monthExpense)}</Text>
          </Text>
        </View>

        {/* Budget Remaining Card */}
        <View className="bg-card rounded-2xl border border-border p-3 shadow-sm mb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-muted font-medium text-sm">Budget Remaining</Text>
            {hasBudget && (
              <View className="px-2 py-0.5 rounded-full border border-border">
                <Text className={`font-bold text-xs ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
                  {(100 - Math.min(spentPercent, 100)).toFixed(0)}% left
                </Text>
              </View>
            )}
          </View>

          {hasBudget ? (
            <View className="gap-3">
              <View>
                <View className="flex-row justify-between items-center">
                  <Text className="font-semibold text-muted text-xs">Needs</Text>
                  <Text className={`font-bold text-xs ${budgetNeeds - spentNeeds >= 0 ? 'text-foreground' : 'text-danger'}`}>{formatter.format(budgetNeeds - spentNeeds)}</Text>
                </View>
                {renderProgressBar(spentNeeds, budgetNeeds, 'bg-info')}
              </View>
              <View>
                <View className="flex-row justify-between items-center">
                  <Text className="font-semibold text-muted text-xs">Wants</Text>
                  <Text className={`font-bold text-xs ${budgetWants - spentWants >= 0 ? 'text-foreground' : 'text-danger'}`}>{formatter.format(budgetWants - spentWants)}</Text>
                </View>
                {renderProgressBar(spentWants, budgetWants, 'bg-primary')}
              </View>
              <View>
                <View className="flex-row justify-between items-center">
                  <Text className="font-semibold text-muted text-xs">Savings</Text>
                  <Text className={`font-bold text-xs ${budgetSavings - spentSavings >= 0 ? 'text-foreground' : 'text-danger'}`}>{formatter.format(budgetSavings - spentSavings)}</Text>
                </View>
                {renderProgressBar(spentSavings, budgetSavings, 'bg-success')}
              </View>
            </View>
          ) : (
            <Text className="text-muted italic text-xs">No budget set for this month.</Text>
          )}
        </View>

        {/* Weekly Pace Card */}
        <View className="bg-card rounded-2xl border border-border p-3 shadow-sm mb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-muted font-medium text-sm">Weekly Pace (Rollover)</Text>
            <View className="px-2 py-0.5 rounded-full border border-border">
              <Text className="font-bold text-xs text-info">Week {weekNumber}</Text>
            </View>
          </View>

          {hasBudget ? (
            <View className="gap-4">
              <View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-semibold text-muted text-xs">Needs Remaining</Text>
                  <Text className={`font-bold text-xs ${needsRemainingThisWeek >= 0 ? 'text-foreground' : 'text-danger'}`}>{formatter.format(needsRemainingThisWeek)}</Text>
                </View>
                {renderProgressBar(spentNeeds, needsAllocatedSoFar, 'bg-info')}
                <Text className="text-muted text-[10px] mt-1 font-medium">Safe to spend: {formatter.format(budgetNeedsPerWeek)} / week</Text>
              </View>
              <View>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-semibold text-muted text-xs">Wants Remaining</Text>
                  <Text className={`font-bold text-xs ${wantsRemainingThisWeek >= 0 ? 'text-foreground' : 'text-danger'}`}>{formatter.format(wantsRemainingThisWeek)}</Text>
                </View>
                {renderProgressBar(spentWants, wantsAllocatedSoFar, 'bg-primary')}
                <Text className="text-muted text-[10px] mt-1 font-medium">Safe to spend: {formatter.format(budgetWantsPerWeek)} / week</Text>
              </View>
            </View>
          ) : (
            <Text className="text-muted italic text-xs">No budget set for this month.</Text>
          )}
        </View>

        {/* Recent Transactions Section */}
        <View className="mt-2 mb-4">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="font-bold text-[#242A4A] text-[18px]">Transaction History</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text className="text-[#878DA8] text-[13px] font-semibold">View More</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {transactions.length > 0 ? transactions.map((txn) => {
              const isIncome = txn.type === 'income';
              const accountName = accounts.find(a => a.id === txn.account_id)?.name || 'Account';
              const sign = isIncome ? '+' : (txn.type === 'expense' ? '-' : '');
              const amountLabel = `${sign}${formatter.format(Number(txn.amount)).trim()}`;
              
              const dateObj = new Date(txn.date);
              const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
              const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
              
              return (
                <TouchableOpacity key={txn.id} className="bg-card rounded-[24px] p-4 flex-row items-center justify-between shadow-sm border border-[#F3F4F6]">
                  <View className="flex-row items-center gap-4">
                    <View className="w-[50px] h-[50px] bg-[#F9FAFB] rounded-2xl items-center justify-center border border-[#F3F4F6]">
                      <Text className="text-xl">{isIncome ? '📥' : '📤'}</Text>
                    </View>
                    <View>
                      <Text className="font-bold text-[#4B5282] text-[16px] mb-1">{txn.notes || txn.description || "Transfer"}</Text>
                      <Text className="text-[#AEB4CE] text-[12px] font-medium">{dateStr}    {timeStr}</Text>
                    </View>
                  </View>
                  <Text className={`font-bold text-[15px] ${isIncome ? 'text-success' : 'text-[#16182B]'}`}>
                    {amountLabel}
                  </Text>
                </TouchableOpacity>
              );
            }) : (
              <Text className="text-center text-muted py-4 text-xs">No transactions found.</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'var(--background)',
  },
});
