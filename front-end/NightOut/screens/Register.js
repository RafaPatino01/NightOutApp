import React, { useState } from 'react';
import { View, Text, TextInput, Image, ImageBackground, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DatePicker } from '@react-native-community/datetimepicker';

const Register = () => {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [genero, setGenero] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date()); // Initialize with the current date
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [numTelefono, setNumTelefono] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false); // State to control the visibility of the date picker

  const goBack = () => {
    navigation.goBack();
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      // Handle date picker dismissal if needed
    } else {
      setFechaNacimiento(selectedDate);
      setShowDatePicker(false); // Hide the date picker after selecting a date
    }
  };

  const selectGenero = (selectedGenero) => {
    setGenero(selectedGenero);
  };

  return (
    <ImageBackground
      source={require('../img/background.png')}
      style={styles.background}
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
                  genero === 'Hombre' && styles.selectedGenero,
                ]}
                onPress={() => selectGenero('Hombre')}
              >
                <Text style={styles.generoButtonText}>Hombre</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.generoButton,
                  genero === 'Mujer' && styles.selectedGenero,
                ]}
                onPress={() => selectGenero('Mujer')}
              >
                <Text style={styles.generoButtonText}>Mujer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.generoButton,
                  genero === 'No binario' && styles.selectedGenero,
                ]}
                onPress={() => selectGenero('No binario')}
              >
                <Text style={styles.generoButtonText}>No binario</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.texto1}>Fecha de Nacimiento:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.input}>{fechaNacimiento.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          {/* Date picker */}
          {showDatePicker && (
            <DatePicker
              value={fechaNacimiento}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

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
              onChangeText={(text) => setNumTelefono(text)}
              value={numTelefono}
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
      </ScrollView>
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
    marginBottom: 80,
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
