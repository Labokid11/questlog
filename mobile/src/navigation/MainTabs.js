import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LibraryScreen from '../screens/LibraryScreen';
import FeedScreen from '../screens/FeedScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminScreen from '../screens/AdminScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7c5cff',
        tabBarInactiveTintColor: '#6b6f93',
        tabBarStyle: { backgroundColor: '#161827', borderTopColor: '#2c3050', paddingBottom: 4 },
      }}
    >
      <Tab.Screen name="Library" component={LibraryScreen} options={{ tabBarLabel: 'Library' }} />
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: 'Activity' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: 'Stats' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      {user?.role === 'admin' && (
        <Tab.Screen name="Admin" component={AdminScreen} options={{ tabBarLabel: 'Admin' }} />
      )}
    </Tab.Navigator>
  );
}
