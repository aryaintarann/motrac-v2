import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TAB_ICONS: Record<string, { icon: IconName; activeIcon: IconName }> = {
  index:        { icon: 'home-variant-outline',  activeIcon: 'home-variant' },
  transactions: { icon: 'swap-horizontal',        activeIcon: 'swap-horizontal' },
  budgets:      { icon: 'chart-pie-outline',      activeIcon: 'chart-pie' },
  ai:           { icon: 'lifebuoy',               activeIcon: 'lifebuoy' },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name] ?? { icon: 'circle-outline', activeIcon: 'circle' };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.item}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                {isFocused && <View style={styles.activeCircle} />}
                <MaterialCommunityIcons
                  name={isFocused ? icons.activeIcon : icons.icon}
                  size={24}
                  color={isFocused ? '#0947D5' : '#898B8E'}
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
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8EFFE',
    top: 2,
    left: 2,
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="budgets" />
      <Tabs.Screen name="ai" />
    </Tabs>
  );
}
