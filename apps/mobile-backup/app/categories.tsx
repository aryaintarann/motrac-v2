import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { supabase } from '../src/utils/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BUDGET_TYPE_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  needs:   { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', label: 'Needs 50%' },
  wants:   { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9', label: 'Wants 30%' },
  savings: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', label: 'Savings 20%' },
  other:   { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', label: 'Other' },
};

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<{ parentId: string; parentName: string; parentType: string } | null>(null);
  const [catForm, setCatForm] = useState({ name: '', icon: '' });
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(useCallback(() => { fetchCategories(); }, []));

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('created_at');
    if (data) setCategories(data);
  };

  const mainCats = categories.filter(c => !c.parent_id);

  const openAddSubCat = (parentId: string, parentName: string, parentType: string) => {
    setModalContext({ parentId, parentName, parentType });
    setCatForm({ name: '', icon: '' });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim() || !modalContext) return;
    setIsSaving(true);
    const { error } = await supabase.from('categories').insert({
      name: catForm.name.trim(),
      icon: catForm.icon.trim() || '📌',
      parent_id: modalContext.parentId,
      type: modalContext.parentType,
    });
    setIsSaving(false);
    if (error) return Alert.alert('Error', error.message);
    setIsModalOpen(false);
    fetchCategories();
  };

  const handleDeleteSubCat = (cat: any) => {
    Alert.alert('Delete Category', `Remove "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('categories').delete().eq('id', cat.id);
        fetchCategories();
      }},
    ]);
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar style="dark" />
      <View className="flex-row items-center gap-3 px-5 pt-16 pb-4 bg-white border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
          <MaterialCommunityIcons name="arrow-left" size={20} color="#1F2937" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-[#0f172a]">Categories</Text>
          <Text className="text-[12px] text-gray-500">50/30/20 budget buckets</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {mainCats.length === 0 ? (
          <View className="items-center py-20">
            <Text className="text-6xl mb-4">🗂️</Text>
            <Text className="font-bold text-gray-800 text-[18px] mb-2">No Categories Yet</Text>
            <Text className="text-gray-500 text-center text-[14px] leading-6 px-6">
              Create your monthly budget on the Dashboard first to auto-generate the 50/30/20 baseline categories.
            </Text>
          </View>
        ) : (
          <View className="gap-5">
            {mainCats.map(main => {
              const children = categories.filter(c => c.parent_id === main.id);
              const style = BUDGET_TYPE_STYLES[main.budget_type] || BUDGET_TYPE_STYLES.other;

              return (
                <View key={main.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                  {/* Parent Header */}
                  <View className="flex-row items-center gap-4 p-5 border-b border-gray-50">
                    <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: style.bg, borderWidth: 1, borderColor: style.border }}>
                      <Text className="text-2xl">{main.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-[18px] text-gray-900">{main.name}</Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: style.bg }}>
                          <Text className="text-[11px] font-bold uppercase tracking-wider" style={{ color: style.text }}>{style.label}</Text>
                        </View>
                        <View className={`px-2 py-0.5 rounded-md ${main.type === 'expense' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          <Text className={`text-[11px] font-bold uppercase ${main.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>{main.type}</Text>
                        </View>
                      </View>
                    </View>
                    <Text className="text-[12px] text-gray-400 font-semibold">{children.length} sub</Text>
                  </View>

                  {/* Sub-categories */}
                  <View className="p-4 gap-2">
                    {children.map(child => (
                      <View key={child.id} className="flex-row items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <View className="flex-row items-center gap-3">
                          <Text className="text-xl">{child.icon}</Text>
                          <Text className="font-semibold text-[14px] text-gray-800">{child.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteSubCat(child)} className="h-7 w-7 bg-red-50 rounded-full items-center justify-center">
                          <MaterialCommunityIcons name="close" size={12} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {children.length === 0 && (
                      <View className="py-4 items-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <Text className="text-[13px] text-gray-400 italic">No sub-categories yet</Text>
                      </View>
                    )}

                    {/* Add sub-category button */}
                    <TouchableOpacity onPress={() => openAddSubCat(main.id, main.name, main.type)}
                      className="mt-1 flex-row items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl">
                      <MaterialCommunityIcons name="plus" size={16} color="#6B7280" />
                      <Text className="text-[13px] font-semibold text-gray-500">Add Sub-Category to {main.name}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Sub-Category Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-gray-900/40">
          <View className="bg-white rounded-t-[28px] p-6 pb-10">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="font-bold text-[18px] text-gray-900">New Sub-Category</Text>
                {modalContext && <Text className="text-[12px] text-gray-500 mt-0.5">Parent: {modalContext.parentName}</Text>}
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center">
                <MaterialCommunityIcons name="close" size={18} color="#374151" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-[13px] font-bold text-gray-700 mb-2">Category Name</Text>
              <TextInput value={catForm.name} onChangeText={v => setCatForm(f => ({...f, name: v}))}
                placeholder="e.g. Groceries, Netflix, Gas"
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] bg-gray-50 text-gray-900" autoFocus />
            </View>

            <View className="mb-6">
              <Text className="text-[13px] font-bold text-gray-700 mb-2">Emoji Icon (Optional)</Text>
              <TextInput value={catForm.icon} onChangeText={v => setCatForm(f => ({...f, icon: v}))}
                placeholder="🍎" maxLength={2}
                className="w-20 rounded-xl border border-gray-200 px-4 py-3 text-[22px] text-center bg-gray-50 text-gray-900" />
            </View>

            <TouchableOpacity disabled={isSaving || !catForm.name.trim()} onPress={handleSaveCategory}
              className={`w-full rounded-xl py-4 items-center justify-center ${!catForm.name.trim() || isSaving ? 'bg-blue-300' : 'bg-blue-600'}`}>
              {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[16px]">Save Category</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
