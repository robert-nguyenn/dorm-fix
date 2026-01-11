import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import CreateTicketScreen from './src/screens/CreateTicketScreen';
import TicketDetailScreen from './src/screens/TicketDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'DormFix - My Tickets' }}
        />
        <Stack.Screen 
          name="CreateTicket" 
          component={CreateTicketScreen}
          options={{ title: 'Submit Maintenance Ticket' }}
        />
        <Stack.Screen 
          name="TicketDetail" 
          component={TicketDetailScreen}
          options={{ title: 'Ticket Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
