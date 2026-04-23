import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native-paper';
import theme from '../constants/theme';
import Animated from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { logout } from '../services/globalStorage/rudux/slices/loginSlice';

const SplashScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    dispatch(logout());
  };

  // useEffect(() => {
  //   handleLogout();
  // }, []);



  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const timestamp = await AsyncStorage.getItem('login_timestamp');
        const userLogged = await AsyncStorage.getItem('user_logged_in');

        // Check if session is valid (5 days)
        const fiveDaysInMs = 20 * 24 * 60 * 60 * 1000;
        const isSessionValid =
          token &&
          timestamp &&
          userLogged === 'true' &&
          Date.now() - parseInt(timestamp, 10) < fiveDaysInMs;

        // Simulate a short delay for splash effect
        setTimeout(() => {
          if (isSessionValid) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('Login');
          }
        }, 1500);
      } catch (error) {
        console.error('Error checking login status:', error);
        navigation.replace('Login');
      }
    };

    checkLoginStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.Image
          sharedTransitionTag="heroImage"
          source={require('../assets/full-logo.jpeg')}
          style={styles.logo}
        />
        <Text variant="headlineSmall" style={styles.title}>
          Fleetable
        </Text>
      </View>
      <ActivityIndicator
        size="large"
        color={theme.COLORS.primary}
        style={styles.loader}
      />
      <Text variant="bodySmall" style={styles.footerText}>
        Precision Fleet Management
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 10,
    fontWeight: 'bold',
    color: theme.COLORS.primary,
  },
  loader: {
    marginTop: 20,
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    color: theme.COLORS.textSecondary,
    letterSpacing: 1,
  },
});

export default SplashScreen;
