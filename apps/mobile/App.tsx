import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <View className="h-8 w-8 rounded-lg bg-[#1A6FD6] items-center justify-center">
            <Text className="text-white font-bold text-lg">M</Text>
          </View>
          <Text className="ml-3 text-xl font-bold text-[#1A6FD6]">Motrac</Text>
        </View>
        <View className="h-8 w-8 rounded-full bg-gray-200" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Total Balance Card */}
        <View className="bg-[#1A6FD6] rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-white/80 font-medium text-sm">Total Balance</Text>
          <Text className="text-white font-bold text-3xl mt-2 tracking-tight">Rp 12.500.000</Text>
          
          <View className="flex-row justify-between mt-6 pt-4 border-t border-white/20">
            <View>
              <Text className="text-white/70 text-xs">BCA</Text>
              <Text className="text-white font-semibold text-sm">Rp 10M</Text>
            </View>
            <View>
              <Text className="text-white/70 text-xs">GoPay</Text>
              <Text className="text-white font-semibold text-sm">Rp 2M</Text>
            </View>
            <View>
              <Text className="text-white/70 text-xs">Cash</Text>
              <Text className="text-white font-semibold text-sm">Rp 500k</Text>
            </View>
          </View>
        </View>

        {/* AI Pacing Widget */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-medium text-[#333333]">Safe-to-Spend</Text>
            <View className="bg-green-100 px-2 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-semibold">Good</Text>
            </View>
          </View>
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-2xl font-bold text-[#333333] tracking-tight">Rp 850.000</Text>
              <Text className="text-gray-500 text-sm mt-1">60% remaining</Text>
            </View>
            <View className="h-10 w-10 rounded-full border-4 border-green-500" />
          </View>
        </View>

        {/* Quick Add Templates */}
        <Text className="font-medium text-[#333333] mb-4">Quick Add</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 overflow-visible">
          {['☕ Coffee', '⛽ Gas', '🍱 Lunch', '🛵 Gojek'].map((t, idx) => (
            <TouchableOpacity key={idx} className="bg-white border border-gray-100 rounded-xl px-5 py-4 mr-3 items-center w-24 shadow-sm">
              <Text className="text-2xl mb-2">{t.split(' ')[0]}</Text>
              <Text className="text-[#333333] font-medium text-xs">{t.split(' ')[1]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Transactions */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-medium text-[#333333]">Recent</Text>
          <Text className="text-[#1A6FD6] text-sm font-medium">View All</Text>
        </View>
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {[
            { id: 1, title: 'Starbucks', amount: '-Rp 55.000', account: 'GoPay', date: 'Today' },
            { id: 2, title: 'Salary', amount: '+Rp 15.000.000', account: 'BCA', date: 'Yesterday' },
          ].map((txn, idx) => (
            <View key={txn.id} className={`flex-row justify-between items-center py-3 ${idx !== 0 ? 'border-t border-gray-100' : ''}`}>
              <View>
                <Text className="font-medium text-[#333333] mb-1">{txn.title}</Text>
                <Text className="text-gray-500 text-xs">{txn.account} • {txn.date}</Text>
              </View>
              <Text className={`font-medium ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-[#333333]'}`}>
                {txn.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View className="flex-row justify-around items-center bg-white border-t border-gray-100 pt-4 pb-8 absolute bottom-0 w-full">
        <TouchableOpacity className="items-center">
          <Text className="text-[#1A6FD6] text-xs font-medium mt-1">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-gray-400 text-xs font-medium mt-1">Accounts</Text>
        </TouchableOpacity>
        <View className="relative -mt-8 items-center justify-center">
          <TouchableOpacity className="bg-[#1A6FD6] h-14 w-14 rounded-full items-center justify-center shadow-lg shadow-blue-200">
            <Text className="text-white text-3xl font-light -mt-1">+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="items-center">
          <Text className="text-gray-400 text-xs font-medium mt-1">Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-gray-400 text-xs font-medium mt-1">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
});
