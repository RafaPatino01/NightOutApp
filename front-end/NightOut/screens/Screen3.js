import React, { useState, useEffect } from 'react';
import base64 from 'react-native-base64'
import {
  Linking,
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { fetchUserById } from '../functions/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Screen3 = () => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const opciones = [
    { key: 'puntos', text: '🎁 Mis puntos' },
    { key: 'aviso', text: '🔒 Aviso de privacidad' },
    { key: 'eliminar', text: '🗑️ Eliminar cuenta' },
    { key: 'change', text: '🔑 Cambiar contraseña' },
    { key: 'faq', text: '🤔 FAQ' },
    { key: 'cerrar', text: '⬅️ Cerrar sesión' },
  ];

  const showDeleteConfirmation = async () => {
    // Obtain the user ID from storage or context
    const userToken = await AsyncStorage.getItem('userToken');
    const userId = await getUserIdByUserToken(userToken); // Assuming this function exists and works as intended
    Alert.alert(
      "Eliminar Cuenta", // Alert Title
      "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.", // Alert message
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { text: "Eliminar", onPress: async () => {
            deleteUser(userId);
            await AsyncStorage.removeItem('userToken');
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  function deleteUser(userId) {
    // Send a DELETE request to delete the user
    fetch(`https://nightout.com.mx/api/delete_usuario/${userId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            // Handle success (e.g., show a success message)
            console.log('User deleted successfully');
            // Optionally, you can redirect to a different page or update the UI here.
        } else {
            // Handle errors (e.g., show an error message)
            console.error('Failed to delete user');
        }
    })
    .catch(error => {
        // Handle network errors
        console.error('Network error:', error);
    });
  }

  const onOptionPress = async (pOption) => {
    switch(pOption){
      case "puntos":
        navigation.navigate("Mis Puntos");
        
        break;

      case "change":
        console.log("cambiando contraseña...");
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          const userId = await getUserIdByUserToken(userToken); // Assuming this function retrieves the correct ID
          
          // Encode the userId in Base64
          const encodedUserId = base64.encode(String(userId));
          
          // Construct the URL with the encoded userId parameter
          const resetPasswordUrl = `https://nightout.com.mx/web-admin/reset_password.html?userId=${encodedUserId}`;
          
          // Open the URL in the device's default browser
          Linking.openURL(resetPasswordUrl);
        } catch (error) {
          console.error('Error al cambiar contraseña:', error);
        }
        break;


      case "eliminar":
        console.log("eliminando cuenta...")
        try {

          showDeleteConfirmation();

        } catch (error) {
          console.error('Error al eliminar cuenta:', error);
        }
        break;

      case "cerrar":
        console.log("cerrando sesión...")
        try {
          await AsyncStorage.removeItem('userToken');
          navigation.navigate('Login');
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
        }
        break;

      case "faq":
        Linking.openURL('https://nightout.com.mx/#FAQ');
        break;

      case "aviso":
        Linking.openURL('https://nightout.com.mx/NightOutPrivacy.pdf');
        break;
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
          console.log(usuarioId)
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
            <Text style= {styles.boldValue}>{userData.nombre} {userData.apellido}</Text>
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
