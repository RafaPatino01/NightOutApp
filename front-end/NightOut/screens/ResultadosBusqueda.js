import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const ResultadosBusqueda = ({ route }) => {
  const { data } = route.params;
  const navigation = useNavigation();
  const [results, setResults] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const customHeaderStyle = {
    shadowOpacity: 0,
    elevation: 0,
    borderBottomWidth: 0,
  };

  useEffect(() => {
    // Set the header options
    navigation.setOptions({
      title: "Resultados",
      headerStyle: customHeaderStyle,
      headerBackTitle: '', // Set the back button title to an empty string
      headerBackTitleVisible: false,
    });

    // Construir la URL base del endpoint
    let apiUrl = 'http://192.168.100.11:3000/search_establecimientos?';

    // Verificar si se proporciona la variable 'price' y agregarla a la URL si existe
    if (data.price) {
      apiUrl += `price=${data.price}&`;
    }

    // Verificar si se proporciona la variable 'searchQuery' y agregarla a la URL si existe
    if (data.searchQuery) {
      apiUrl += `searchQuery=${data.searchQuery}&`;
    }

    // Verificar si se proporciona la variable 'selectedLocation' y agregarla a la URL si existe
    if (data.selectedLocation) {
      apiUrl += `selectedLocation=${data.selectedLocation}&`;
    }

    // Verificar si se proporciona la variable 'selectedType' y agregarla a la URL si existe
    if (data.selectedType) {
      apiUrl += `selectedType=${data.selectedType}`;
    }

    // Realizar la solicitud al endpoint con la URL construida
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        console.log("Resultado de la solicitud al endpoint:", data);
        setResults(data);
      })
      .catch(error => {
        console.error("Error al realizar la solicitud:", error);
      });
  }, [data]);

  const handleItemPress = (item) => {
    console.log(item.nombre + ' was pressed.');
    navigation.navigate('DetalleEstablecimiento', { data: item });
  };
  
  const handleImageLoad = () => {
    // This function will be called when the image is loaded
    setImageLoaded(true);
  };

  const StarRating = ({ rating }) => {
    // Convert the string rating to an integer
    const numericRating = parseInt(rating);

    // Generate a string of stars based on the rating value
    const stars = '⭐'.repeat(numericRating);

    return <Text style={styles.starText}>{stars}</Text>;
  };

  const establecimientoView = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={styles.establecimientoContainer}>
        <Image
          source={{ uri: 'http://192.168.100.11:3000' + item.images[0].substring(1) }}
          style={styles.image}
          onLoad={handleImageLoad} // Call the function when the image is loaded
        />
        {imageLoaded && (
          // Only show this view when the image is loaded
          <View style={styles.establecimiento}>
            <Text style={styles.establecimientoText}>{item.nombre}</Text>
          </View>
        )}
        {imageLoaded && <View style={styles.bottomBorder}></View>}
        {imageLoaded && (
          <View style={styles.establecimiento}>
            <StarRating rating={item.resenas_calificacion} />
            <Text style={styles.establecimientoText2}>{item.ubicacion_general}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        {results.length === 0 ? (
            <Text>Sin resultados</Text>
        ) : (
            <FlatList
            style={styles.flatlist}
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={establecimientoView}
            />
        )}
    </View>

  );
};

const styles = StyleSheet.create({
    filter: {
        width: "33%",
        padding: 10, // Add some padding to make the buttons look nicer
        // Add other styling as needed for non-active buttons
      },
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
      },
      flatlist: {
        width: '100%',
      },
      establecimientoContainer: {
        backgroundColor: '#070808',
        borderRadius: 20,
        marginHorizontal: 20,
        marginVertical: 10,
      },
      establecimiento: {
        padding: 20,
        flexDirection: 'row', // Arrange children in a row
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      establecimientoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
      },
      establecimientoText2: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'right',
      },
      starText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
      },
      image: {
        borderTopLeftRadius: 20, // Adjust the radius as needed
        borderTopRightRadius: 20,
        width: '100%',
        height: 200,
      },
      bottomBorder: {
        width: '100%', // Cover the entire width
        height: 1, // Adjust the height as needed
        backgroundColor: 'white', // Color of the bottom border
      },
      quickFilters: {
        width: "100%",
        padding: 7,
        backgroundColor: "#5271FF",
        flexDirection: 'row', // Arrange children in a row
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      filter: {
        width: "33%",
      },
      filterText: {
        textAlign: "center",
        textDecorationLine: 'underline',
        color: "white",
        fontWeight: 'bold',
      }
});

export default ResultadosBusqueda;
