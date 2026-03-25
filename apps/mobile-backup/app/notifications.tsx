import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { supabase } from '../src/utils/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) fetchNotifications(session.user.id);
      });
    }, [])
  );

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);
      
    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'success': return 'check-circle-outline';
      case 'alert': return 'alert-circle-outline';
      case 'warning': return 'alert-outline';
      default: return 'bell-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch(type) {
      case 'success': return '#10B981'; // emerald-500
      case 'alert': return '#EF4444'; // red-500
      case 'warning': return '#F59E0B'; // amber-500
      default: return '#3B82F6'; // blue-500
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-16 pb-4 bg-white border-b border-gray-100 shadow-sm z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
            <MaterialCommunityIcons name="arrow-left" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#0f172a]">Notifications</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text className="text-[#2563EB] text-[13px] font-semibold">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator color="#2563EB" size="large" className="mt-10" />
        ) : notifications.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <MaterialCommunityIcons name="bell-off-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 font-medium text-[15px]">You're all caught up!</Text>
          </View>
        ) : (
          <View className="gap-3">
            {notifications.map((notif) => (
              <TouchableOpacity 
                key={notif.id} 
                onPress={() => {
                  if (!notif.is_read) markAsRead(notif.id);
                  if (notif.link) {
                     // Can safely route if a link is provided here just like Web
                     // router.push(notif.link);
                  }
                }}
                className={`flex-row p-4 rounded-2xl border ${notif.is_read ? 'bg-white border-gray-100' : 'bg-blue-50/50 border-blue-100/60 shadow-sm'} relative overflow-hidden`}
              >
                {!notif.is_read && (
                  <View className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}
                
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${notif.is_read ? 'bg-gray-50' : 'bg-blue-100/50'}`}>
                  <MaterialCommunityIcons name={getTypeIcon(notif.type)} size={24} color={getIconColor(notif.type)} />
                </View>
                
                <View className="flex-1 justify-center">
                  <Text className={`text-[15px] mb-0.5 ${notif.is_read ? 'text-[#374151] font-semibold' : 'text-[#111827] font-bold'}`}>
                    {notif.title}
                  </Text>
                  <Text className={`text-[13px] leading-tight ${notif.is_read ? 'text-[#6B7280]' : 'text-[#4B5563]'}`}>
                    {notif.message}
                  </Text>
                  <Text className="text-[11px] font-medium text-gray-400 mt-2 uppercase tracking-wide">
                    {timeAgo(notif.created_at)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
