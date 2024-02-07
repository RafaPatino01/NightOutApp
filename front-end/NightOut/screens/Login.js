import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { handleLogin } from '../functions/functions'; // Import the handleLogin function
import AsyncStorage from '@react-native-async-storage/async-storage'

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Save session when the user logs in
  const saveSession = async (userToken) => {
    try {
      await AsyncStorage.setItem('userToken', userToken);
      console.log('Session saved successfully.');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  // Retrieve session when needed (e.g., when the app starts)
  const retrieveSession = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken !== null) {
        // User is logged in, you can proceed accordingly
        console.log('User is logged in with token:', userToken);
      } else {
        // User is not logged in, take appropriate action
        console.log('User is not logged in.');
      }
    } catch (error) {
      console.error('Error retrieving session:', error);
    }
  };

  const handleLoginPress = async () => {
    // Call the imported handleLogin function
    if(await handleLogin(email, password)){
      navigation.navigate('Home');
      saveSession(email)
    };
  };

  const handleRegister = () => {
    // Call the imported handleLogin function
    navigation.navigate('Register');
  };

  const checkSession = async () => {
    try {
      // Check if the user token exists in AsyncStorage
      const userToken = await AsyncStorage.getItem('userToken');

      if (userToken) {
        // User is logged in, navigate to the Home page
        navigation.navigate('Home');
      } 
      
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  useEffect(() => {
    // Call the checkSession function when the component mounts
    checkSession();
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../img/background.jpeg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image source={require('../img/logo-dark.png')} style={styles.logo} />
        
        <Text style={styles.texto1}>Regístrate y lleva tu experiencia de fiesta a otro nivel.</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario (teléfono)"
          keyboardType="numeric"
          onChangeText={(text) => setEmail(text.replace(/\D/g, ''))}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry // This hides the input text for passwords
        />
        <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button1}
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>REGISTRO</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.button2}
              onPress={handleLoginPress}
            >
              <Text style={styles.buttonText}>INGRESA</Text>
            </TouchableOpacity>
        </View>
        
    
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  texto1: {
    color: 'white',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'start',
    paddingTop: 140,
    paddingStart: '10%',
    width: '90%',
  },
  logo: {
    width: 300,
    height: 94,
    marginBottom: 20,
  },
  input: {
    textAlign: 'right',
    width: '100%',
    height: 40,
    borderColor: 'rgba(255, 255, 255, 0)',
    borderWidth: 1,
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
  },
  button1: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Change the background color as desired
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginEnd: 30,
  },
  button2: {
    backgroundColor: 'rgba(82, 113, 255, 0.8)', // Change the background color as desired
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontStyle: 'italic',
    fontSize: 16
  },
});

export default Login;
