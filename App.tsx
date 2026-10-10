import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { COLORS } from './constants/theme';
import { LoginContextProvider } from './services/globalStorage/contextApi/loginContext';
import { navigationRef } from './navigation/navigationRef';

function App() {
  const isDarkMode = useColorScheme() === 'light';

  return (
    <SafeAreaProvider>
      <LoginContextProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar backgroundColor={isDarkMode ? COLORS.primary : "#000000ff"} barStyle={isDarkMode ? 'light-content' : 'light-content'} />
          <AppNavigator />
        </NavigationContainer>
      </LoginContextProvider>
    </SafeAreaProvider>
  );
}

export default App;
