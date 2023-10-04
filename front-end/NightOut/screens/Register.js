import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView, // Add this import
  Platform, // Add this import for cross-platform behavior
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerUser } from '../functions/functions'; // Import the handleLogin function

const Register = () => {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [genero, setGenero] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [numTelefono, setNumTelefono] = useState('');

  const goBack = async () => {
    // Check if all required fields are filled
    if (!nombre || !apellido || !genero || !email || !contrasena || !numTelefono) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }
  
    // Validate the email format using a regular expression
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, ingrese un correo electrónico válido.');
      return;
    }
  
    // Create an object with user data
    const userData = {
      nombre: nombre,
      apellido: apellido,
      genero: genero,
      fechaNacimiento: '2004-12-05', // Establecer una fecha fija
      correoElectronico: email.toLowerCase(),
      redesSociales: '', // Puedes agregar este campo si lo necesitas
      contrasena: contrasena,
      reservasActivas: 0, // Puedes establecer estos valores según tus necesidades
      reservasPrevias: 0,
      numTelefono: numTelefono,
    };
  
    // Enviar el objeto de datos del usuario a la función de registro (si es necesario)
    registerUser(userData);
  
    // Navegar hacia atrás
    navigation.goBack();
  };
  

  // Add this function to your component
  const handleNumTelefonoChange = (text) => {
    // Use a regular expression to remove any non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    setNumTelefono(numericText);
  };

  const selectGenero = (selectedGenero) => {
    setGenero(selectedGenero);
  };

  return (
    <ImageBackground
        source={require('../img/background.png')}
        style={styles.background}
      >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Image source={require('../img/logo.png')} style={styles.logo} />
            
            <Text style={styles.texto2}>Registra tus datos</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.texto1}>Nombre:</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                onChangeText={(text) => setNombre(text)}
                value={nombre}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.texto1}>Apellido:</Text>
              <TextInput
                style={styles.input}
                placeholder="Apellido"
                onChangeText={(text) => setApellido(text)}
                value={apellido}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.texto1}>Género:</Text>
              <View style={styles.generoButtons}>
                <TouchableOpacity
                  style={[
                    styles.generoButton,
                    genero === 'H' && styles.selectedGenero,
                  ]}
                  onPress={() => selectGenero('H')}
                >
                  <Text style={styles.generoButtonText}>Hombre</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.generoButton,
                    genero === 'M' && styles.selectedGenero,
                  ]}
                  onPress={() => selectGenero('M')}
                >
                  <Text style={styles.generoButtonText}>Mujer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.generoButton,
                    genero === 'X' && styles.selectedGenero,
                  ]}
                  onPress={() => selectGenero('X')}
                >
                  <Text style={styles.generoButtonText}>No binario</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.texto1}>Email:</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={(text) => setEmail(text)}
                value={email}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.texto1}>Contraseña:</Text>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                onChangeText={(text) => setContrasena(text)}
                value={contrasena}
                secureTextEntry // This hides the input text for passwords
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.texto1}>Número de Teléfono:</Text>
              <TextInput
                style={styles.input}
                placeholder="Número de Teléfono"
                onChangeText={handleNumTelefonoChange} // Update this line
                value={numTelefono}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button1}
              onPress={goBack}
            >
              <Text style={styles.buttonText}>REGISTRARME</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.buttonText2}>Al registrarte, confirmas que eres mayor de 18 años.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
    
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
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
  texto1: {
    color: 'white',
  },
  texto2: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
    width: '100%',
  },
  input: {
    textAlign: 'right',
    width: '100%',
    height: 40,
    borderColor: 'rgba(255, 255, 255, 0)',
    borderWidth: 1,
    marginTop: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginEnd: 30,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontStyle: 'italic',
    fontSize: 16,
    marginBottom: 20,
  },
  buttonText2: {
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
    marginBottom: 80,
  },
  generoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  generoButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'white',
    alignItems: 'center',
  },
  selectedGenero: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  generoButtonText: {
    color: 'white',
  },
});

export default Register;
