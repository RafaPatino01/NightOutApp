import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { fetchReservasByUserId, fetchEstablecimientos } from '../functions/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const Screen2 = () => {
  const [reservas, setReservas] = useState([]); // Estado para almacenar las reservas
  const [establecimientos, setEstablecimientos] = useState([]); // Estado para almacenar los establecimientos
  const [establecimientosDict, setEstablecimientosDict] = useState({}); // Estado para almacenar los establecimientos

  // Define a function to get the user ID by userToken
  const getUserIdByUserToken = async (userToken) => {
    try {
      const apiUrl = `http://192.168.100.11:3000/get_usuarios/?correo_electronico=${userToken.toLowerCase()}`;
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

  const sortReservas = (data) => {
    const sortedReservas = [...data];
    sortedReservas.sort((a, b) => {
      if (a.confirmado > b.confirmado) {
        return -1;
      }
      if (a.confirmado < b.confirmado) {
        return 1;
      }
      return new Date(b.fecha_hora) - new Date(a.fecha_hora);
    });
    return sortedReservas;
  };

  const fetchData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        const userId = await getUserIdByUserToken(userToken);
        console.log('UserID:', userId);
        const reservasData = await fetchReservasByUserId(userId);
        console.log('Reservas:', reservasData);
        // Carga los establecimientos al mismo tiempo
        const sortedReservas = sortReservas(reservasData);
        setReservas(sortedReservas);

        loadEstablecimientos()
      } else {
        console.log('userToken no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener el ID del usuario o las reservas:', error);
    }
  };


  // Define una función para cargar los datos de los establecimientos
  const loadEstablecimientos = async () => {
    try {
      const establecimientosData = await fetchEstablecimientos();
      setEstablecimientos(establecimientosData); // Actualiza el estado con los establecimientos obtenidos
  
      // Realiza el procesamiento después de que los establecimientos se hayan cargado
      let temp = {};
      establecimientosData.forEach((element) => {
        temp[element.id] = element;
      });
      console.log('Establecimientos cargados con éxito.');
      setEstablecimientosDict(temp)
    } catch (error) {
      console.error('Error al cargar los establecimientos:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData(); // Llama a fetchData cada vez que se enfoca en el componente
    }, [])
  );

  function formatToDayMonthYear(dateString) {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // Array con los nombres de los meses en español y en mayúsculas
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Pad the day with a leading zero if needed
    const formattedDay = day < 10 ? `0${day}` : day;

    // Obtén el nombre del mes en español y en mayúsculas
    const formattedMonth = meses[month];

    return `${formattedDay} de ${formattedMonth}`;
}

  const handleItemPress = (item) => {
    console.log("aaaaa" + item.fecha_hora)
  };

  const reservaView = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.reservaContainer}>
      <View style={[
        styles.reservaItem,
        item.confirmado === 0 ? { backgroundColor: 'gray' } : null // Cambia el fondo si no está confirmada
      ]}>
        <View style={styles.row}>
          <Text style={styles.text}>
            {establecimientosDict[item.establecimiento_id] ? establecimientosDict[item.establecimiento_id]["nombre"] : ""}
          </Text>
          <Text style={styles.textSmall}>{item.tipo_de_mesa}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.text_invisible}>
            {item.confirmado === 0 ? "(Por confirmar)" : ""}
          </Text>
          <Text style={styles.text}>
            {formatToDayMonthYear(item.fecha_hora)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.flatlist}
        data={reservas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={reservaView}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text_invisible: {
    fontSize: 15,
    fontWeight: 'bold',
    padding: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    color: "white",
  },
  textSmall: {
    fontSize: 15,
    color: "white",
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  flatlist: {
    width: '100%',
  },
  reservaContainer: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: 'center',
  },
  reservaItem: {
    backgroundColor: "#5271FF",
    padding: 10,
    width: "90%",
    borderRadius: 20,
  },
  row: {
    flexDirection: 'row', // Arrange children in a row
    justifyContent: 'space-between', // Align items along the row's main axis (horizontal in this case)
  },
});

export default Screen2;
