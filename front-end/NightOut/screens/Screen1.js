import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar, RefreshControl } from 'react-native';
import { fetchEstablecimientos } from '../functions/functions';
import { useNavigation } from '@react-navigation/native';

const Screen1 = () => {
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [filteredEstablecimientos, setFilteredEstablecimientos] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos'); // New state for active filter

  const onRefresh = () => {
    setRefreshing(true);
    fetchEstablecimientos()
      .then((data) => {
        setEstablecimientos(data);
        setFilteredEstablecimientos(data);
        sortAndSetFilteredEstablecimientos(data);
        setRefreshing(false); // Termina el refreshing
      })
      .catch((error) => {
        console.error('Error refreshing data:', error);
        setRefreshing(false); // También termina el refreshing en caso de error
      });
  };

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

  const applyFilter = (tipo) => {
    if (activeFilter === tipo) {
      // Si el filtro seleccionado es el mismo que el filtro activo, resetea el filtro
      setActiveFilter('Todos');
      setFilteredEstablecimientos(establecimientos);
    } else {
      // Si no, aplica el filtro como antes
      setActiveFilter(tipo);
      if (tipo === 'Todos') {
        setFilteredEstablecimientos(establecimientos);
      } else {
        const filteredData = establecimientos.filter(item => item.tipo === tipo);
        setFilteredEstablecimientos(filteredData);
      }
    }

    let filteredData = [...establecimientos]; // Asume esto es el resultado de tu filtrado actual
    if (tipo !== 'Todos') {
      filteredData = establecimientos.filter(item => item.tipo === tipo);
    }
    sortAndSetFilteredEstablecimientos(filteredData);

  };
  

  const getFilterStyle = (tipo) => ({
    ...styles.filter,
    backgroundColor: activeFilter === tipo ? 'white' : 'transparent', // Highlight if active
  });
  
  const getFilterTextStyle = (tipo) => ({
    ...styles.filterText,
    color: activeFilter === tipo ? 'black' : 'white', // Change text color to black if active
  });
  
  const sortAndSetFilteredEstablecimientos = (data) => {
    const fixedItems = data.filter(item => Number(item.fixed) !== 0);
    const nonFixedItems = data.filter(item => Number(item.fixed) === 0);
  
    // Improved shuffle function using the Fisher-Yates (modern algorithm) shuffle
    for (let i = nonFixedItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonFixedItems[i], nonFixedItems[j]] = [nonFixedItems[j], nonFixedItems[i]];
    }
  
    // Combine the fixed and non-fixed items, with fixed items at the top
    const sortedData = [...fixedItems, ...nonFixedItems];
    setFilteredEstablecimientos(sortedData);
  };

  useEffect(() => {
    fetchEstablecimientos()
      .then((data) => {
        // Usa la función sortAndSetFilteredEstablecimientos aquí después de la carga inicial
        sortAndSetFilteredEstablecimientos(data);
      })
      .catch((error) => {
        console.error('Error in component:', error);
      });
  }, []);
  
  const establecimientoView = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={[
          styles.establecimientoContainer,
          item.fixed !== 0 && styles.borderBlue // Aplica el estilo borderBlue si item.fixed es distinto de '0'
      ]}>
        <Image
          source={{ uri: 'https://nightout.com.mx/api' + item.images[0].substring(1) }}
          style={styles.image}
          onLoad={handleImageLoad} // Llama a la función cuando la imagen se carga
        />
        {imageLoaded && (
          // Solo muestra esta vista cuando la imagen se carga
          <View style={styles.establecimiento}>
            <Text style={styles.establecimientoText}>{item.nombre}</Text>
          </View>
        )}
        {imageLoaded && <View style={styles.bottomBorder}></View>}
        {imageLoaded && (
          <View style={styles.establecimiento}>
            <StarRating rating={item.resenas_calificacion} />
            <Text style={styles.establecimientoText2}>📍{item.ubicacion_general}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      <StatusBar
          style={styles.statusBar}
          animated={true}
          barStyle="dark-content"
      />
      <View style={styles.quickFilters}> 
        
      <Image
        source={require('../img/logo-dark.png')}  // Assuming the image is in the 'img' folder at your project root
        style={styles.imageLogo}
      />
        
      </View>

      <View style={styles.quickFilters}>
        <TouchableOpacity style={getFilterStyle('Antro')} onPress={() => applyFilter('Antro')}>
          <Text style={getFilterTextStyle('Antro')}>ANTROS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={getFilterStyle('Restaurante')} onPress={() => applyFilter('Restaurante')}>
          <Text style={getFilterTextStyle('Restaurante')}>RESTAURANTES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={getFilterStyle('Bar')} onPress={() => applyFilter('Bar')}>
          <Text style={getFilterTextStyle('Bar')}>BARES</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.flatlist}
        data={filteredEstablecimientos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={establecimientoView}
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
  borderBlue: {
    borderWidth: 6, // El grosor del borde
    borderColor: '#5874fc', // El color del borde
  },
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
  imageLogo: {
    width: 142,
    height: 44,
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
