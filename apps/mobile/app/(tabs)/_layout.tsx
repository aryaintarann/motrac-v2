import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? 'rgba(255,255,255,0.15)' : 'transparent',
      }}
    >
      <MaterialCommunityIcons
        name={name}
        size={24}
        color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 28,
          left: 40,
          right: 40,
          height: 68,
          borderRadius: 34,
          backgroundColor: '#1A1A2E',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
          paddingHorizontal: 8,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home-variant" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="format-list-bulleted" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="heart-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="dots-grid" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
