import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  List,
  Surface,
  Divider,
} from 'react-native-paper';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Building2,
  ChevronRight,
  Search,
} from 'lucide-react-native';
import theme, { SPACING } from '../constants/theme';
import Animated from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import {
  Login,
  clearLoginState,
} from '../services/globalStorage/rudux/slices/loginSlice';
import { useLoginContext } from '../services/globalStorage/contextApi/loginContext';
import { TireLoader } from '../components/UI/loader';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [search, setSearch] = useState('');

  const dispatch = useDispatch();
  const {
    loggedIn,
    user,
    error,
    requiresCompanySelection,
    companies,
    loading,
  } = useSelector((state: any) => state.login);

  const handleLogin = async (companyId = '', userId = '') => {
    if (!companyId && (!identifier || !password)) {
      return;
    }

    dispatch(
      Login({
        username: identifier,
        password: password,
        companyId: companyId,
        userId: userId,
        captchaToken: '',
      }) as any,
    );
  };

  useEffect(() => {
    if (loggedIn && user && !requiresCompanySelection) {
      navigation.replace('MainTabs');
    }
  }, [loggedIn, user, requiresCompanySelection, navigation]);

  if (requiresCompanySelection) {
    return (
      <View style={[styles.container]}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Animated.Image
              sharedTransitionTag="heroImage"
              source={require('../assets/full-logo.jpeg')}
              style={styles.logoSmall}
            />
            <Text variant="headlineSmall" style={styles.title}>
              Select Company
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Please choose a company to continue
            </Text>
          </View>
          <TextInput
            label="Search Company Name"
            value={search}
            onChangeText={setSearch}
            mode="outlined"
            style={styles.searchInput}
            left={
              <TextInput.Icon
                icon={() => (
                  <Search size={20} color={theme.COLORS.textSecondary} />
                )}
              />
            }
            outlineColor={theme.COLORS.border}
            activeOutlineColor={theme.COLORS.primary}
          />
          {error ? (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              ) : null}

          <FlatList
            data={companies.filter(company =>
              company.companyName.toLowerCase().includes(search.toLowerCase()),
            )}
            keyExtractor={item => item.companyId}
            renderItem={({ item }) => (
              <Surface style={styles.companyItem} elevation={1}>
                <TouchableOpacity
                  onPress={() => handleLogin(item.companyId, item.userId)}
                  style={styles.companyTouch}
                >
                  <View style={styles.companyIcon}>
                    <Building2 size={24} color={theme.COLORS.primary} />
                  </View>
                  <View style={styles.companyInfo}>
                    <Text variant="titleMedium" style={styles.companyName}>
                      {item.companyName}
                    </Text>
                    <Text variant="bodySmall" style={styles.userName}>
                      {item.userName}
                    </Text>
                  </View>
                  <ChevronRight size={20} color={theme.COLORS.textSecondary} />
                </TouchableOpacity>
              </Surface>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={styles.listContent}
          />

          <Button
            mode="text"
            onPress={() => {dispatch(clearLoginState());setSearch('')}}
            style={styles.backButton}
          >
            Back to Login
          </Button>
        </View>
        {
          loading && (
            <View style={styles.loaderContainer}>
              <TireLoader size={30} />
            </View>
          )
        }
      </View>
    );
  }

  return (
    <View style={[styles.container,{paddingTop: theme.SPACING.xxl * 2}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Animated.Image
                sharedTransitionTag="heroImage"
                source={require('../assets/full-logo.jpeg')}
                style={styles.logo}
              />
              <Text variant="bodyLarge" style={styles.subtitle}>
                Precision Fleet Management
              </Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Email / Mobile No / User Id"
                value={identifier}
                onChangeText={setIdentifier}
                mode="outlined"
                style={styles.input}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <User size={20} color={theme.COLORS.textSecondary} />
                    )}
                  />
                }
                outlineColor={theme.COLORS.border}
                activeOutlineColor={theme.COLORS.primary}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                left={
                  <TextInput.Icon
                    icon={() => (
                      <Lock size={20} color={theme.COLORS.textSecondary} />
                    )}
                  />
                }
                right={
                  <TextInput.Icon
                  
                    icon={() =>
                      showPassword ? (
                        <EyeOff
                          size={20}
                          color={theme.COLORS.textSecondary}
                          onPress={() => setShowPassword(false)}
                          style={{padding:SPACING.sm}}
                        />
                      ) : (
                        <Eye
                          size={20}
                          color={theme.COLORS.textSecondary}
                          onPress={() => setShowPassword(true)}
                          style={{padding:SPACING.sm}}
                        />
                      )
                    }
                  />
                }
                outlineColor={theme.COLORS.border}
                activeOutlineColor={theme.COLORS.primary}
              />

              {error ? (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              ) : null}

              <Button
                mode="contained"
                onPress={() => handleLogin()}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                labelStyle={styles.loginButtonLabel}
              >
                Log In
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Footer Branding (Optional, but makes it look premium) */}
      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          Powered by Fleetable AI
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.surface,
  
  },
  searchInput: {
    marginBottom: theme.SPACING.md,
  },
  logo: {
    width: 300,
    resizeMode: 'contain',
  },
  logoSmall: {
    width: 150,
    height: 100,
    resizeMode: 'contain',
    marginBottom: theme.SPACING.md,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.SPACING.xl,
    paddingVertical: theme.SPACING.xxl,
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.SPACING.xl,
  },
  title: {
    fontWeight: 'bold',
    color: theme.COLORS.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: theme.COLORS.textSecondary,
    marginTop: theme.SPACING.xs,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    marginBottom: theme.SPACING.md,
    backgroundColor: theme.COLORS.surface,
  },
  loginButton: {
    marginTop: theme.SPACING.md,
    borderRadius: 12,
    backgroundColor: theme.COLORS.primary,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
    fontSize: theme.SIZES.md,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: theme.SPACING.xl,
    alignItems: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.surfaceOpacity,
    zIndex: 1000,
  },
  footerText: {
    color: theme.COLORS.textSecondary,
    opacity: 0.6,
  },
  listContent: {
    paddingBottom: theme.SPACING.xl,
  },
  companyItem: {
    borderRadius: 12,
    backgroundColor: theme.COLORS.surface,
    overflow: 'hidden',
  },
  companyTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.SPACING.md,
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.COLORS.primary + '15', // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.SPACING.md,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    color: theme.COLORS.text,
    fontWeight: '600',
  },
  userName: {
    color: theme.COLORS.textSecondary,
    marginTop: 2,
  },
  backButton: {
    marginTop: theme.SPACING.md,
  },
});

export default LoginScreen;
