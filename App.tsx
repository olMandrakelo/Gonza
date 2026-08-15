import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import ChecklistScreen from './src/screens/ChecklistScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import MaterialScreen from './src/screens/MaterialScreen';
import QuizScreen from './src/screens/QuizScreen';
import { colors } from './src/ui/theme';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

const TAB_ICONS: Record<string, string> = {
  Checklist: '🎒',
  Cursos: '📚',
  Material: '📝',
  Simulacros: '❓',
};

export default function App() {
  return (
    <SafeAreaProvider>
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
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
