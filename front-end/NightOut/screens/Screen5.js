import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const Screen5 = ({ route }) => {
  const navigation = useNavigation();

  const [price, setPrice] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const getPriceLabel = (value) => {
    switch (value) {
      case 1: return '$';
      case 2: return '$$';
      case 3: return '$$$';
      case 4: return '$$$$';
      default: return '$';
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
          minimumValue={1}
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
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[
            styles.longOption,
            selectedLocation === 'Santa Fe' && styles.selectedOption, // Aplica el estilo si está seleccionado
          ]}
          onPress={() => toggleLocation('Santa Fe')}
        >
          <Text style={[selectedLocation === 'Santa Fe' && styles.selectedOptionText]}>Santa Fe</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.longOption,
            selectedLocation === 'Centro' && styles.selectedOption, // Aplica el estilo si está seleccionado
          ]}
          onPress={() => toggleLocation('Centro')}
        >
          <Text style={[selectedLocation === 'Centro' && styles.selectedOptionText]}>Centro</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[
            styles.longOption,
            selectedLocation === 'Roma-Condesa' && styles.selectedOption, // Aplica el estilo si está seleccionado
          ]}
          onPress={() => toggleLocation('Roma-Condesa')}
        >
          <Text style={[selectedLocation === 'Roma-Condesa' && styles.selectedOptionText]}>Roma-Condesa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.longOption,
            selectedLocation === 'Polanco' && styles.selectedOption, // Aplica el estilo si está seleccionado
          ]}
          onPress={() => toggleLocation('Polanco')}
        >
          <Text style={[selectedLocation === 'Polanco' && styles.selectedOptionText]}>Polanco</Text>
        </TouchableOpacity>
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
