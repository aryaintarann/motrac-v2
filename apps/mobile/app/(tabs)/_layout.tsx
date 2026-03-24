import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={26}
      color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
    />
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
          bottom: 24,
          left: 48,
          right: 48,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#1A1A2E',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        },
        tabBarIconStyle: {
          width: 32,
          height: 32,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          height: 64,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home-variant-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="swap-horizontal" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="chart-pie" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="lifebuoy" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
