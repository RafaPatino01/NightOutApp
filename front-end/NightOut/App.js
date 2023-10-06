import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';

import Screen1 from './screens/Screen1';
import Screen2 from './screens/Screen2';
import Screen3 from './screens/Screen3';
import Screen4 from './screens/Screen4';
import Screen5 from './screens/Screen5';

import DetalleEstablecimiento from './screens/DetalleEstablecimiento';
import Login from './screens/Login';
import Register from './screens/Register';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Home() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let iconSize = 30; // Cambia el tamaño del ícono aquí
          let iconPadding = 5; // Add padding to the top of the icon here

          if (route.name === 'Screen5') {
            iconName = 'card-search';
          } else if (route.name === 'Screen1') {
            iconName = 'home';
          } else if (route.name === 'Screen2') {
            iconName = 'calendar-check'; 
          } else if (route.name === 'Screen3') {
            iconName = 'account-circle'; 
          }
          
          return (
            <MaterialCommunityIcons
              name={iconName}
              size={iconSize}
              color={color}
              style={{ paddingTop: iconPadding }} // Add padding to the top of the icon
            />
          )
        },
        tabBarLabel: '', // Esto quita el texto debajo del ícono
        tabBarActiveTintColor: '#5271FF', // Color del ícono activo
        tabBarInactiveTintColor: 'gray', // Color del ícono inactivo
        tabBarLabelStyle: {
          fontSize: 12, // Tamaño de la etiqueta (texto debajo del ícono)
          fontWeight: 'bold', // Peso de la etiqueta (opcional)
        },
        tabBarStyle: {
          backgroundColor: 'white', // Color de fondo de la barra
        },
      })}
    >
      
      <Tab.Screen options={{ headerShown: false }} name="Screen1" component={Screen1} />
      <Tab.Screen name="Screen2" component={Screen2} />
      <Tab.Screen name="Screen5" component={Screen5} />
      <Tab.Screen name="Screen3" component={Screen3} />
      

    </Tab.Navigator>
  );
}

function App() {

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>

          <Stack.Screen 
            name="Login" 
            options={{ headerShown: false }}
            component={Login} />

          <Stack.Screen 
            name="Register" 
            options={{ headerShown: false }}
            component={Register} />

          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              headerShown: false,
              gestureEnabled: false, // Disable the back gesture
              gestureDirection: 'horizontal', // Optional, specify the gesture direction
            }}
          />

          <Stack.Screen name="Screen4" component={Screen4} />

          <Stack.Screen 
            options={{ headerShown: true }} 
            name="DetalleEstablecimiento" 
            component={DetalleEstablecimiento} 
          />

        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
