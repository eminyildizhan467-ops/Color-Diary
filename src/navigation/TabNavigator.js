import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ColorMapScreen from '../screens/ColorMapScreen';
import MixtureScreen from '../screens/MixtureScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // iOS style tab bar
        tabBarStyle: {
          backgroundColor: Colors.systemBackground,
          borderTopColor: Colors.separator,
          borderTopWidth: 0.5,
          height: 90, // iOS tab bar height
          paddingBottom: 20, // Safe area padding
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.systemBlue,
        tabBarInactiveTintColor: Colors.systemGray,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Map':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Mixture':
              iconName = focused ? 'color-palette' : 'color-palette-outline';
              break;
            case 'Analysis':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // iOS style headers
        headerStyle: {
          backgroundColor: Colors.systemBackground,
          borderBottomColor: Colors.separator,
          borderBottomWidth: 0.5,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
        },
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
          color: Colors.label,
        },
        headerTintColor: Colors.systemBlue,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerTitle: 'Color Diary',
          headerLargeTitle: true, // iOS large title style
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={ColorMapScreen}
        options={{
          headerTitle: 'Color Map',
        }}
      />
      <Tab.Screen 
        name="Mixture" 
        component={MixtureScreen}
        options={{
          headerTitle: 'Color Mixture',
        }}
      />
      <Tab.Screen 
        name="Analysis" 
        component={AnalysisScreen}
        options={{
          headerTitle: 'Mood Analysis',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;


