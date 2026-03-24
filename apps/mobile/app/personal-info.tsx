import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { supabase } from '../src/utils/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          setFullName(session.user.user_metadata?.full_name || '');
          setNickname(session.user.user_metadata?.nickname || '');
        }
      });
    }, [])
  );

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, nickname: nickname }
    });

    setIsSaving(false);
    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => router.back(), 1500);
    }
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar style="dark" />
      <View className="flex-row items-center justify-between px-5 pt-16 pb-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
            <MaterialCommunityIcons name="arrow-left" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0f172a]">Personal Info</Text>
        </View>
      </View>

      <View className="p-5 flex-1">
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          
          <View className="mb-5">
            <Text className="text-[14px] font-semibold text-gray-700 mb-2">Full Name</Text>
            <TextInput 
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] bg-gray-50 text-gray-900"
            />
          </View>
          
          <View className="mb-6">
            <Text className="text-[14px] font-semibold text-gray-700 mb-2">Nickname</Text>
            <TextInput 
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g. Johnny"
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] bg-gray-50 text-gray-900"
            />
          </View>

          {message.text ? (
            <View className={`p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
              <Text className={`text-[14px] font-medium text-center ${message.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                {message.text}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity 
            disabled={isSaving}
            onPress={handleSave}
            className={`w-full rounded-xl py-4 items-center justify-center ${isSaving ? 'bg-blue-400' : 'bg-blue-600'}`}
          >
            {isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[16px]">Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
