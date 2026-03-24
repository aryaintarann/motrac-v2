import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { supabase } from '../src/utils/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
    }, [])
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  const email = session?.user?.email || 'Loading...';
  const name = session?.user?.user_metadata?.full_name || email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'User';

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-16 pb-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
            <MaterialCommunityIcons name="arrow-left" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0f172a]">Profile</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        
        {/* Avatar Card */}
        <View className="bg-white rounded-[24px] p-6 items-center shadow-sm border border-gray-100 mb-6">
          <View className="relative mb-4">
            <View className="w-24 h-24 rounded-full bg-slate-200 items-center justify-center border-4 border-white shadow-sm overflow-hidden">
               <Text className="text-4xl font-bold text-slate-500">
                 {email !== 'Loading...' ? email.charAt(0).toUpperCase() : 'U'}
               </Text>
            </View>
            <View className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full items-center justify-center border-2 border-white">
              <MaterialCommunityIcons name="pencil" size={12} color="white" />
            </View>
          </View>
          
          <Text className="text-xl font-extrabold text-[#111827] mb-1 capitalize">{name}</Text>
          <Text className="text-[14px] text-gray-500 font-medium">{email}</Text>
          
          <View className="mt-5 bg-blue-50 px-4 py-2 rounded-full">
            <Text className="text-blue-700 font-bold text-[13px]">Pro Member</Text>
          </View>
        </View>

        {/* Action Menu */}
        <View className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-6 py-2">
          
          <TouchableOpacity className="flex-row items-center px-5 py-4 border-b border-gray-50">
            <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
              <MaterialCommunityIcons name="account-outline" size={22} color="#4B5563" />
            </View>
            <Text className="flex-1 text-[16px] font-semibold text-[#374151]">Personal Information</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center px-5 py-4 border-b border-gray-50">
            <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#4B5563" />
            </View>
            <Text className="flex-1 text-[16px] font-semibold text-[#374151]">Security</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center px-5 py-4">
            <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
              <MaterialCommunityIcons name="cog-outline" size={22} color="#4B5563" />
            </View>
            <Text className="flex-1 text-[16px] font-semibold text-[#374151]">Settings</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center px-5 py-4 bg-white rounded-[20px] shadow-sm border border-red-100 justify-center gap-2 mb-10"
        >
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text className="text-[16px] font-bold text-red-500">Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
