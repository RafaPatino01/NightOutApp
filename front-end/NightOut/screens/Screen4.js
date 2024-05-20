import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchUserById } from '../functions/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/FontAwesome';  // Make sure to import the Icon component

const Screen4 = () => {
  const [userData, setUserData] = useState(null);

  const getUserIdByUserToken = async (userToken) => {
    try {
      const apiUrl = `https://nightout.com.mx/api/get_usuarios/?correo_electronico=${userToken.toLowerCase()}`;
      const response = await fetch(apiUrl);
      if (response.status === 200) {
        const userData = await response.json();
        const userId = userData[0].id;
        return userId;
      } else {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al obtener el ID del usuario:', error);
      throw error;
    }
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        console.log("Attempting to fetch userToken...");
        const userToken = await AsyncStorage.getItem('userToken');
        console.log("UserToken:", userToken);
        if (userToken) {
          console.log("Fetching userId by userToken...");
          const usuarioId = await getUserIdByUserToken(userToken);
          console.log("UsuarioId:", usuarioId);
          const data = await fetchUserById(usuarioId);
          console.log("Fetched data:", data);
          setUserData(data);
          console.log("Fetched puntos...");
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }, 5000);
  
    return () => {
      console.log("Clearing interval...");
      clearInterval(intervalId);
    };
  }, []);
  

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.text_container}>
        <Text style={styles.text0}>Cuentas con:</Text>
        <Text style={styles.text}>
          <Icon name="gift" size={36} color="white" /> {userData.total_puntos} 
        </Text>
      </View>
      
      <View style={styles.qr}>
        <QRCode
          value={`${userData.id}nightout_puntos`}
          size={200}
          color="black"
          backgroundColor="transparent"
        />
      </View>
      <View style={styles.text_container2}>
        <Text style={styles.text2}>
          ¡Muestra tu QR en el establecimiento para utilizar tus puntos!
        </Text>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  text_container: {
    marginTop: 50,
    padding: 20,
    width: "80%",
    borderWidth: 10,
    borderColor: '#5271FF',
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: "#5271FF",
    color: "white"
  },
  text_container2: {
    marginTop: 30,
    padding: 10,
    width: "80%",
    borderWidth: 10,
    borderColor: '#5271FF',
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  text2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "black",
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "white",
  },
  text0: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "white"
  },
  text: {
    marginTop: 15,
    fontSize: 40,
    fontWeight: 'bold',
    color: "white"
  },
  qr: {
    marginTop: 30,
    padding: 10,
    borderWidth: 10,
    borderColor: '#5271FF',
    borderRadius: 30,
  },
});

export default Screen4;
