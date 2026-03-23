import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../src/utils/supabase';
import { StatusBar } from 'expo-status-bar';

// For mobile, we call the Next.js API route replacing localhost with the actual IP for Android emulator (10.0.2.2) or local IP.
// But since this runs dynamically, we can use process.env.EXPO_PUBLIC_API_URL if defined, otherwise default to local.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export default function BudgetsScreen() {
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [income, setIncome] = useState('');
  
  const [aiLoading, setAiLoading] = useState(false);
  const [allocation, setAllocation] = useState<any>(null);

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const currentMonth = new Date().toISOString().slice(0, 7);

  const fetchBudget = async () => {
    const { data } = await supabase.from('budgets').select('*').eq('month', currentMonth).single();
    if (data) setBudget(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBudget();
  }, []);

  const handleGenerateAI = async () => {
    if (!income) return alert('Enter your income first');
    setAiLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If we are on physical device, 10.0.2.2 won't work. For robust dev, it should be the local network IP.
      // Assuming user uses standard setup for now: 
      const response = await fetch(`${API_URL}/api/budget/allocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ income: Number(income.replace(/[^0-9]/g, '')) })
      });

      const result = await response.json();
      if (result.success) {
        setAllocation(result.allocation);
      } else {
        alert(result.error);
      }
    } catch (e: any) {
      alert('Failed to reach AI: ' + e.message);
    }
    setAiLoading(false);
  };

  const handleSaveBudget = async () => {
    if (!allocation) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('budgets').upsert({
      user_id: user?.id,
      month: currentMonth,
      needs_amount: allocation.needs,
      wants_amount: allocation.wants,
      savings_amount: allocation.savings,
      debt_amount: allocation.debt || 0
    }, { onConflict: 'user_id, month' });

    if (error) alert(error.message);
    else {
      alert('Budget saved successfully!');
      fetchBudget();
      setAllocation(null);
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 pt-16 pb-4 bg-white border-b border-gray-100 flex-row justify-between items-center z-10">
        <Text className="text-2xl font-bold tracking-tight text-[#0f172a]">Budgets</Text>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Current Budget Summary */}
        <View className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 mb-8">
          <Text className="font-bold text-lg text-[#0f172a] mb-4">This Month's Plan</Text>
          {budget ? (
            <View className="space-y-4">
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600 font-medium text-sm">Needs</Text>
                  <Text className="text-[#0f172a] font-bold text-sm">{formatter.format(Number(budget.needs_amount))}</Text>
                </View>
                <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full bg-blue-500 w-1/2" />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-1 mt-4">
                  <Text className="text-gray-600 font-medium text-sm">Wants</Text>
                  <Text className="text-[#0f172a] font-bold text-sm">{formatter.format(Number(budget.wants_amount))}</Text>
                </View>
                <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full bg-purple-500 w-1/3" />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-1 mt-4">
                  <Text className="text-gray-600 font-medium text-sm">Savings</Text>
                  <Text className="text-[#0f172a] font-bold text-sm">{formatter.format(Number(budget.savings_amount))}</Text>
                </View>
                <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full bg-green-500 w-[20%]" />
                </View>
              </View>

               {budget.debt_amount > 0 && (
                <View>
                  <View className="flex-row justify-between mb-1 mt-4">
                    <Text className="text-red-600 font-medium text-sm">Debt Repayment</Text>
                    <Text className="text-red-700 font-bold text-sm">{formatter.format(Number(budget.debt_amount))}</Text>
                  </View>
                  <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <View className="h-full bg-red-500 w-[15%]" />
                  </View>
                </View>
               )}
            </View>
          ) : (
            <Text className="text-gray-400 italic text-center">No budget active for {currentMonth}. Set one up below!</Text>
          )}
        </View>

        {/* AI Generator Setup */}
        <View className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
          <Text className="font-bold text-lg text-[#0f172a] mb-2">{budget ? 'Update Budget' : 'Create Budget'}</Text>
          <Text className="text-gray-500 text-[13px] mb-6">Let Gemini AI recommend an optimal allocation based on your current debts and income.</Text>
          
          <Text className="text-gray-700 font-semibold mb-2">Monthly Income (IDR)</Text>
          <TextInput 
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-lg font-bold mb-4"
            placeholder="e.g. 5000000"
            keyboardType="numeric"
            value={income}
            onChangeText={setIncome}
          />

          <TouchableOpacity 
            className="bg-[#0f172a] py-3.5 rounded-xl items-center shadow-md mb-6 flex-row justify-center gap-2"
            onPress={handleGenerateAI}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-lg">✨</Text>
                <Text className="text-white font-bold">Generate Smart Allocation</Text>
              </>
            )}
          </TouchableOpacity>

          {allocation && (
            <View className="mt-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4 mb-6">
              <View className="flex-row items-center gap-2 mb-2">
                <Text className="text-lg">✨</Text>
                <Text className="text-sm font-bold text-[#1A6FD6]">Gemini AI Recommendation</Text>
              </View>

              <Text className="text-[13px] text-gray-600 italic mb-4 leading-relaxed">
                "{allocation.reason}"
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center text-sm mb-1">
                  <Text className="font-medium text-gray-700">Needs</Text>
                  <Text className="font-semibold text-gray-900">{formatter.format(allocation.needs)}</Text>
                </View>
                <View className="flex-row justify-between items-center text-sm mb-1">
                  <Text className="font-medium text-gray-700">Wants</Text>
                  <Text className="font-semibold text-gray-900">{formatter.format(allocation.wants)}</Text>
                </View>
                <View className="flex-row justify-between items-center text-sm mb-1">
                  <Text className="font-medium text-gray-700">Savings</Text>
                  <Text className="font-semibold text-gray-900">{formatter.format(allocation.savings)}</Text>
                </View>
                {allocation.debt > 0 && (
                  <View className="flex-row justify-between items-center text-sm mt-3 pt-3 border-t border-blue-100">
                    <Text className="font-medium text-red-600">Debt Reserve</Text>
                    <Text className="font-semibold text-red-600">{formatter.format(allocation.debt)}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                className="bg-[#1A6FD6] py-3 mt-6 rounded-lg items-center shadow-sm"
                onPress={handleSaveBudget}
                disabled={loading}
              >
                <Text className="text-white font-bold">Save This Budget</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>

      </ScrollView>
    </View>
  );
}
