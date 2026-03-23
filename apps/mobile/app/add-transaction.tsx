import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../src/utils/supabase';
import { Account } from '@motrac/shared';
import { useRouter } from 'expo-router';

export default function AddTransaction() {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState('');
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.from('accounts').select('*').order('name').then(({ data }) => {
      if (data) {
        setAccounts(data as Account[]);
        if (data.length > 0) setAccountId(data[0].id);
      }
    });
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!amount || !accountId || !categoryId) return alert('Amount, Account, and Category are required');
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('transactions').insert({
      user_id: user?.id,
      account_id: accountId,
      category_id: categoryId,
      amount: Number(amount.replace(/[^0-9]/g, '')),
      type,
      description,
      date: new Date().toISOString()
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-[#F5F7FA] pt-12">
      <View className="flex-row justify-between items-center px-6 pb-6">
        <Text className="text-2xl font-bold text-[#0f172a]">New Transaction</Text>
        <TouchableOpacity onPress={() => router.back()} className="h-8 w-8 bg-gray-200 rounded-full items-center justify-center">
          <Text className="text-gray-600 font-bold">✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6 flex-1">
        {/* Type selector */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
          <TouchableOpacity 
            className={`flex-1 py-3 items-center rounded-lg ${type === 'expense' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setType('expense')}
          >
            <Text className={`font-semibold ${type === 'expense' ? 'text-red-600' : 'text-gray-500'}`}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 py-3 items-center rounded-lg ${type === 'income' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setType('income')}
          >
            <Text className={`font-semibold ${type === 'income' ? 'text-green-600' : 'text-gray-500'}`}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text className="text-gray-700 font-semibold mb-2">Amount (IDR)</Text>
        <TextInput 
          className="bg-white border border-gray-200 rounded-2xl p-5 text-3xl font-bold text-center mb-6 text-[#1A6FD6]"
          placeholder="0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Description */}
        <Text className="text-gray-700 font-semibold mb-2">Description</Text>
        <TextInput 
          className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-[15px]"
          placeholder="What was this for?"
          value={description}
          onChangeText={setDescription}
        />

        {/* Account Selector (Horizontal Scroll for simplicity) */}
        <Text className="text-gray-700 font-semibold mb-2">Account</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 min-h-[60px]">
          {accounts.map(acc => (
             <TouchableOpacity 
              key={acc.id}
              onPress={() => setAccountId(acc.id)}
              className={`px-5 py-3 rounded-xl border mr-3 h-12 flex-row items-center justify-center ${accountId === acc.id ? 'bg-[#1A6FD6] border-[#1A6FD6]' : 'bg-white border-gray-200'}`}
             >
               <Text className={`font-medium ${accountId === acc.id ? 'text-white' : 'text-gray-700'}`}>{acc.name}</Text>
             </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Selector */}
        <Text className="text-gray-700 font-semibold mb-2">Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 min-h-[60px]">
          {categories.map(cat => (
             <TouchableOpacity 
              key={cat.id}
              onPress={() => setCategoryId(cat.id)}
              className={`px-5 py-3 rounded-xl border mr-3 h-12 flex-row items-center justify-center ${categoryId === cat.id ? 'bg-[#1A6FD6] border-[#1A6FD6]' : 'bg-white border-gray-200'}`}
             >
               <Text className={`font-medium ${categoryId === cat.id ? 'text-white' : 'text-gray-700'}`}>{cat.name}</Text>
             </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Save Button */}
        <TouchableOpacity 
          className="bg-[#1A6FD6] py-4 rounded-xl items-center shadow-lg shadow-blue-200 mb-10"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
