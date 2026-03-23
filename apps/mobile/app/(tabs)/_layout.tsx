import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: '#1A6FD6',
      tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 10, borderTopColor: '#f3f4f6' }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: () => <Text className="text-lg">🏠</Text> 
        }} 
      />
      <Tabs.Screen 
        name="transactions" 
        options={{ 
          title: 'Transactions', 
          tabBarIcon: () => <Text className="text-lg">📝</Text> 
        }} 
      />
      <Tabs.Screen 
        name="budgets" 
        options={{ 
          title: 'Budgets', 
          tabBarIcon: () => <Text className="text-lg">📊</Text> 
        }} 
      />
      <Tabs.Screen 
        name="ai" 
        options={{ 
          title: 'AI Advisor', 
          tabBarIcon: () => <Text className="text-lg">✨</Text> 
        }} 
      />
    </Tabs>
  );
}
