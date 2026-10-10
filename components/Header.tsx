import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import Animated from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { logout } from '../services/globalStorage/rudux/slices/loginSlice';
import { useNavigation } from '@react-navigation/native';

const Header = React.memo(({ title }: { title: string }) => {
  const insets = useSafeAreaInsets();
  const [loadingLocal, setLoadingLocal] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const handleLogout = useCallback(async () => {
    setLoadingLocal(true);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setLoadingLocal(false) },
        {
          text: 'Logout',
          onPress: () => {
            dispatch(logout());
            setLoadingLocal(false);
            navigation.replace('Login');
          },
        },
      ],
    );
  }, [dispatch, navigation]);

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
        <Animated.Image
          source={require('../assets/full-logo.jpeg')}
          style={styles.logo}
          sharedTransitionTag="heroImage"
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.subTitle}>{loadingLocal ? 'Logging out...' : 'Log out'}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.surface,
    justifyContent: 'space-between',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingBottom: 8,
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
