import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { supabase } from '../src/utils/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ACCOUNT_TYPES = ['bank', 'e_wallet', 'cash', 'credit_card', 'investment', 'other'];
const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];
const ICONS = ['🏦', '💳', '💰', '🏧', '📈', '💵', '🏪', '💼'];

export default function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'bank', balance: '', color: '#2563EB', icon: '🏦', include_in_net_worth: true });

  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  useFocusEffect(useCallback(() => { fetchAccounts(); }, []));

  const fetchAccounts = async () => {
    const { data } = await supabase.from('accounts').select('*').order('name');
    if (data) setAccounts(data);
  };

  const openAdd = () => {
    setEditAccount(null);
    setForm({ name: '', type: 'bank', balance: '', color: '#2563EB', icon: '🏦', include_in_net_worth: true });
    setIsModalOpen(true);
  };

  const openEdit = (acc: any) => {
    setEditAccount(acc);
    setForm({ name: acc.name, type: acc.type, balance: String(acc.balance), color: acc.color || '#2563EB', icon: acc.icon || '🏦', include_in_net_worth: acc.include_in_net_worth ?? true });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Account name is required.');
    setIsSaving(true);
    const payload = { name: form.name.trim(), type: form.type, balance: parseFloat(form.balance) || 0, color: form.color, icon: form.icon, include_in_net_worth: form.include_in_net_worth };
    let error: any = null;
    if (editAccount) {
      ({ error } = await supabase.from('accounts').update(payload).eq('id', editAccount.id));
    } else {
      ({ error } = await supabase.from('accounts').insert(payload));
    }
    setIsSaving(false);
    if (error) return Alert.alert('Error', error.message);
    setIsModalOpen(false);
    fetchAccounts();
  };

  const handleDelete = (acc: any) => {
    Alert.alert('Delete Account', `Are you sure you want to delete "${acc.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('accounts').delete().eq('id', acc.id);
        fetchAccounts();
      }}
    ]);
  };

  const totalBalance = accounts.reduce((sum, a) => a.include_in_net_worth ? sum + Number(a.balance) : sum, 0);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar style="dark" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-16 pb-4 bg-white border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
            <MaterialCommunityIcons name="arrow-left" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0f172a]">My Accounts</Text>
        </View>
        <TouchableOpacity onPress={openAdd} className="flex-row items-center gap-2 bg-blue-600 px-4 py-2.5 rounded-xl shadow-sm">
          <MaterialCommunityIcons name="plus" size={18} color="white" />
          <Text className="text-white font-bold text-[14px]">New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Net Worth Summary */}
        <View className="bg-blue-600 rounded-[24px] p-6 mb-6 shadow-md">
          <Text className="text-blue-100 text-[13px] font-semibold mb-1">Total Net Worth</Text>
          <Text className="text-white text-[28px] font-extrabold tracking-tight">
            {formatter.format(totalBalance).replace('Rp', '').trim()} <Text className="text-[16px] text-blue-200">IDR</Text>
          </Text>
          <Text className="text-blue-200 text-[12px] mt-2">{accounts.filter(a => a.include_in_net_worth).length} of {accounts.length} accounts included</Text>
        </View>

        {/* Account Grid */}
        <View className="gap-4">
          {accounts.map(acc => (
            <TouchableOpacity key={acc.id} onLongPress={() => openEdit(acc)} onPress={() => openEdit(acc)}
              className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden"
              style={{ borderTopWidth: 5, borderTopColor: acc.color || '#2563EB' }}>
              <View className="p-5">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="w-12 h-12 bg-gray-50 rounded-[14px] items-center justify-center border border-gray-100">
                    <Text className="text-2xl">{acc.icon || '🏦'}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-gray-100 px-3 py-1 rounded-full">
                      <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{acc.type.replace('_', ' ')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(acc)} className="h-8 w-8 bg-red-50 rounded-full items-center justify-center border border-red-100">
                      <MaterialCommunityIcons name="trash-can-outline" size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="font-bold text-[18px] text-gray-900 mb-3">{acc.name}</Text>
                <View className="flex-row items-baseline">
                  <Text className="font-extrabold text-[26px] text-gray-900 tracking-tight">
                    {formatter.format(Number(acc.balance)).replace('Rp', '').trim()}
                  </Text>
                  <Text className="text-[15px] text-gray-400 ml-1">IDR</Text>
                </View>
                {!acc.include_in_net_worth && (
                  <View className="mt-3 flex-row items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 self-start">
                    <MaterialCommunityIcons name="alert" size={12} color="#F59E0B" />
                    <Text className="text-[12px] text-amber-700 font-semibold">Excluded from net worth</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          {accounts.length === 0 && (
            <View className="items-center py-16">
              <Text className="text-5xl mb-4">🏦</Text>
              <Text className="font-bold text-gray-800 text-[18px] mb-2">No Accounts Yet</Text>
              <Text className="text-gray-500 text-center text-[14px]">Tap + New to add your first account.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-6 pt-8 pb-4 border-b border-gray-100">
            <View>
              <Text className="font-bold text-[20px] text-gray-900">{editAccount ? 'Edit Account' : 'New Account'}</Text>
              <Text className="text-[13px] text-gray-500 mt-0.5">{editAccount ? 'Update account details' : 'Add a bank, wallet, or vault'}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsModalOpen(false)} className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="close" size={18} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
            <View className="mb-5">
              <Text className="text-[13px] font-bold text-gray-700 mb-2">Account Name *</Text>
              <TextInput value={form.name} onChangeText={v => setForm(f => ({...f, name: v}))} placeholder="e.g. BCA Main Account"
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] bg-gray-50 text-gray-900" />
            </View>

            <View className="mb-5">
              <Text className="text-[13px] font-bold text-gray-700 mb-2">Account Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {ACCOUNT_TYPES.map(t => (
                    <TouchableOpacity key={t} onPress={() => setForm(f => ({...f, type: t}))}
                      className={`px-4 py-2.5 rounded-xl border ${form.type === t ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'}`}>
                      <Text className={`text-[13px] font-bold capitalize ${form.type === t ? 'text-white' : 'text-gray-600'}`}>{t.replace('_', ' ')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="mb-5">
              <Text className="text-[13px] font-bold text-gray-700 mb-2">Balance (IDR)</Text>
              <TextInput value={form.balance} onChangeText={v => setForm(f => ({...f, balance: v}))} keyboardType="numeric"
                placeholder="e.g. 5000000" className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] bg-gray-50 text-gray-900" />
            </View>

            <View className="mb-5">
              <Text className="text-[13px] font-bold text-gray-700 mb-2">Color</Text>
              <View className="flex-row gap-3 flex-wrap">
                {COLORS.map(c => (
                  <TouchableOpacity key={c} onPress={() => setForm(f => ({...f, color: c}))}
                    className={`w-10 h-10 rounded-full border-[3px] ${form.color === c ? 'border-gray-900' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-[13px] font-bold text-gray-700 mb-2">Icon</Text>
              <View className="flex-row gap-3 flex-wrap">
                {ICONS.map(ic => (
                  <TouchableOpacity key={ic} onPress={() => setForm(f => ({...f, icon: ic}))}
                    className={`w-12 h-12 rounded-xl items-center justify-center border-2 ${form.icon === ic ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                    <Text className="text-2xl">{ic}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={() => setForm(f => ({...f, include_in_net_worth: !f.include_in_net_worth}))}
              className="flex-row items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
              <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${form.include_in_net_worth ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                {form.include_in_net_worth && <MaterialCommunityIcons name="check" size={14} color="white" />}
              </View>
              <View>
                <Text className="font-bold text-gray-800 text-[14px]">Include in Net Worth</Text>
                <Text className="text-gray-500 text-[12px]">Count this account in your balance total</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity disabled={isSaving} onPress={handleSave}
              className={`w-full rounded-xl py-4 items-center justify-center ${isSaving ? 'bg-blue-400' : 'bg-blue-600'}`}>
              {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[16px]">{editAccount ? 'Save Changes' : 'Create Account'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
