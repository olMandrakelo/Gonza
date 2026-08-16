import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import ChecklistScreen from './src/screens/ChecklistScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import FamilyScreen from './src/screens/FamilyScreen';
import MaterialScreen from './src/screens/MaterialScreen';
import QuizScreen from './src/screens/QuizScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { seedGearIfNeeded } from './src/seedData';
import { ThemeProvider, useTheme } from './src/ui/ThemeContext';
import { TAB_ICONS } from './src/ui/icons';
import { mono } from './src/ui/theme';

const Tab = createBottomTabNavigator();

function Navigation() {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <>
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              height: 62 + insets.bottom,
              paddingTop: 6,
              paddingBottom: 8 + insets.bottom,
            },
            tabBarLabelStyle: {
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            },
            tabBarIcon: ({ color }) => {
              const Icon = TAB_ICONS[route.name];
              return Icon ? <Icon color={color} bg={colors.surface} /> : null;
            },
          })}
        >
          <Tab.Screen name="Equipo" component={ChecklistScreen} />
          <Tab.Screen name="Cursos" component={CoursesScreen} />
          <Tab.Screen name="Práctica" component={QuizScreen} />
          <Tab.Screen name="Material" component={MaterialScreen} />
          <Tab.Screen name="Familia" component={FamilyScreen} />
          <Tab.Screen name="Ajustes" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedGearIfNeeded().finally(() => setReady(true));
  }, []);

  // Seeding must land in AsyncStorage before ChecklistScreen's useStorageList reads it,
  // otherwise it'd read the pre-seed empty list once and never see the seeded items.
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
