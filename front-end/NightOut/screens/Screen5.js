import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { fetchEstablecimientos } from '../functions/functions';

const Screen5 = ({ route }) => {
  const navigation = useNavigation();
  const [locations, setLocations] = useState([]);

  const [price, setPrice] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    fetchEstablecimientos()
      .then((data) => {
        const uniqueLocations = [...new Set(data.map(element => element.ubicacion_general))];
        setLocations(uniqueLocations);
      });
  }, []);
  

  const getPriceLabel = (value) => {
    switch (value) {
      case 0: return 'Todos';
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return 'Todos';
    }
  };

  const toggleType = (type) => {
    // Si el tipo seleccionado ya estaba seleccionado, deselecciónalo
    if (selectedType === type) {
      setSelectedType(null);
    } else {
      setSelectedType(type);
    }
  };

  const toggleLocation = (location) => {
    // Si la ubicación seleccionada ya estaba seleccionada, deselecciónala
    if (selectedLocation === location) {
      setSelectedLocation(null);
    } else {
      setSelectedLocation(location);
    }
  };

  const handleSearch = () => {
    const searchData = {
      searchQuery,
      price: getPriceLabel(price),
      selectedType,
      selectedLocation,
    };
    console.log(searchData);
    navigation.navigate("Resultados", { data: searchData })
  };

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Icon style={styles.searchIcon} name="search" size={20} color="#000"/>
        <TextInput
          style={styles.input}
          placeholder="Buscar..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>Seleccionar tipo establecimiento</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[
            styles.option,
            selectedType === 'Antro' && styles.selectedOption, // Aplica el estilo si está seleccionado
          ]}
          onPress={() => toggleType('Antro')}
        >
          <Text style={[selectedType === 'Antro' && styles.selectedOptionText]}>Antros</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[
          styles.option,
          selectedType === 'Bar' && styles.selectedOption, // Aplica el estilo si está seleccionado
        ]} onPress={() => toggleType('Bar')}>
          <Text style={[selectedType === 'Bar' && styles.selectedOptionText]}>Bares</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[
            styles.option,
            selectedType === 'Restaurante' && styles.selectedOption, // Aplica el estilo si está seleccionado
          ]} onPress={() => toggleType('Restaurante')}>
          <Text style={[selectedType === 'Restaurante' && styles.selectedOptionText]}>Restaurantes</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Precio</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={4}
          minimumTrackTintColor="#5271FF"
          maximumTrackTintColor="#000000"
          step={1}
          value={price}
          onValueChange={setPrice}
        />
        <Text style={styles.priceText}>{getPriceLabel(price)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Ubicación</Text>
      <View>
  {chunkArray(locations, 2).map((locationPair, index) => (
    <View key={index} style={styles.optionsRow}>
      {locationPair.map((location, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.longOption,
            selectedLocation === location && styles.selectedOption,
          ]}
          onPress={() => toggleLocation(location)}
        >
          <Text style={[selectedLocation === location && styles.selectedOptionText]}>
            {location}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  ))}
</View>


      <TouchableOpacity style={styles.floatingButton} onPress={handleSearch}>
        <Text style={styles.buttonText}>BUSCAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedOptionText: {
    color: 'white',
  },
  selectedOption: {
    backgroundColor: '#5271FF',
    borderColor: '#5271FF',
    color: 'white',
  },
  buttonText: {
    color: 'white',
  }, 
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
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#424242',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    backgroundColor: '#5271FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle1: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 10,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  option: {
    borderColor: '#5271FF',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    justifyContent: 'center', 
    alignItems: 'center', 
    textAlign: 'center',
  },
  longOption: {
    borderColor: '#5271FF',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexGrow: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center', 
    textAlign: 'center', 
  },
  
  sliderContainer: {
    alignItems: 'stretch',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginTop: 20,
  },
  slider: {
    height: 40,
    marginHorizontal: 10,
  },
  priceText: {
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Screen5;
