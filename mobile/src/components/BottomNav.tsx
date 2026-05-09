import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const items = [
  { label: 'Home', icon: 'home', route: '/dashboard' },
  { label: 'Weight', icon: 'scale-bathroom', route: '/weight' },
  { label: 'Activity', icon: 'run', route: '/activity' },
  { label: 'Progress', icon: 'chart-line', route: '/progress' },
  { label: 'Profile', icon: 'account', route: '/profile' },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {items.map((item) => {
        const active = pathname === item.route;

        return (
          <Pressable
            key={item.route}
            style={styles.navItem}
            onPress={() => {
              if (!active) router.replace(item.route as any);
            }}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color={active ? '#06b6d4' : '#94a3b8'}
            />
            <Text style={[styles.navText, active && styles.navTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 78,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  navTextActive: {
    color: '#06b6d4',
  },
});