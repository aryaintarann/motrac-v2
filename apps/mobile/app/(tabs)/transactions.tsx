import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, TextInput, Modal, FlatList
} from 'react-native';
import { useState, useCallback, useMemo, useEffect } from 'react';
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
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker,  setShowYearPicker]  = useState(false);

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

  // Re-fetch when screen gains focus
  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  // Re-fetch when filters change (plain useEffect — no navigation context needed)
  useEffect(() => {
    setLoading(true);
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear, typeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {/* Dropdowns Row — Month + Year only */}
      <View className="flex-row items-center px-5 mb-3 gap-3">
        {/* Month Dropdown - full name */}
        <TouchableOpacity
          onPress={() => setShowMonthPicker(true)}
          className="flex-1 flex-row items-center justify-between bg-white rounded-2xl px-4 h-12 border border-gray-100 shadow-sm"
        >
          <Text className="text-[14px] font-bold text-gray-800" numberOfLines={1}>
            {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Year Dropdown */}
        <TouchableOpacity
          onPress={() => setShowYearPicker(true)}
          className="flex-row items-center justify-between bg-white rounded-2xl px-4 h-12 border border-gray-100 shadow-sm w-28"
        >
          <Text className="text-[14px] font-bold text-gray-800">{selectedYear}</Text>
          <MaterialCommunityIcons name="chevron-down" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Type filter row - below dropdowns */}
      <View className="flex-row items-center px-5 mb-4 gap-2">
        {(['all', 'income', 'expense'] as const).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTypeFilter(t)}
            className={`flex-1 py-2.5 rounded-xl items-center border ${
              typeFilter === t ? 'bg-[#0947D5] border-[#0947D5]' : 'bg-white border-gray-100 shadow-sm'
            }`}
          >
            <Text className={`text-[13px] font-bold capitalize ${typeFilter === t ? 'text-white' : 'text-gray-500'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Month picker modal */}
      <Modal visible={showMonthPicker} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/40 justify-center px-8" activeOpacity={1} onPress={() => setShowMonthPicker(false)}>
          <View className="bg-white rounded-3xl overflow-hidden">
            <Text className="text-[16px] font-bold text-gray-800 px-5 pt-5 pb-3">Select Month</Text>
            {MONTHS.map((m, idx) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setSelectedMonth(idx); setShowMonthPicker(false); }}
                className={`px-5 py-3.5 flex-row items-center justify-between ${idx === selectedMonth ? 'bg-blue-50' : ''}`}
              >
                <Text className={`text-[15px] font-semibold ${idx === selectedMonth ? 'text-[#0947D5]' : 'text-gray-700'}`}>{m}</Text>
                {idx === selectedMonth && <MaterialCommunityIcons name="check" size={18} color="#0947D5" />}
              </TouchableOpacity>
            ))}
            <View className="h-4" />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year picker modal */}
      <Modal visible={showYearPicker} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/40 justify-center px-8" activeOpacity={1} onPress={() => setShowYearPicker(false)}>
          <View className="bg-white rounded-3xl overflow-hidden">
            <Text className="text-[16px] font-bold text-gray-800 px-5 pt-5 pb-3">Select Year</Text>
            {years.map(y => (
              <TouchableOpacity
                key={y}
                onPress={() => { setSelectedYear(y); setShowYearPicker(false); }}
                className={`px-5 py-3.5 flex-row items-center justify-between ${y === selectedYear ? 'bg-blue-50' : ''}`}
              >
                <Text className={`text-[15px] font-semibold ${y === selectedYear ? 'text-[#0947D5]' : 'text-gray-700'}`}>{y}</Text>
                {y === selectedYear && <MaterialCommunityIcons name="check" size={18} color="#0947D5" />}
              </TouchableOpacity>
            ))}
            <View className="h-4" />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Summary Cards stacked */}
      <View className="flex-col gap-2 px-5 mb-4">
        <View className="bg-emerald-50 rounded-2xl px-4 py-3 border border-emerald-100 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-emerald-200 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="arrow-down" size={16} color="#065F46" />
            </View>
            <Text className="text-[13px] font-bold text-emerald-700">Income</Text>
          </View>
          <Text className="font-extrabold text-[16px] text-emerald-800">{formatter.format(totalIncome).replace('Rp', '+Rp ')}</Text>
        </View>
        <View className="bg-red-50 rounded-2xl px-4 py-3 border border-red-100 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-red-200 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="arrow-up" size={16} color="#7F1D1D" />
            </View>
            <Text className="text-[13px] font-bold text-red-700">Expense</Text>
          </View>
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

      {/* FAB above floating navbar */}
      <TouchableOpacity
        onPress={() => router.push('/add-transaction')}
        style={{
          position: 'absolute',
          bottom: 108,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#0947D5',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#0947D5',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <MaterialCommunityIcons name="plus" size={26} color="white" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}
