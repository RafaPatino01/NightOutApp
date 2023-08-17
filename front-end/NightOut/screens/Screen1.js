import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import axios from 'axios'; 

const Screen1 = () => {
    const [data, setData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://192.168.100.94:3000/example');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    console.log('Data:', data); // Debug: Check the value of data

    return (
        <ScrollView contentContainerStyle={styles.container}>
            
            {Object.values(data).map((item, index) => (
                <View key={index} style={styles.item}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Image source={{ uri: item.url }} style={styles.image} />
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
      paddingTop: 90,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f2f2f2',
    },
    title: {
        fontSize: 20,
    },
    item: {
      backgroundColor: 'white',
      marginBottom: 20,
      padding: 10,
      borderWidth: 0,
      borderColor: '#ccc',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '90%',
      height: 200,
      resizeMode: 'cover', // Adjust the image's resizeMode as needed
    },
});

export default Screen1;
