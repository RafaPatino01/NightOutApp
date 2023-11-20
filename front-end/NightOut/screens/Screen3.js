import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Screen3 = () => {
  // User data defined in JSON format
  const nombre = "Rafael Patiño Goji";
  const correo = "rafapatino01@outlook.com";
  const tel = "2282544356";

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.imageContainer}>
          <Image source={require('../assets/user_icon.png')} style={styles.icon} />
        </View>
        <View style={styles.userDataContainer}>
            <View style={styles.item}>
              <Text style= {styles.boldValue} >{nombre}</Text>
            </View>
            <View style={styles.item}>
              <Text style= {styles.normalValue} >{correo}</Text>
            </View>
            <View style={styles.item}>
              <Text style= {styles.normalValue} >{tel}</Text>
            </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#EEE',
  },
  imageContainer: {
    flex: 1, // Half of the space
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDataContainer: {
    flex: 2, // The other half of the space
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
    textTransform: 'capitalize', // Capitalize the first letter
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  boldValue: {
    fontSize: 20,
    fontWeight: 'bold', // Make the value bold
    color: '#555',
  },
  normalValue: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    color: '#555',
  },
  icon: {
    width: 100, // Adjust as needed
    height: 100, // Adjust as needed
  },
});

export default Screen3;
