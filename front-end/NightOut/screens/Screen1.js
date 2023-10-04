import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import { fetchEstablecimientos } from '../functions/functions'; 

const Screen1 = () => {
    const [establecimientos, setEstablecimientos] = useState([]);

    useEffect(() => {
        // Call the fetchEstablecimientos function when the component mounts
        fetchEstablecimientos()
        .then((data) => {
            setEstablecimientos(data);
        })
        .catch((error) => {
            console.error('Error in component:', error);
        });
    }, []);

    const handleItemPress = (item) => {
        console.log(item.nombre + " was pressed.")
    };

    const StarRating = ({ rating }) => {
        // Convert the string rating to an integer
        const numericRating = parseInt(rating);
        
        // Generate a string of stars based on the rating value
        const stars = '⭐'.repeat(numericRating);
        
        return (
            <Text style={styles.starText}>{stars}</Text>
        );
    };

    const establecimientoView = ({ item }) => (
        <TouchableOpacity onPress={() => handleItemPress(item)}>
            
            <View style={styles.establecimientoContainer}>
                <Image
                    source={{ uri: "http://192.168.100.11:3000" + item.images[0].substring(1) }}
                    style={styles.image}
                />
                <View style={styles.establecimiento}>
                    <Text style={styles.establecimientoText}>{item.nombre}</Text>
                </View>
                <View style={styles.bottomBorder}></View>
                <View style={styles.establecimiento}>
                    <StarRating rating={item.resenas_calificacion}/>
                    <Text style={styles.establecimientoText2}>{item.ubicacion_general}</Text>
                </View>
                

            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
          <FlatList
            style={styles.flatlist}
            data={establecimientos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={establecimientoView}
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
        width: "100%", 
        height: 200,
    },
    bottomBorder: {
        width: '100%', // Cover the entire width
        height: 1, // Adjust the height as needed
        backgroundColor: 'white', // Color of the bottom border
      },
});

export default Screen1;
