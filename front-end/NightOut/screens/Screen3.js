import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { fetchUserById } from '../functions/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Screen3 = () => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const opciones = [
    { key: 'aviso', text: 'Aviso de privacidad' },
    { key: 'faq', text: 'FAQ' },
    { key: 'cerrar', text: 'Cerrar sesión' },
  ];

  const onOptionPress = async (pOption) => {
    switch(pOption){
      case "cerrar":
        console.log("cerrando sesión...")
        try {
          await AsyncStorage.removeItem('userToken');
          navigation.navigate('Login');
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
        

    }
      
  };

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
    const fetchUserData = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          const usuarioId = await getUserIdByUserToken(userToken); // Await the result
          const data = await fetchUserById(usuarioId);
          setUserData((data));
          console.log(data)
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <Text>Loading...</Text>; // Display a loading message or spinner
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.imageContainer}>
          <Image source={require('../assets/user_icon.png')} style={styles.icon} />
        </View>
        <View style={styles.userDataContainer}>
          <View style={styles.item}>
            <Text style= {styles.boldValue}>{userData.nombre}</Text>
          </View>
          <View style={styles.item}>
            <Text style= {styles.normalValue}>{userData.correo_electronico}</Text>
          </View>
          <View style={styles.item}>
            <Text style= {styles.normalValue}>{userData.num_telefono}</Text>
          </View>
        </View>
      </View>
      {/* Lista de opciones */}
      <FlatList
        data={opciones}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => onOptionPress(item.key)}
          >
            <Text style={styles.optionText}>{item.text}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.key}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  optionItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%', // Ocupa el 100% del ancho
  },
  optionText: {
    fontSize: 18,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EEE',
  },
  imageContainer: {
    flex: 1, // Half of the space
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDataContainer: {
    flex: 2, // The other half of the space
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
    textTransform: 'capitalize', // Capitalize the first letter
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  boldValue: {
    fontSize: 20,
    fontWeight: 'bold', // Make the value bold
    color: '#555',
  },
  normalValue: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    color: '#555',
  },
  icon: {
    width: 100, // Adjust as needed
    height: 100, // Adjust as needed
  },
});

export default Screen3;
