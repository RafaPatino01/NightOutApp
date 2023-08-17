import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Screen4 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Screen 4 Content</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Screen4;
