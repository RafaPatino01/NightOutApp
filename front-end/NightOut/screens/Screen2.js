import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Modal, Image, RefreshControl } from 'react-native';
import { fetchReservasByUserId, fetchEstablecimientos, deleteReservaById } from '../functions/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import Icon from 'react-native-vector-icons/FontAwesome';

const Screen2 = () => {
  const [reservas, setReservas] = useState([]); // Estado para almacenar las reservas
  const [establecimientos, setEstablecimientos] = useState([]); // Estado para almacenar los establecimientos
  const [establecimientosDict, setEstablecimientosDict] = useState({}); // Estado para almacenar los establecimientos
  const [modalVisible, setModalVisible] = useState(false);
  const [ModalNotConfirmed, setModalNotConfirmed] = useState(false);

  const [selectedItem, setSelectedItem] = useState({});
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const [confirmCancelModalVisible, setConfirmCancelModalVisible] = useState(false); // Nuevo estado para el modal de confirmación

  const handleCancelReservacion = () => {
    setModalNotConfirmed(false); // Cierra el modal de detalles
    setConfirmCancelModalVisible(true); // Abre el modal de confirmación de cancelación
  };

  // Función para manejar la confirmación de cancelación
  const confirmCancel = async (reservaId) => {
    const result = await deleteReservaById(reservaId);
    if (result) {
      console.log("Reservación cancelada con éxito.");
      // Opcional: muestra una notificación al usuario
      alert("Reservación cancelada con éxito.");
      // Recargar las reservaciones para reflejar la reservación cancelada
      await fetchData();
    } else {
      console.error("No se pudo cancelar la reservación.");
      // Opcional: muestra una notificación al usuario
      alert("No se pudo cancelar la reservación. Por favor, inténtalo de nuevo.");
    }
    setConfirmCancelModalVisible(false); // Cierra el modal de confirmación
  };
  
  function formatDate(dateString) {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
  
    const date = new Date(dateString);
  
    const day = date.getUTCDate(); // Use UTC date
    const month = months[date.getUTCMonth()]; // Use UTC month
    const year = date.getUTCFullYear(); // Use UTC year
  
    let hours = date.getUTCHours(); // Use UTC hours to avoid timezone offset issues
    const minutes = date.getUTCMinutes(); // Use UTC minutes
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  
    // Pad minutes with leading zero if less than 10
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
    return `${day} ${month} ${year} ${hours}:${formattedMinutes}${ampm}`;
  }
  
  const handleTabChange = (index) => {
    setSelectedTab(index);
  };

  const getFilteredReservas = () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(0, 0, 0, 0); // Comienza al inicio del día actual
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1); // Resta 3 días para incluir todo el día de ayer
  
    return Object.keys(reservas).map(key => {
      const filteredData = reservas[key].filter(reserva => {
        const reservaDate = new Date(reserva.fecha_hora);
  
        if (selectedTab === 0) {
          // Incluye reservas desde el inicio de ayer y reservas futuras
          return reservaDate >= twoDaysAgo;
        } else {
          // Mantiene la lógica para la pestaña de asistencia
          return reserva.asistencia === 1;
        }
      });
  
      return { title: establecimientosDict[key] ? establecimientosDict[key].nombre : "", data: filteredData };
    }).filter(section => section.data.length > 0); // Filtra secciones sin datos
  };
  
  

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
        const establecimientosData = await fetchEstablecimientos();
        setEstablecimientos(establecimientosData); // Actualiza el estado con los establecimientos obtenidos
  
        let tempEstablecimientosDict = {};
        establecimientosData.forEach((element) => {
          tempEstablecimientosDict[element.id] = element;
        });
        setEstablecimientosDict(tempEstablecimientosDict);
        console.log('Establecimientos cargados con éxito.');
  
        // Ordena las reservas
        const sortedReservas = sortReservas(reservasData);

        // Filtra las reservas
        const filteredReservas = sortedReservas.filter(reserva => {
          // Incluye reservas donde el usuario ha asistido o las reservas para fechas futuras
          return reserva.asistencia === 1 || true;
        });
  
        // Agrupar reservas por establecimiento
        const reservasAgrupadas = filteredReservas.reduce((acc, reserva) => {
          const estId = reserva.establecimiento_id;
          if (!acc[estId]) {
            acc[estId] = [];
          }
          acc[estId].push(reserva);
          return acc;
        }, {});
  
        setReservas(reservasAgrupadas);
      } else {
        console.log('userToken no encontrado');
      }
    } catch (error) {
      console.error('Error al obtener el ID del usuario o las reservas:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData(); // Llama a fetchData cada vez que se enfoca en el componente
    }, [])
  );

  function formatToDayMonthYear(dateString) {
    const date = new Date(dateString);

    const parts = dateString.split('-'); // Split the string by hyphen
    const day = parts[2].substring(0, 2);

    const month = date.getMonth();
    const year = date.getFullYear();

    // Array con los nombres de los meses en español y en mayúsculas
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Obtén el nombre del mes en español y en mayúsculas
    const formattedMonth = meses[month];

    return `${day} de ${formattedMonth}`;
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
    if (item.confirmado === 1 && item.asistencia === 0) {
      openModalWithItem(item.id);
    } else {
      setSelectedItem(item);
      setModalNotConfirmed(true);
      console.log(item)
    }
};

  

  const reservaView = ({ item }) => {
  return (
    <View>
      <TouchableOpacity 
        onPress={() => handleItemPress(item)} 
        style={styles.reservaContainer}
      >
        <View style={[
          styles.reservaItem,
          getBackgroundColor(item) // Cambia el fondo según el estado de la reserva
        ]}>
          <View style={styles.row}>
            <Text style={styles.text}>
              {establecimientosDict[item.establecimiento_id] 
               ? establecimientosDict[item.establecimiento_id]["nombre"] 
               : ""}
            </Text>
            <Text style={styles.textSmall}>{item.tipo_de_mesa}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.text_invisible}>
              {item.confirmado === 1 && item.asistencia === 0 ? 
                <Icon name="qrcode" size={30} color="#000" /> 
                : ""}
              {item.confirmado === 0 ? "(Por confirmar)" : ""}
              {item.asistencia === 1 ? "(Has asistido)" : ""}
            </Text>

            <Text style={styles.text}>
              {formatToDayMonthYear(item.fecha_hora)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {/* Agregar una línea horizontal después de cada reserva */}
      <View style={styles.separatorLine}></View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      <SegmentedControlTab
        values={['Próximas', 'Asistidas']}
        selectedIndex={selectedTab}
        onTabPress={handleTabChange}
        tabsContainerStyle={styles.tabsContainer}
        tabStyle={styles.tabStyle}
        activeTabStyle={styles.activeTabStyle}
        tabTextStyle={styles.tabTextStyle}
        activeTabTextStyle={styles.activeTabTextStyle}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >

        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ padding: 20, backgroundColor: "white", borderRadius: 10, width: '80%', height: '50%', flexDirection: 'column', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ paddingBottom: 5, fontWeight: "700", fontSize: 20 }}>Reserva confirmada</Text>

              <Text style={{ paddingBottom: 5 }}>🗓️ {formatDate(selectedItem.fecha_hora)}</Text>

            <Text style={{ paddingBottom: 15 }}>🍸 {selectedItem.tipo_de_mesa}</Text>
              <Text style={{ paddingBottom: 3 }}>Muestra el QR en el establecimiento</Text> 
              <Text style={{ paddingBottom: 3 }}>Recuerda que tu reserva cuenta con 15 minutos de tolerancia</Text>
              <Image source={{ uri: 'https://nightout.com.mx/api/uploads/reservas_qr/qr_'+selectedItemId+'.png' } } style={{ width: "100%", height:220, resizeMode: "contain" }} />

            </View>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ backgroundColor: '#5271FF', padding: 10, alignItems: 'center', marginBottom: 10,}}>
              <Text style={{ color: 'white'}}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmCancelModalVisible}
        onRequestClose={() => {
          setConfirmCancelModalVisible(!confirmCancelModalVisible);
        }}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ padding: 20, backgroundColor: "white", borderRadius: 10, width: '80%', alignItems: 'center' }}>
            <Text style={{ marginBottom: 20 }}>¿Estás seguro de que quieres cancelar tu reservación?</Text>
            <TouchableOpacity onPress={() => confirmCancel(selectedItem.id)} style={{ backgroundColor: '#EC5858', padding: 10, alignItems: 'center', marginBottom: 10, width: '100%', justifyContent: 'center' }}>
              <Text style={{ color: 'white' }}>Sí, cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmCancelModalVisible(false)} style={{ backgroundColor: '#5271FF', padding: 10, alignItems: 'center', width: '100%', justifyContent: 'center' }}>
              <Text style={{ color: 'white' }}>No, mantener</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={ModalNotConfirmed}
        onRequestClose={() => {
          setModalNotConfirmed(!ModalNotConfirmed);
        }}
      >

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{ padding: 20, backgroundColor: "white", borderRadius: 10, width: '80%', flexDirection: 'column', justifyContent: 'space-between' }}>
          <View style={{ paddingBottom: 20 }}>
            <Text style={{ paddingBottom: 5, fontWeight: "700", fontSize: 20 }}>Detalles de la reservación</Text>

            {/* Conditional rendering based on confirmado and asistencia */}
            {selectedItem.confirmado === 0 ? (
              <Text style={{ paddingBottom: 5 }}>🟡 (Por confirmar)</Text>
            ) : selectedItem.asistencia === 1 ? (
              <Text style={{ paddingBottom: 5 }}>🟢 (Has asistido)</Text>
            ) : null}

            <Text style={{ paddingBottom: 5 }}>🗓️ {formatDate(selectedItem.fecha_hora)}</Text>

            <Text style={{ paddingBottom: 5 }}>🍸 {selectedItem.tipo_de_mesa}</Text>

            
          </View>

          {selectedItem.asistencia === 0 ? (
              <TouchableOpacity onPress={handleCancelReservacion} style={{ borderWidth: 1, borderColor:"#EC5858", backgroundColor: 'white', padding: 10, alignItems: 'center', marginBottom: 10, }}>
              <Text style={{ color: '#EC5858' }}>Cancelar Reservación</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={() => setModalNotConfirmed(false)} style={{ backgroundColor: '#5271FF', padding: 10, alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      </Modal>

      

      <SectionList
        sections={getFilteredReservas()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={reservaView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.flatlist}
      />

    </View>
  );
  
};

const styles = StyleSheet.create({
  tabsContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
  tabStyle: {
    borderColor: '#5271FF',
  },
  activeTabStyle: {
    backgroundColor: '#5271FF',
  },
  tabTextStyle: {
    color: '#5271FF',
  },
  activeTabTextStyle: {
    color: '#fff',
  },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separatorLine: {
    borderBottomColor: 'grey',
    borderBottomWidth: 0,
    marginVertical: 0,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: "#fff",
    padding: 10,
  },
  
  // Añade más estilos según sea necesario
});

export default Screen2;
