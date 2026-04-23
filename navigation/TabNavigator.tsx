import React, { Suspense } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FileSliders, Fuel, Search } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { ActivityIndicator, View, Image } from 'react-native';

// Lazy-loaded screens for faster initial load
const TireInspectionScreen = React.lazy(
  () => import('../screens/TireInspectionScreen'),
);
const FuelEntryScreen = React.lazy(
  () => import('../screens/FuelEntryScreen'),
);
const InspectScreen = React.lazy(
  () => import('../screens/InspectScreen'),
);
const DashboardScreen = React.lazy(
  () => import('../screens/DashboardScreen'),
);
const SlipInspectionScreen = React.lazy(
  () => import('../screens/SlipInspectionScreen'),
);

const Tab = createBottomTabNavigator();

const LazyFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FB' }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

// Wrap lazy components in Suspense
const withSuspense = (Component: React.LazyExoticComponent<any>) => {
  const WrappedComponent = (props: any) => (
    <Suspense fallback={<LazyFallback />}>
      <Component {...props} />
    </Suspense>
  );
  return WrappedComponent;
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTitleStyle: {
          color: COLORS.primary,
          fontWeight: 'bold',
        },
        lazy: true,
        freezeOnBlur: true,
      }}
      >
      <Tab.Screen
        name="Dashboard"
        component={withSuspense(DashboardScreen)}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../assets/speedometer.png')} style={{ width: size, height: size, tintColor: color }} />
            
          ),
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Tire Inspection"
        component={withSuspense(TireInspectionScreen)}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={require('../assets/tire.png')} style={{ width: size, height: size, tintColor: color }} />
          ),
          title: 'Tire AI',
          headerShown: false,
        }}
      />
      
      <Tab.Screen
        name="Inspect"
        component={withSuspense(InspectScreen)}
        options={{
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          title: 'Inspect',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Slip"
        component={withSuspense(SlipInspectionScreen)}
        options={{
          tabBarIcon: ({ color, size }) => <FileSliders color={color} size={size} />,
          title: 'Slip',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Fuel Entry"
        component={withSuspense(FuelEntryScreen)}
        options={{
          tabBarIcon: ({ color, size }) => <Fuel color={color} size={size} />,
          title: 'Fuel AI',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

