import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../src/utils/supabase';
import { StatusBar } from 'expo-status-bar';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your Motrac AI Advisor. I have access to your transactions, budget, and debts. How can I help you optimize your finances today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (presetMessage?: string) => {
    const userMessageContent = presetMessage || input.trim();
    if (!userMessageContent) return;

    const newMessage: Message = { id: Date.now().toString(), role: 'user', content: userMessageContent };
    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) throw new Error('Failed to reach AI');
      
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.text }]);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    
    setIsLoading(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center z-10">
         <View className="h-10 w-10 rounded-full bg-[#1A6FD6] items-center justify-center mr-3 shadow-md">
            <Text className="text-white text-xl">✨</Text>
         </View>
         <View>
            <Text className="text-xl font-bold tracking-tight text-[#0f172a]">AI Advisor</Text>
            <Text className="text-green-600 text-xs font-semibold">● Online</Text>
         </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4" 
          contentContainerStyle={{ paddingVertical: 20 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View key={msg.id} className={`mb-4 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <View className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-[#1A6FD6] rounded-tr-sm' 
                  : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm'
              }`}>
                <Text className={`text-[15px] leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View className="mb-4 flex-row justify-start">
              <View className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-3">
                 <ActivityIndicator color="#1A6FD6" size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="p-4 bg-white border-t border-gray-100">
           {/* Suggestions */}
           {messages.length === 1 && (
             <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
               {["Evaluate my recent spending", "How can I reduce my debt faster?"].map((suggestion, idx) => (
                 <TouchableOpacity 
                    key={idx}
                    onPress={() => sendMessage(suggestion)}
                    className="bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mr-2"
                 >
                    <Text className="text-[#1A6FD6] text-xs font-medium">{suggestion}</Text>
                 </TouchableOpacity>
               ))}
             </ScrollView>
           )}

           <View className="flex-row items-center gap-2">
             <TextInput 
               className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-[15px] pt-3 pb-3"
               placeholder="Ask me anything..."
               placeholderTextColor="#9ca3af"
               value={input}
               onChangeText={setInput}
               multiline
               maxLength={500}
             />
             <TouchableOpacity 
               onPress={() => sendMessage()}
               disabled={!input.trim() || isLoading}
               className={`h-11 w-11 rounded-full items-center justify-center ${
                 !input.trim() || isLoading ? 'bg-gray-200' : 'bg-[#1A6FD6]'
               }`}
             >
               <Text className="text-white font-bold text-lg">↑</Text>
             </TouchableOpacity>
           </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
