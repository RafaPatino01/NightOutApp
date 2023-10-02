import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { handleLogin } from '../functions/functions'; // Import the handleLogin function

const Login = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = () => {
    // Call the imported handleLogin function
    handleLogin(email, password, navigation);
  };

  const handleRegister = () => {
    // Call the imported handleLogin function
    navigation.navigate('Register');
  };

  return (
    <ImageBackground
      source={require('../img/background.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image source={require('../img/logo.png')} style={styles.logo} />
        
        <Text style={styles.texto1}>Regístrate y lleva tu experiencia de fiesta a otro nivel.</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo / Usuario"
          onChangeText={(text) => setEmail(text)}
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
    height: 150,
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
