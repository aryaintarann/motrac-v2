import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { supabase } from '../src/utils/supabase';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SecurityScreen() {
  const router = useRouter();
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '' });
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  const handleUpdatePassword = async () => {
    setPwdMessage({ text: '', type: '' });
    if (!passwordForm.new || !passwordForm.confirm) return setPwdMessage({ text: "Please enter a password.", type: 'error' });
    if (passwordForm.new !== passwordForm.confirm) {
      return setPwdMessage({ text: "New passwords don't match.", type: 'error' });
    }

    setIsUpdatingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    setIsUpdatingPwd(false);

    if (error) {
      setPwdMessage({ text: error.message, type: 'error' });
    } else {
      setPwdMessage({ text: 'Password updated successfully.', type: 'success' });
      setPasswordForm({ new: '', confirm: '' });
    }
  };

  const handleLogoutOthers = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    if (error) {
      alert("Failed to log out: " + error.message);
    } else {
      alert("Successfully logged out from all other devices.");
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
          <Text className="text-xl font-bold text-[#0f172a]">Security</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        
        {/* Password Card */}
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="font-bold text-[18px] text-gray-900 mb-4">Change Password</Text>
          
          <View className="mb-4">
            <Text className="text-[14px] font-semibold text-gray-700 mb-2">New Password</Text>
            <TextInput 
              secureTextEntry
              value={passwordForm.new}
              onChangeText={(val) => setPasswordForm(p => ({...p, new: val}))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] bg-gray-50 text-gray-900"
            />
          </View>
          
          <View className="mb-6">
            <Text className="text-[14px] font-semibold text-gray-700 mb-2">Confirm Password</Text>
            <TextInput 
              secureTextEntry
              value={passwordForm.confirm}
              onChangeText={(val) => setPasswordForm(p => ({...p, confirm: val}))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] bg-gray-50 text-gray-900"
            />
          </View>

          {pwdMessage.text ? (
            <View className={`p-4 rounded-xl mb-6 ${pwdMessage.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
              <Text className={`text-[14px] font-medium text-center ${pwdMessage.type === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                {pwdMessage.text}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity 
            disabled={isUpdatingPwd}
            onPress={handleUpdatePassword}
            className={`w-full rounded-xl py-4 items-center justify-center ${isUpdatingPwd ? 'bg-blue-400' : 'bg-blue-600'}`}
          >
            {isUpdatingPwd ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[16px]">Update Password</Text>}
          </TouchableOpacity>
        </View>

        {/* Sessions Card */}
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="font-bold text-[18px] text-gray-900 mb-2">Active Sessions</Text>
          <Text className="text-[13px] text-gray-500 mb-6">Logged in on a public computer? Sign out of all other remote sessions immediately.</Text>
          
          <TouchableOpacity 
            onPress={handleLogoutOthers}
            className="w-full rounded-xl py-4 items-center justify-center bg-orange-50 border border-orange-100"
          >
            <Text className="text-orange-600 font-bold text-[15px]">Log Out Other Devices</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
