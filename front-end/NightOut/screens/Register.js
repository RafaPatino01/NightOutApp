import React, { useState } from 'react';
import {
  View,
  Linking,
  Text,
  TextInput,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { registerUser } from '../functions/functions';

const Register = () => {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [genero, setGenero] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [numTelefono, setNumTelefono] = useState('');

  const goBack = async () => {
    // Validación de campos requeridos incluida
    if (!nombre || !apellido || !genero || !contrasena || !email || !confirmarContrasena) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    // Nueva validación de contraseña
    if (contrasena.length < 7 || !/\d/.test(contrasena)) {
      alert('La contraseña debe tener más de 6 caracteres y contener al menos un número.');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const userData = {
      nombre,
      apellido,
      genero,
      fechaNacimiento: '2004-12-05',
      correoElectronico: email,
      contrasena,
      reservasActivas: 0,
      reservasPrevias: 0,
      numTelefono,
    };

    registerUser(userData);
    navigation.goBack();
  };
  
  const selectGenero = (selectedGenero) => {
    setGenero(selectedGenero);
  };

  return (
    <ImageBackground
        source={require('../img/background.jpeg')}
        style={styles.background}
      >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Image source={require('../img/logo-dark.png')} style={styles.logo} />
            
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
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.texto1}>Número telefónico:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Número de Teléfono"
                onChangeText={(text) => {
                  const filteredText = text.replace(/\D/g, '');
                  const limitedText = filteredText.substring(0, 10);
                  setEmail(limitedText);
                }}
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
              <Text style={styles.texto1}>Confirmar Contraseña:</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirmar Contraseña"
                onChangeText={setConfirmarContrasena}
                value={confirmarContrasena}
                secureTextEntry // Oculta el texto de entrada
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
          <Text style={styles.baseText}>
              Al registrarte, confirmas que eres mayor de 18 años y estás de acuerdo con{' '}
          </Text>
          <Text
            style={styles.linkText}
            onPress={() => Linking.openURL('https://nightout.com.mx/NightOutTerms.pdf')}
          >
            Términos de uso
          </Text>
          <Text
            style={styles.linkText2}
            onPress={() => Linking.openURL('https://nightout.com.mx/NightOutPrivacy.pdf')}
          >
            Política de privacidad
          </Text>
              
          


      </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
    
  );
};

const styles = StyleSheet.create({
  baseText: {
    padding: 30,
    color: "white",
    fontSize: 16,
    // Add your text styling here
  },
  linkText: {
    marginBottom: 20,
    paddingHorizontal: 30,
    color: 'lightblue',
    textDecorationLine: 'underline',
  },
  linkText2: {
    marginBottom: 90,
    paddingHorizontal: 30,
    color: 'lightblue',
    textDecorationLine: 'underline',
  },
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
    height: 94,
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
