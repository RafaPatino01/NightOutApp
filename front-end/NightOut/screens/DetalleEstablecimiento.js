import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, StatusBar, TouchableOpacity, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-snap-carousel';
import instagramIcon from '../assets/instagram_logo.png';
import { fetchEstablecimientoById } from '../functions/functions';

const DetalleEstablecimiento = ({ route }) => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [allowReservas, setAllowReservas] = useState(0); // State to store allow_reservas

  // Access the passed data using route.params
  const receivedData = route.params?.data;

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

  useEffect(() => {

    const fetchDetails = async () => {
      try {
        const establecimientoData = await fetchEstablecimientoById(receivedData.id);
        if (establecimientoData) {
          // Update allowReservas state based on fetched data
          setAllowReservas(establecimientoData.allow_reservas);
        }
      } catch (error) {
        console.error('Failed to fetch establecimiento details:', error);
        Alert.alert('Error', 'Failed to load establecimiento details. Please try again later.');
      }
    };

    fetchDetails();

    // Set the header options
    navigation.setOptions({
      title: receivedData.nombre,
      headerStyle: customHeaderStyle,
      headerTitleStyle: customTitleStyle,
      headerBackTitle: '', // Set the back button title to an empty string
      headerTintColor: '#5271FF',
      headerBackTitleVisible: false,
      headerRight: () => (
        <TouchableOpacity
          style={styles.instagramButton}
          onPress={() => {
            const instagramUrl = receivedData.redes_sociales;
            Linking.openURL(instagramUrl);
          }}
        >
          <Image source={instagramIcon} style={styles.instagramIcon} />
        </TouchableOpacity>
      ),
    });
    
    const updatedData = receivedData.images.map((element) => ({
      image: { uri: 'https://nightout.com.mx/api' + element.slice(1) },
    }));

    setData(updatedData);
  }, [receivedData]);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.container}>
        <Image source={item.image} style={styles.image} />
      </View>
    );
  };

  const StarRating = ({ rating }) => {
    // Convert the string rating to an integer
    const numericRating = parseInt(rating);

    // Generate a string of stars based on the rating value
    const stars = '⭐'.repeat(numericRating);

    return <Text style={styles.starText}>{stars}</Text>;
  };

  const Pagination = ({ activeIndex, totalItems }) => {
    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: totalItems }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    );
  };

  
  return (
    <View style={styles.screen}>
      <StatusBar
        style={styles.statusBar}
        animated={true}
        barStyle="light-content"
      />

      <ScrollView style={styles.scrollView}>
        <Carousel
          data={data}
          renderItem={renderItem}
          sliderWidth={400}
          itemWidth={400}
          onSnapToItem={(index) => setActiveIndex(index)}
        />

        <Pagination activeIndex={activeIndex} totalItems={data.length} />

      
        <View style={styles.row}>
          <Text style={styles.text}>📍{receivedData.ubicacion_general}</Text>
          <StarRating rating={receivedData.resenas_calificacion} />
        </View>

        <View style={styles.horizontalBar}></View>

        <View style={styles.row2}>
          <TouchableOpacity style={styles.text}
          onPress={() => {
            Linking.openURL(receivedData.link_google_maps);
          }}
          >
            <Text style={ styles.text2 }>🌎 Ubicación en Maps</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.horizontalBar}></View>

        <View style={styles.row2}>
          <TouchableOpacity style={styles.text}
          onPress={() => {
            Linking.openURL(receivedData.link_menu);
          }}
          >
            <Text style={ styles.text3 }>📖 Ver menú</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.horizontalBar}></View>

        <View style={styles.row2}>
          <Text style={styles.text}>{receivedData.horario}</Text>
        </View>

        <View style={styles.horizontalBar}></View>

        <View style={styles.row2}>
          <Text style={styles.textBold}>Descripción:</Text>
          <Text style={styles.textNormal}>{receivedData.descripcion}</Text>
        </View>

        <View style={styles.horizontalBar}></View>

        <View style={styles.row2}>
          <Text style={styles.textBold}>Restricciones:</Text>
          <Text style={styles.textNormal}>{receivedData.restricciones}</Text>
        </View>

        <View style={styles.horizontalBar}></View>

        <View style={styles.row2}>
          <Text style={styles.textBold}>Precios:</Text>
          <Text style={styles.textNormal}>{receivedData.precios}</Text>
        </View>

        <View style={styles.horizontalBar}></View>

        <View style={styles.row3}>
          <Text style={styles.textBold}>Tipo de pago:</Text>
          <Text style={styles.textNormal}>
            {receivedData.tipo_de_pago == "Ambos" ? "Tarjeta y efectivo" : receivedData.tipo_de_pago}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          if (allowReservas === 0) {
            Alert.alert("❌ El establecimiento no permite reservar en estos momentos");
          } else {
            navigation.navigate("Reservar", { data: receivedData })
          }
        }}
      >
        <Text style={styles.buttonText}>RESERVAR</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    backgroundColor: '#777777',
  },
  
  // Add styles for the floating button
  floatingButton: {
    position: 'absolute',
    bottom: 0, // Place it at the bottom
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
    flex: 1,
    backgroundColor: "#070808",
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 400,
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  text2: {
    fontSize: 18,
    color: "#5271FF",
    fontWeight: "bold",
  },
  text3: {
    fontSize: 18,
    color: "#BB8FCE",
    fontWeight: "bold",
  },
  text: {
    fontSize: 18,
    padding: 20,
    color: "white",
    fontWeight: "bold",
  },
  textBold: {
    fontSize: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    color: "white",
    fontWeight: "bold",
  },
  textNormal: {
    fontSize: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    color: "white",
  },
  row: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingEnd: 20,
  },
  row2: {
    width: "100%",
  },
  row3: {
    width: "100%",
    marginBottom: 150,
  },
  horizontalBar: {
    height: 1,
    backgroundColor: '#696969',
  },
  instagramButton: {
    marginRight: 15,
  },
  instagramIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

export default DetalleEstablecimiento;
