import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import ChecklistScreen from './src/screens/ChecklistScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import MaterialScreen from './src/screens/MaterialScreen';
import QuizScreen from './src/screens/QuizScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/ui/ThemeContext';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Checklist: '🎒',
  Cursos: '📚',
  Material: '📝',
  Simulacros: '❓',
  Ajustes: '⚙️',
};

function Navigation() {
  const { colors, scheme } = useTheme();
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
            tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
            tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>,
          })}
        >
          <Tab.Screen name="Checklist" component={ChecklistScreen} />
          <Tab.Screen name="Cursos" component={CoursesScreen} />
          <Tab.Screen name="Material" component={MaterialScreen} />
          <Tab.Screen name="Simulacros" component={QuizScreen} />
          <Tab.Screen name="Ajustes" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Navigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
