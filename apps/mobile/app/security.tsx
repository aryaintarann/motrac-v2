import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useState, useCallback } from 'react';
import { supabase } from '../src/utils/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function SecurityScreen() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  // Password state
  const [passwordForm, setPasswordForm] = useState({ new: '', confirm: '' });
  const [pwdMessage, setPwdMessage] = useState({ text: '', type: '' });
  const [isUpdatingPwd, setIsUpdatingPwd] = useState(false);

  // MFA State
  const [isMfaEnrolled, setIsMfaEnrolled] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<{secret: string, factorId: string} | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState({ text: '', type: '' });

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          checkMfaStatus();
          fetchSessions();
        }
      });
    }, [])
  );

  const fetchSessions = async () => {
    const { data, error } = await supabase.rpc('get_my_sessions');
    if (!error && data) {
      setSessions(data);
    }
  };

  const parseDevice = (ua: string) => {
    if (!ua) return 'Unknown Device';
    let browser = 'Web Browser';
    let os = 'Unknown OS';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return `${browser} on ${os}`;
  };

  const checkMfaStatus = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!error && data) {
      const isEnrolled = data.nextLevel === 'aal2' || data.currentLevel === 'aal2';
      setIsMfaEnrolled(isEnrolled);
    }
  };

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

  const startMfaSetup = async () => {
    setMfaMessage({ text: 'Generating configuration...', type: 'info' });
    
    try {
      const { data: factorData } = await supabase.auth.mfa.listFactors();
      if (factorData && factorData.totp) {
        for (const factor of factorData.totp) {
          if ((factor as any).status === 'unverified') {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
      }
    } catch (e) {}

    const { data, error } = await supabase.auth.mfa.enroll({ 
      factorType: 'totp',
      friendlyName: `Motrac Mobile ${new Date().toISOString().split('T')[0]}`
    });
    
    if (error) {
      setMfaMessage({ text: error.message, type: 'error' });
    } else if (data) {
      setMfaSetup({
        secret: data.totp.secret,
        factorId: data.id
      });
      setMfaMessage({ text: '', type: '' });
    }
  };

  const verifyMfaSetup = async () => {
    if (!mfaSetup) return;
    setMfaMessage({ text: 'Verifying code...', type: 'info' });
    
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaSetup.factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: mfaSetup.factorId,
        challengeId: challenge.data.id,
        code: totpCode
      });
      if (verify.error) throw verify.error;

      setMfaMessage({ text: '2FA setup complete!', type: 'success' });
      setIsMfaEnrolled(true);
      setMfaSetup(null);
    } catch (error: any) {
      setMfaMessage({ text: error.message || 'Verification failed.', type: 'error' });
    }
  };

  const handleLogoutOthers = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    if (error) {
      Alert.alert("Error", "Failed to log out of other devices.");
    } else {
      Alert.alert("Success", "Successfully logged out from all other remote sessions.");
      fetchSessions();
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Config key copied to clipboard! Paste it into your Authenticator app.');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setIsDeleting(true);
    
    const { error } = await supabase.rpc('delete_my_account');
    if (error) {
      setIsDeleting(false);
      Alert.alert("Error", `Could not delete account. ${error.message}`);
    } else {
       await supabase.auth.signOut();
       router.replace('/(auth)/login');
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

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        
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

        {/* Two-Factor Authentication (2FA) */}
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="font-bold text-[18px] text-gray-900 mb-2">Two-Factor Authentication (2FA)</Text>
          <Text className="text-[13px] text-gray-500 mb-6">Enhance your account security using an Authenticator app (like Google Authenticator).</Text>
          
          {isMfaEnrolled ? (
            <View className="flex-row items-center gap-4 bg-green-50 rounded-xl p-4 border border-green-100">
               <View className="h-10 w-10 bg-green-100 rounded-full items-center justify-center">
                 <MaterialCommunityIcons name="shield-check" size={20} color="#166534" />
               </View>
               <View className="flex-1">
                 <Text className="text-[15px] font-bold text-green-800">2FA is Enabled</Text>
                 <Text className="text-[12px] text-green-700 mt-0.5">Your account is heavily protected.</Text>
               </View>
            </View>
          ) : mfaSetup ? (
            <View className="bg-gray-50 rounded-xl p-5 border border-gray-200">
               <Text className="text-[14px] font-bold text-gray-900 mb-2">Manual Setup Key</Text>
               <Text className="text-[13px] text-gray-600 mb-4">Enter this configuration key into your authenticator app to generate a valid pin.</Text>
               
               <TouchableOpacity onPress={() => copyToClipboard(mfaSetup.secret)} className="bg-white px-4 py-3 rounded-xl border border-gray-200 mb-6 flex-row items-center justify-between shadow-sm">
                 <Text className="text-[14px] font-mono text-gray-800 flex-1">{mfaSetup.secret}</Text>
                 <MaterialCommunityIcons name="content-copy" size={20} color="#6B7280" />
               </TouchableOpacity>

               <Text className="text-[14px] font-bold text-gray-900 mb-2">Enter Verification Code</Text>
               <View className="flex-row gap-3">
                 <TextInput 
                   placeholder="123456"
                   maxLength={6}
                   keyboardType="number-pad"
                   value={totpCode}
                   onChangeText={setTotpCode}
                   className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-[16px] font-mono text-center tracking-[8px] bg-white focus:border-blue-500"
                 />
                 <TouchableOpacity onPress={verifyMfaSetup} className="rounded-xl bg-gray-900 px-6 items-center justify-center shadow-sm">
                   <Text className="text-white font-bold text-[14px]">Verify</Text>
                 </TouchableOpacity>
               </View>
               {mfaMessage.text ? (
                 <Text className={`text-[13px] mt-4 font-medium ${mfaMessage.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>{mfaMessage.text}</Text>
               ) : null}
            </View>
          ) : (
            <View className="flex-col items-start">
              <TouchableOpacity onPress={startMfaSetup} className="rounded-xl bg-gray-900 px-6 py-3.5 w-full items-center justify-center shadow-sm">
                <Text className="text-white font-bold text-[15px]">Setup Authenticator</Text>
              </TouchableOpacity>
              {mfaMessage.text ? (
                <Text className={`text-[13px] mt-3 font-medium ${mfaMessage.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>{mfaMessage.text}</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Sessions Card */}
        <View className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="font-bold text-[18px] text-gray-900 mb-2">Active Sessions</Text>
          <Text className="text-[13px] text-gray-500 mb-4">Logged in on a public computer? Sign out of all other remote sessions immediately.</Text>
          
          {sessions.length > 0 && (
            <View className="mb-6 bg-gray-50 rounded-xl border border-gray-100 p-2">
              {sessions.map((sess, idx) => (
                <View key={idx} className={`flex-row items-center justify-between p-3 ${idx !== sessions.length - 1 ? 'border-b border-gray-200' : ''}`}>
                  <View className="flex-1 pr-3">
                    <Text className="text-[14px] font-bold text-gray-900">{parseDevice(sess.user_agent)}</Text>
                    <Text className="text-[11px] text-gray-500 mt-0.5">{sess.ip} • {new Date(sess.created_at).toLocaleDateString()}</Text>
                  </View>
                  {idx === 0 && (
                     <View className="bg-green-100 px-2 py-1 rounded border border-green-200">
                       <Text className="text-[10px] font-bold text-green-700">CURRENT</Text>
                     </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            onPress={handleLogoutOthers}
            className="w-full rounded-xl py-4 items-center justify-center bg-orange-50 border border-orange-100 flex-row gap-2"
          >
            <MaterialCommunityIcons name="cellphone-off" size={18} color="#C2410C" />
            <Text className="text-orange-700 font-bold text-[15px]">Log Out Other Devices</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="bg-red-50 rounded-[24px] p-6 shadow-sm border border-red-100 mb-6">
          <Text className="font-bold text-[18px] text-red-900 mb-2">Danger Zone</Text>
          <Text className="text-[13px] text-red-700 mb-6 leading-5">Permanently delete your account and all financial data. This action cannot be undone.</Text>
          
          <TextInput 
            placeholder='Type "DELETE" to confirm'
            placeholderTextColor="#FCA5A5"
            value={deleteConfirm}
            onChangeText={setDeleteConfirm}
            className="w-full rounded-xl border border-red-300 px-4 py-3.5 text-[15px] bg-white text-red-900 mb-4"
          />
          <TouchableOpacity 
            disabled={deleteConfirm !== 'DELETE' || isDeleting}
            onPress={handleDeleteAccount}
            className={`w-full rounded-xl py-4 items-center justify-center ${deleteConfirm !== 'DELETE' ? 'bg-red-300' : 'bg-red-600'}`}
          >
            {isDeleting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-[16px]">Delete Account</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
