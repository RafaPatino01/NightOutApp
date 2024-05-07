import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, StatusBar, TouchableOpacity, Modal, Alert } from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import ModalSelector from 'react-native-modal-selector';
import AsyncStorage from '@react-native-async-storage/async-storage'
import ImageViewer from 'react-native-image-zoom-viewer';

const horarios24h = {
  '12:00 AM': '00:00:00',
  '01:00 AM': '01:00:00',
  '02:00 AM': '02:00:00',
  '03:00 AM': '03:00:00',
  '04:00 AM': '04:00:00',
  '05:00 AM': '05:00:00',
  '06:00 AM': '06:00:00',
  '07:00 AM': '07:00:00',
  '08:00 AM': '08:00:00',
  '09:00 AM': '09:00:00',
  '10:00 AM': '10:00:00',
  '11:00 AM': '11:00:00',
  '12:00 PM': '12:00:00',
  '01:00 PM': '13:00:00',
  '02:00 PM': '14:00:00',
  '03:00 PM': '15:00:00',
  '04:00 PM': '16:00:00',
  '05:00 PM': '17:00:00',
  '06:00 PM': '18:00:00',
  '07:00 PM': '19:00:00',
  '08:00 PM': '20:00:00',
  '09:00 PM': '21:00:00',
  '10:00 PM': '22:00:00',
  '11:00 PM': '23:00:00',
  '12:30 AM': '00:30:00',
  '01:30 AM': '01:30:00',
  '02:30 AM': '02:30:00',
  '03:30 AM': '03:30:00',
  '04:30 AM': '04:30:00',
  '05:30 AM': '05:30:00',
  '06:30 AM': '06:30:00',
  '07:30 AM': '07:30:00',
  '08:30 AM': '08:30:00',
  '09:30 AM': '09:30:00',
  '10:30 AM': '10:30:00',
  '11:30 AM': '11:30:00',
  '12:30 PM': '12:30:00',
  '01:30 PM': '13:30:00',
  '02:30 PM': '14:30:00',
  '03:30 PM': '15:30:00',
  '04:30 PM': '16:30:00',
  '05:30 PM': '17:30:00',
  '06:30 PM': '18:30:00',
  '07:30 PM': '19:30:00',
  '08:30 PM': '20:30:00',
  '09:30 PM': '21:30:00',
  '10:30 PM': '22:30:00',
  '11:30 PM': '23:30:00'
};

const Reservar = ({ route }) => {
  
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHorario, setSelectedHorario] = useState(null); // Estado para el horario
  const [selectedMesa, setSelectedMesa] = useState(null); // Estado para el tipo de mesa
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [mesas, setMesas] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const navigation = useNavigation();

  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const imageUrl = `https://nightout.com.mx/api${route.params?.data.imagen_mapa.substring(1)}`;
  const images = [{
    // URL property assumes your image URL is correct and accessible
    url: imageUrl,
  }];

  // Access the passed data using route.params
  const receivedData = route.params?.data;

  useEffect(() => {
    console.log(receivedData.allow_reservas);
    navigation.setOptions({
      title: "Reservar",
      headerStyle: customHeaderStyle,
      headerTitleStyle: customTitleStyle,
      headerBackTitle: '', // Set the back button title to an empty string
      headerTintColor: '#5271FF',
      headerBackTitleVisible: false,
    });
  
    if (receivedData && receivedData.capacidades_mesa) {
      const tipos_de_mesa = receivedData.capacidades_mesa.split(",");
      const mesasActualizadas = tipos_de_mesa.map((mesa, index) => ({
        key: index + 1, 
        label: mesa.trim() // Usar trim() para eliminar espacios adicionales
      }));
      setMesas(mesasActualizadas);
      
      console.log(receivedData.horariocsv);
  
      // Procesar receivedData.horariocsv para actualizar los horarios
      const horariosCSV = receivedData.horariocsv.split(", ");
      const horariosActualizados = horariosCSV.flatMap((hora, index) => {
        // Convertir la hora a un número para facilitar la manipulación
        const horaEn24 = parseInt(hora, 10);
        // Determinar el periodo AM/PM
        const periodo = horaEn24 < 12 || horaEn24 === 24 ? 'AM' : 'PM';
        // Ajustar para formato de 12 horas
        const horaEn12 = horaEn24 % 12 === 0 ? 12 : horaEn24 % 12;
        // Generar las claves para la hora exacta y la hora y media
        const claveHorarioExacta = `${horaEn12 < 10 ? `0${horaEn12}` : horaEn12}:00 ${periodo}`;
        const claveHorarioMedia = `${horaEn12 < 10 ? `0${horaEn12}` : horaEn12}:30 ${periodo}`;

        // Devolver dos objetos por cada hora: uno para la hora exacta y otro para la media hora
        return [{
          key: index * 2 + 1, // Asegurarse de que cada clave sea única
          label: claveHorarioExacta
        }, {
          key: index * 2 + 2, // Asegurarse de que cada clave sea única
          label: claveHorarioMedia
        }];
      });

      
  
      setHorarios(horariosActualizados);
    }
  
  }, [receivedData]);
  

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

  function getCurrentDateInCDMX() {
    const now = new Date();
    
    // Adjust to Mexico City timezone using 'toLocaleString' with timezone option
    const mexicoCityTime = now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' });
  
    // Convert the adjusted time back to a Date object
    const dateInCDMX = new Date(mexicoCityTime);
  
    // Subtract 6 hours
    dateInCDMX.setHours(dateInCDMX.getHours() - 6);

    return dateInCDMX;
  }


  
  const today = getCurrentDateInCDMX(); // Ensure 'today' is always a Date object
  
  // Later in your DatePicker or elsewhere
  const currentDateString = today.toISOString().split('T')[0]; // Use ISO string safely here
  const oneMonthFromNow = new Date(today);
  oneMonthFromNow.setMonth(today.getMonth() + 1); // Set to one month ahead
  

  const handleReservar = async () => {

    if(receivedData.allow_reservas == 0){
      Alert.alert("❌ El establecimiento no permite reservar en estos momentos");
      navigation.goBack();
    }
    else {
      if (selectedDate && selectedHorario && selectedMesa) {
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          if (userToken) {
            const apiUrl = `https://nightout.com.mx/api/get_usuarios/?correo_electronico=${userToken.toLowerCase()}`;
      
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
              const postUrl = 'https://nightout.com.mx/api/add_reserva';
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
                Alert.alert("✅ Tu reserva se ha solicitado correctamente");
              } else {
                console.error('Error al insertar la reserva:', postResponse.status);
                // Puedes manejar el error de inserción aquí
                Alert.alert("❌ Tu reserva no ha podido ser solicitada");
  
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
    }

    
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        style={styles.statusBar}
        animated={true}
        barStyle="light-content"
      />

    <Text style={styles.whiteText}>Mapa:</Text>

      <TouchableOpacity onPress={() => setImageViewerVisible(true)} style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.imageStyle}
        />
      </TouchableOpacity>


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
          optionTextStyle={{color: 'white', fontSize: 25,}}
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
          optionTextStyle={{color: 'white', fontSize: 25,}}
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

      <Modal visible={isImageViewerVisible} transparent={true}>
        <ImageViewer 
          imageUrls={images}
          onCancel={() => {
            console.log('onCancel called');
            setImageViewerVisible(false);
          }}
          enableSwipeDown={true}
          onSwipeDown={() => {
            console.log('onSwipeDown called');
            setImageViewerVisible(false);
          }}
          renderHeader={(currentIndex) => (
            <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center', zIndex: 1 }}>
              <TouchableOpacity 
                onPress={() => {
                  setImageViewerVisible(false);
                }}
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 20 }}
              >
                <Text style={{ color: '#FFF', fontSize: 22, margin: 20 }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
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
  whiteText: {
    fontSize: 20,
    color: 'white',
    marginBottom: 10,
  },
  imageStyle: {
    width: '90%', 
    height: 200, 
    resizeMode: 'cover', 
    marginBottom: 30,
    borderRadius: 20,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  screen: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: "#070808",
    alignItems: 'center',
  },
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
