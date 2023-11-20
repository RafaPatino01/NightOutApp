import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, RefreshControl } from 'react-native';
import { fetchReservasByUserId, fetchEstablecimientos } from '../functions/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const Screen2 = () => {
  const [reservas, setReservas] = useState([]); // Estado para almacenar las reservas
  const [establecimientos, setEstablecimientos] = useState([]); // Estado para almacenar los establecimientos
  const [establecimientosDict, setEstablecimientosDict] = useState({}); // Estado para almacenar los establecimientos
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const openModalWithItem = (itemId) => {
    setSelectedItemId(itemId);
    setModalVisible(true);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);
  
  
  // Define a function to get the user ID by userToken
  const getUserIdByUserToken = async (userToken) => {
    try {
      const apiUrl = `http://192.168.1.77:3000/get_usuarios/?correo_electronico=${userToken.toLowerCase()}`;
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
      // Coloca las reservas con asistencia = 1 al final
      if (a.asistencia === 1 && b.asistencia !== 1) {
        return 1;
      }
      if (b.asistencia === 1 && a.asistencia !== 1) {
        return -1;
      }
      // Compara por el campo 'confirmado'
      if (a.confirmado > b.confirmado) {
        return -1;
      }
      if (a.confirmado < b.confirmado) {
        return 1;
      }
      // Compara por la fecha si todo lo demás es igual
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


  const getBackgroundColor = (item) => {
    if (item.confirmado === 1 && item.asistencia === 1) {
      return { backgroundColor: '#3db362' };
    }
    if (item.confirmado === 0 && item.asistencia === 0) {
      return { backgroundColor: 'gray' };
    }
    return null;
  };

  const handleItemPress = (item) => {
    if (item.confirmado !== 0 && item.asistencia !== 1) { // Check if the reservation is confirmed
      openModalWithItem(item.id);
    } else {
      console.log("Reservation is not yet confirmed."); // You can also display a warning message to the user here
    }
  };

  const reservaView = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.reservaContainer}>
      <View style={[
        styles.reservaItem,
        getBackgroundColor(item) // Cambia el fondo 
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
            {item.asistencia === 1 ? "(Has asistido)" : ""}
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
      <Modal
  animationType="fade"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => {
    setModalVisible(!modalVisible);
  }}
>
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
    <View style={{ padding: 20, backgroundColor: "white", borderRadius: 10, width: '80%', height: '40%', flexDirection: 'column', justifyContent: 'space-between' }}>
      <View>
        {/*<Text>Reserva ID: {selectedItemId}</Text>*/ }
        <Image source={{ uri: 'http://192.168.1.77:3000/uploads/reservas_qr/qr_'+selectedItemId+'.png' } } style={{ width: "100%", height:220, resizeMode: "contain" }} />
      </View>
      <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: '#5271FF', padding: 10, alignItems: 'center' }}>
        <Text style={{ color: 'white' }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>




<FlatList
  style={styles.flatlist}
  data={reservas}
  keyExtractor={(item) => item.id.toString()}
  renderItem={reservaView}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
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
