import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../src/utils/supabase';
import { useRouter } from 'expo-router';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { first_name: name } }
    });
    if (error) alert(error.message);
    else if (data.session) router.replace('/(tabs)');
    else alert('Check your email for the confirmation link.');
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center p-6 bg-[#F5F7FA]">
      <Text className="text-3xl font-black tracking-widest text-[#1A6FD6] mb-2 text-center">MOTRAC</Text>
      <Text className="text-gray-500 text-center mb-10">Create a new account</Text>
      
      <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <Text className="text-gray-700 font-semibold mb-2">Full Name</Text>
        <TextInput 
          className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-5 text-[15px]"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-gray-700 font-semibold mb-2">Email</Text>
        <TextInput 
          className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-5 text-[15px]"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Text className="text-gray-700 font-semibold mb-2">Password</Text>
        <TextInput 
          className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-8 text-[15px]"
          placeholder="Min. 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          className="bg-[#1A6FD6] rounded-xl p-4 items-center shadow-md shadow-blue-200"
          onPress={signUpWithEmail}
          disabled={loading}
        >
          <Text className="text-white font-bold text-lg">{loading ? 'Loading...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} className="mt-6 items-center">
          <Text className="text-[#1A6FD6] font-semibold">Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
