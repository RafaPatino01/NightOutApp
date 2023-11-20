import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { fetchEstablecimientos } from '../functions/functions';
import { useNavigation } from '@react-navigation/native';

const Screen1 = () => {
  const navigation = useNavigation();

  const [establecimientos, setEstablecimientos] = useState([]);
  const [filteredEstablecimientos, setFilteredEstablecimientos] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos'); // New state for active filter

  useEffect(() => {
    fetchEstablecimientos()
      .then((data) => {
        setEstablecimientos(data);
        setFilteredEstablecimientos(data); // Set the filtered list to all items initially
      })
      .catch((error) => {
        console.error('Error in component:', error);
      });
  }, []);

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
          source={{ uri: 'http://192.168.1.77:3000' + item.images[0].substring(1) }}
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


  const applyFilter = (tipo) => {
    setActiveFilter(tipo);
    if (tipo === 'Todos') {
      setFilteredEstablecimientos(establecimientos);
    } else {
      const filteredData = establecimientos.filter(item => item.tipo === tipo);
      setFilteredEstablecimientos(filteredData);
    }
  };

  const getFilterStyle = (tipo) => ({
    ...styles.filter,
    backgroundColor: activeFilter === tipo ? '#E3E3E380' : 'transparent', // Highlight if active
  });
  
  return (
    <View style={styles.container}>
      <StatusBar
          style={styles.statusBar}
          animated={true}
          barStyle="dark-content"
      />
      
      <View style={styles.quickFilters}>
        {/* Apply getFilterStyle to each filter button */}
        <TouchableOpacity style={getFilterStyle('Antro')} onPress={() => applyFilter('Antro')}>
          <Text style={styles.filterText}>ANTROS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={getFilterStyle('Restaurante')} onPress={() => applyFilter('Restaurante')}>
          <Text style={styles.filterText}>RESTAURANTES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={getFilterStyle('Bar')} onPress={() => applyFilter('Bar')}>
          <Text style={styles.filterText}>BARES</Text>
        </TouchableOpacity>
      </View>

      <FlatList
          style={styles.flatlist}
          data={filteredEstablecimientos} // Use filteredEstablecimientos instead of establecimientos
          keyExtractor={(item) => item.id.toString()}
          renderItem={establecimientoView}
      />
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
    paddingTop: 50,
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

export default Screen1;
