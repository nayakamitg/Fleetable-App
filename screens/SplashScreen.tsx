import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native-paper';
import theme from '../constants/theme';
import Animated from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { logout, setUser } from '../services/globalStorage/rudux/slices/loginSlice';

// Session validity: 20 days in milliseconds
const SESSION_VALIDITY_MS = 20 * 24 * 60 * 60 * 1000;

const SplashScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [token, userCredentialsRaw, userLogged, timestampRaw] =
          await AsyncStorage.multiGet([
            'token',
            'user_credentials',
            'user_logged_in',
            'login_timestamp',
          ]);

        const tokenVal        = token[1];
        const userCredentials = userCredentialsRaw[1];
        const isLogged        = userLogged[1] === 'true';
        const timestamp       = timestampRaw[1] ? parseInt(timestampRaw[1], 10) : 0;

        const isSessionValid =
          !!tokenVal &&
          !!userCredentials &&
          isLogged &&
          Date.now() - timestamp < SESSION_VALIDITY_MS;

        setTimeout(() => {
          if (isSessionValid) {
            // Restore full user object into Redux so all screens have user data
            const parsedUser = JSON.parse(userCredentials!);
            dispatch(setUser(parsedUser));
            navigation.replace('MainTabs');
          } else {
            // Session expired or missing — clear stale data and go to Login
            dispatch(logout());
            navigation.replace('Login');
          }
        }, 1500);
      } catch (error) {
        console.error('Error restoring session:', error);
        dispatch(logout());
        navigation.replace('Login');
      }
    };

    restoreSession();
  }, [navigation, dispatch]);

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
