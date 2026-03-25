import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../src/utils/supabase';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function DebtsScreen() {
  const [debts, setDebts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchDebts = async () => {
    const { data } = await supabase.from('debts').select('*').order('created_at', { ascending: false });
    if (data) setDebts(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDebts();
  }, []);

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-white border-b border-gray-100 flex-row justify-between items-center z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="h-8 w-8 bg-gray-100 rounded-full items-center justify-center">
            <Text className="text-gray-600 font-bold">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold tracking-tight text-[#0f172a]">Debts</Text>
        </View>
        <TouchableOpacity className="bg-[#1A6FD6] h-10 w-10 rounded-full items-center justify-center shadow-sm">
          <Text className="text-white text-2xl font-light -mt-1">+</Text>
        </TouchableOpacity>
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
            ) : debts.length > 0 ? (
              debts.map((debt, idx) => {
                const isIOwe = debt.direction === 'i_owe';
                const progress = ((debt.principal - debt.remaining_amount) / debt.principal) * 100;
                
                return (
                  <View key={debt.id} className={`p-4 ${idx !== 0 ? 'border-t border-gray-50' : ''}`}>
                    <View className="flex-row justify-between items-center mb-2">
                       <View className="flex-1">
                         <Text className="font-bold text-[#0f172a] text-[15px]">{debt.name}</Text>
                         <Text className={`text-[12px] font-medium ${isIOwe ? 'text-red-500' : 'text-green-500'}`}>
                           {isIOwe ? 'I Owe' : 'They Owe Me'}
                         </Text>
                       </View>
                       <View className="items-end">
                         <Text className="font-bold text-[#0f172a] text-[15px]">{formatter.format(debt.remaining_amount)}</Text>
                         <Text className="text-gray-400 text-[11px]">of {formatter.format(debt.principal)}</Text>
                       </View>
                    </View>
                    
                    {/* Progress Bar */}
                    <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                        <View className={`h-full ${isIOwe ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                    </View>
                  </View>
                );
              })
            ) : (
              <Text className="text-center text-gray-400 py-10 text-[13px]">No active debts or receivables.</Text>
            )}
        </View>
      </ScrollView>
    </View>
  );
}
