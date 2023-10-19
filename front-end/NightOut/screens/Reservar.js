import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Modal, Alert} from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import ModalSelector from 'react-native-modal-selector';
import AsyncStorage from '@react-native-async-storage/async-storage'

const horarios = [
  { key: 1, label: '10 PM' },
  { key: 2, label: '11 PM' },
  { key: 3, label: '12 PM' },
  { key: 4, label: '01 AM' },
  { key: 5, label: '02 AM' },
];

const mesas = [
  { key: 1, label: 'Mesa para 4' },
  { key: 2, label: 'Mesa para 6' },
  { key: 3, label: 'Mesa para 10' }
];

const horarios24h = {
  '10 PM': '22:00:00',
  '11 PM': '23:00:00',
  '12 PM': '00:00:00', // Medianoche
  '01 AM': '01:00:00',
  '02 AM': '02:00:00',
};

const Reservar = ({ route }) => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHorario, setSelectedHorario] = useState(null); // Estado para el horario
  const [selectedMesa, setSelectedMesa] = useState(null); // Estado para el tipo de mesa
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const navigation = useNavigation();

  // Access the passed data using route.params
  const receivedData = route.params?.data;

  useEffect(() => {
    // Set the header options
    navigation.setOptions({
      title: "Reservar",
      headerStyle: customHeaderStyle,
      headerTitleStyle: customTitleStyle,
      headerBackTitle: '', // Set the back button title to an empty string
      headerTintColor: '#5271FF',
      headerBackTitleVisible: false,
    });
  }, []);

  // Custom header style
  const customHeaderStyle = {
    backgroundColor: '#070808',
    shadowOpacity: 0,
    elevation: 0,
    borderBottomWidth: 0,
  };
  const customTitleStyle = {
    color: 'white',
    fontSize: 23,
  };

  const formatToSQLDateTime = (displayedDate, selectedHour) => {
    if (displayedDate && selectedHour) {
      const parts = displayedDate.split('/');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1]; // Cambio en el orden
        const day = parts[2];   // Cambio en el orden
        const sqlDate = `${year}-${month}-${day} ${selectedHour}.000`;
        return sqlDate;
      }
    }
    return null;
  };
  
  const toggleDatePicker = () => {
    setDatePickerVisible(!isDatePickerVisible);
  };

  // Calculate the minimum and maximum allowed dates
  const today = new Date();
  const oneMonthFromNow = new Date(today);
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);


  const handleReservar = async () => {
    if (selectedDate && selectedHorario && selectedMesa) {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          const apiUrl = `http://192.168.100.11:3000/get_usuarios/?correo_electronico=${userToken.toLowerCase()}`;
    
          // Realizar la consulta GET para obtener el ID del usuario
          const response = await fetch(apiUrl);
          if (response.status === 200) {
            const userData = await response.json();
            const userId = userData[0].id;
    
            // Formatear la fecha y hora en formato SQL
            const formattedDateTime = formatToSQLDateTime(selectedDate, horarios24h[selectedHorario]);
    
            // Construir el cuerpo de la solicitud POST
            const reservaData = {
              fecha_hora: formattedDateTime,
              usuario_id: userId,
              establecimiento_id: receivedData.id,
              numero_personas: 1, 
              confirmado: 0, 
              asistencia: 0, 
              tipo_mesa: selectedMesa,
            };
    
            // Realizar la solicitud POST para agregar la reserva
            const postUrl = 'http://192.168.100.11:3000/add_reserva';
            const postResponse = await fetch(postUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(reservaData),
            });
    
            if (postResponse.status === 201) {
              console.log('Reserva insertada con éxito');
              navigation.navigate('Mis Reservas');
              Alert.alert("Tu reserva se ha solicitado correctamente");
            } else {
              console.error('Error al insertar la reserva:', postResponse.status);
              // Puedes manejar el error de inserción aquí
            }
          } else {
            throw new Error(`Error en la solicitud: ${response.status}`);
          }
        } else {
          console.log("userToken no encontrado");
        }
      } catch (error) {
        console.error("Error en la consulta o al insertar la reserva:", error);
      }
    } else {
      Alert.alert("Campos Incompletos", "Por favor, llene todos los campos antes de continuar.");
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        style={styles.statusBar}
        animated={true}
        barStyle="light-content"
      />
      <TouchableOpacity onPress={toggleDatePicker} style={styles.button}>
        <Text style={[styles.buttonText, { color: selectedDate ? 'white' : '#d1d1d1' }]}>
          {selectedDate || "Seleccionar fecha 📅"}
        </Text>
      </TouchableOpacity>


      <View style={styles.container}>
        <ModalSelector
          data={horarios}
          initValue="Seleccionar horario 🕑"
          onChange={(option) => setSelectedHorario(option.label)}
          selectStyle={styles.modalSelector} // Update the style here
          selectTextStyle={styles.selectTextStyle}
          cancelText=""
          cancelStyle={{ backgroundColor: 'transparent', borderColor: 'transparent' }} // Make the "Cancelar" button transparent
          overlayStyle={{ backgroundColor: '#070808' }} 
          optionStyle={{ backgroundColor: "#070808", marginBottom: 10, }}
          optionTextStyle={{color: 'white', fontSize: 20,}}
          optionContainerStyle={{ backgroundColor: "#070808" }}
        />
      </View>

      <View style={styles.container}>
        <ModalSelector
          data={mesas}
          initValue="Seleccionar tipo de mesa"
          onChange={(option) => setSelectedMesa(option.label)}
          selectStyle={styles.modalSelector} // Update the style here
          selectTextStyle={styles.selectTextStyle}
          cancelText=""
          cancelStyle={{ backgroundColor: 'transparent', borderColor: 'transparent' }} // Make the "Cancelar" button transparent
          overlayStyle={{ backgroundColor: '#070808' }} 
          optionStyle={{ backgroundColor: "#070808", marginBottom: 10, }}
          optionTextStyle={{color: 'white', fontSize: 20,}}
          optionContainerStyle={{ backgroundColor: "#070808" }}
        />
      </View>

      <Modal visible={isDatePickerVisible} animationType="slide">
        <View style={styles.modal}>
          <DatePicker
            options={{
              backgroundColor: '#070808',
              textHeaderColor: '#5271FF',
              textDefaultColor: '#F6E7C1',
              selectedTextColor: '#fff',
              mainColor: '#5271FF',
              textSecondaryColor: '#D6C7A1',
              borderColor: 'rgba(122, 146, 165, 0.1)',
            }}
            current={today.toISOString().split('T')[0]}
            minimumDate={today.toISOString().split('T')[0]}
            maximumDate={oneMonthFromNow.toISOString().split('T')[0]}
            mode="calendar"
            onSelectedChange={(date) => {
              setSelectedDate(date);
              toggleDatePicker();
            }}
          />
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleReservar}
      >
        <Text style={styles.buttonText}>Solicitar Reserva</Text>
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 30, // Place it at the bottom
    alignSelf: 'center', 
    backgroundColor: '#5271FF',
    borderRadius: 25, 
    width: 280,
    height: 60, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  screen: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: "#070808",
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    backgroundColor: "#070808",
    justifyContent: 'flex-start', // Alinear elementos en la parte superior
    alignItems: 'center', // Centrar elementos horizontalmente
    justifyContent: 'center', // Centrar elementos verticalmente
  },
  button: {
    backgroundColor: '#696969',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
    width: "90%",
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    width: "90%",
    marginBottom: 20,
  },
  modalSelector: {
    backgroundColor: '#696969', // Background color of the ModalSelector
    borderColor: '#696969', // Border color of the ModalSelector
    width: "100%",
    padding: 15,
  },
  selectTextStyle: {
    color: 'white', // Text color of the ModalSelector
  },
});

export default Reservar;
