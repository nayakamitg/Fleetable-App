import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import Animated from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { logout, setUser } from '../services/globalStorage/rudux/slices/loginSlice';
import { useNavigation } from '@react-navigation/native';
import { useLoginContext } from '../services/globalStorage/contextApi/loginContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Header = React.memo(({ title }: { title: string }) => {
  const [loadingLocal, setLoadingLocal] = useState(false);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const {user,loggedIn}=useLoginContext()


    useEffect(() => {
      const checkLogin = async () => {
        const token = await AsyncStorage.getItem('token');
        const userCredentials = await AsyncStorage.getItem('user_credentials');
        const loggedIn = await AsyncStorage.getItem('user_logged_in');
        if(token && userCredentials && loggedIn){
          dispatch(setUser(JSON.parse(userCredentials)));
        }
        else{
          dispatch(logout());
          navigation.replace('Login');
        }
      }
      checkLogin();
    }, []);


  const handleLogout = useCallback(async () => {
    setLoadingLocal(true);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setLoadingLocal(false) },
        { text: 'Logout', onPress: () => {dispatch(logout()); setLoadingLocal(false); navigation.replace('Login');} },
      ],
    )
  }, [dispatch, navigation]);
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}><Animated.Image source={require('../assets/full-logo.jpeg')} style={styles.logo} sharedTransitionTag="heroImage" /></TouchableOpacity>
      <TouchableOpacity  onPress={handleLogout}><Text style={styles.subTitle}>{loadingLocal ? 'Logging out...' : 'Log out'}</Text></TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  logo: {
    height: 60,
    width: 160,
    marginTop: 5,
    resizeMode: 'contain',
  },
});

export default Header;
