import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TABS: { name: string; route: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'index',        route: '/',                   icon: 'home-variant-outline',  activeIcon: 'home-variant' },
  { name: 'transactions', route: '/transactions',       icon: 'swap-horizontal',        activeIcon: 'swap-horizontal' },
  { name: 'budgets',      route: '/budgets',            icon: 'chart-pie-outline',      activeIcon: 'chart-pie' },
  { name: 'ai',           route: '/ai',                 icon: 'lifebuoy',               activeIcon: 'lifebuoy' },
];

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.pill}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.route || (tab.route === '/' && pathname === '/index');
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.route as any)}
              style={styles.item}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <MaterialCommunityIcons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? '#2563EB' : '#94A3B8'}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <CustomTabBar />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="budgets" />
      <Tabs.Screen name="ai" />
    </Tabs>
  );
}
