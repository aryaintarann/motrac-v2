import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../src/utils/supabase';
import { Transaction } from '@motrac/shared';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const router = useRouter();

  const fetchTransactions = async () => {
    const { data: accData } = await supabase.from('accounts').select('*');
    if (accData) setAccounts(accData);

    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setTransactions(data as any);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [filter])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [filter]);

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-white border-b border-gray-100 flex-row justify-between items-center z-10">
        <Text className="text-2xl font-bold tracking-tight text-[#0f172a]">Transactions</Text>
        <TouchableOpacity 
          onPress={() => router.push('/add-transaction')}
          className="bg-[#1A6FD6] h-10 w-10 rounded-full items-center justify-center shadow-sm"
        >
          <Text className="text-white text-2xl font-light -mt-1">+</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View className="bg-white px-6 py-3 border-b border-gray-100 flex-row gap-3">
        {['all', 'income', 'expense'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f as any)}
            className={`px-4 py-1.5 rounded-full border ${filter === f ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'}`}
          >
            <Text className={`font-semibold text-[13px] capitalize ${filter === f ? 'text-white' : 'text-gray-600'}`}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="bg-white rounded-[20px] p-2 shadow-sm border border-gray-100">
            {loading ? (
              <View className="py-10 items-center">
                <ActivityIndicator color="#1A6FD6" />
              </View>
            ) : transactions.length > 0 ? (
              transactions.map((txn, idx) => {
                const isIncome = txn.type === 'income';
                const sign = isIncome ? '+' : (txn.type === 'expense' ? '-' : '');
                const amountLabel = `${sign}${formatter.format(Number(txn.amount))}`;
                const accountName = accounts.find(a => a.id === txn.account_id)?.name || 'Unknown';
                
                return (
                  <View key={txn.id} className={`flex-row justify-between items-center py-4 px-4 ${idx !== 0 ? 'border-t border-gray-50' : ''}`}>
                    <View className="flex-row items-center flex-1">
                      <View className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 items-center justify-center mr-3">
                        <Text className="text-lg">{isIncome ? '📥' : '📤'}</Text>
                      </View>
                      <View className="flex-1 pr-2">
                        <Text className="font-bold text-[#0f172a] text-[15px] mb-0.5" numberOfLines={1}>{txn.description || txn.type}</Text>
                        <Text className="text-gray-400 text-[12px]">{accountName} • {new Date(txn.date).toLocaleDateString()}</Text>
                      </View>
                    </View>
                    <Text className={`font-bold text-[15px] tracking-tight ${isIncome ? 'text-emerald-600' : 'text-[#0f172a]'}`}>
                      {amountLabel.replace('Rp', '').trim()} <Text className="text-[10px] text-gray-400 font-medium">IDR</Text>
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text className="text-center text-gray-400 py-10 text-[13px]">No transactions yet.</Text>
            )}
        </View>
      </ScrollView>
    </View>
  );
}
