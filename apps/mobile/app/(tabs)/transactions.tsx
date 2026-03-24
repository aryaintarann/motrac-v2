import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, TextInput
} from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../../src/utils/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function TransactionsScreen() {
  const router = useRouter();
  const now = new Date();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState<'all' | 'income' | 'expense'>('all');
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  });

  const fetchTransactions = async () => {
    const { data: accData } = await supabase.from('accounts').select('*');
    if (accData) setAccounts(accData);

    const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const endMonth  = selectedMonth === 11 ? 1 : selectedMonth + 2;
    const endYear   = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    const endDate   = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    let q = supabase
      .from('transactions')
      .select('*')
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: false });

    if (typeFilter !== 'all') q = q.eq('type', typeFilter);

    const { data, error } = await q;
    if (!error && data) setTransactions(data);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchTransactions();
  }, [selectedMonth, selectedYear, typeFilter]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [selectedMonth, selectedYear, typeFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(t =>
      (t.description || '').toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q) ||
      (accounts.find(a => a.id === t.account_id)?.name || '').toLowerCase().includes(q)
    );
  }, [transactions, search, accounts]);

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach(t => {
      const key = new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [filtered]);

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <Text className="text-[24px] font-extrabold text-[#0f172a] tracking-tight">Transactions</Text>
        <TouchableOpacity
          onPress={() => router.push('/add-transaction')}
          className="bg-[#0947D5] h-10 w-10 rounded-full items-center justify-center shadow-sm"
        >
          <MaterialCommunityIcons name="plus" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-white rounded-2xl px-4 h-12 border border-gray-100 shadow-sm gap-3">
          <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search transactions..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-[15px] text-gray-800"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Month Scroll */}
      <View className="mb-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {MONTHS.map((m, idx) => {
            const active = idx === selectedMonth;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setSelectedMonth(idx)}
                className={`px-4 py-2 rounded-xl border ${active ? 'bg-[#0947D5] border-[#0947D5]' : 'bg-white border-gray-100 shadow-sm'}`}
              >
                <Text className={`text-[13px] font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{m}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Year + Type Row */}
      <View className="flex-row items-center justify-between px-5 mb-4 gap-3">
        {/* Year pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {years.map(y => {
              const active = y === selectedYear;
              return (
                <TouchableOpacity
                  key={y}
                  onPress={() => setSelectedYear(y)}
                  className={`px-4 py-2 rounded-xl border ${active ? 'bg-[#0947D5] border-[#0947D5]' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                  <Text className={`text-[13px] font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{y}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Type filter */}
        <View className="flex-row bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {(['all', 'income', 'expense'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTypeFilter(t)}
              className={`px-3 py-2 ${typeFilter === t ? 'bg-[#0947D5]' : ''}`}
            >
              <Text className={`text-[12px] font-bold capitalize ${typeFilter === t ? 'text-white' : 'text-gray-500'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary Row */}
      <View className="flex-row gap-3 px-5 mb-4">
        <View className="flex-1 bg-emerald-50 rounded-2xl px-4 py-3 border border-emerald-100">
          <Text className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Income</Text>
          <Text className="font-extrabold text-[16px] text-emerald-800">{formatter.format(totalIncome).replace('Rp', '+Rp ')}</Text>
        </View>
        <View className="flex-1 bg-red-50 rounded-2xl px-4 py-3 border border-red-100">
          <Text className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-1">Expense</Text>
          <Text className="font-extrabold text-[16px] text-red-800">{formatter.format(totalExpense).replace('Rp', '-Rp ')}</Text>
        </View>
      </View>

      {/* List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#0947D5" style={{ marginTop: 60 }} />
        ) : Object.keys(grouped).length === 0 ? (
          <View className="items-center mt-16">
            <Text className="text-4xl mb-3">🔍</Text>
            <Text className="font-bold text-gray-700 text-[16px]">No transactions found</Text>
            <Text className="text-gray-400 text-[13px] mt-1">Try adjusting filters or search</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([dateLabel, txns]) => (
            <View key={dateLabel} className="mb-5">
              <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">{dateLabel}</Text>
              <View className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm">
                {txns.map((txn, idx) => {
                  const isIncome = txn.type === 'income';
                  const accountName = accounts.find(a => a.id === txn.account_id)?.name || '–';
                  const label = txn.description || txn.notes || (isIncome ? 'Income' : 'Expense');
                  const initial = label.charAt(0).toUpperCase();

                  return (
                    <View key={txn.id} className={`flex-row items-center px-4 py-4 ${idx !== txns.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      {/* Avatar circle */}
                      <View className={`w-11 h-11 rounded-full items-center justify-center mr-4 ${isIncome ? 'bg-emerald-100' : 'bg-red-50'}`}>
                        <Text className={`font-extrabold text-[16px] ${isIncome ? 'text-emerald-700' : 'text-red-600'}`}>{initial}</Text>
                      </View>

                      {/* Info */}
                      <View className="flex-1">
                        <Text className="font-bold text-[14px] text-gray-900" numberOfLines={1}>{label}</Text>
                        <Text className="text-[12px] text-gray-400 mt-0.5">{accountName}</Text>
                      </View>

                      {/* Amount */}
                      <Text className={`font-extrabold text-[15px] ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}{formatter.format(Number(txn.amount)).replace('Rp', 'Rp ')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
