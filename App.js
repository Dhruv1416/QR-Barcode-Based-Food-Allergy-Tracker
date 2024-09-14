import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import axios from 'axios';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [allergenInfo, setAllergenInfo] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    try {
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      if (response.data.product) {
        const allergens = response.data.product.allergens_tags;
        setAllergenInfo(allergens.join('\n'));
      } else {
        setAllergenInfo('No allergen information found.');
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      setAllergenInfo('Error fetching product data.');
    }
  };

  const switchCamera = () => {
    setCameraType(prevCameraType =>
      prevCameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const resetScan = () => {
    setScanned(false);
    setAllergenInfo(null);
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={cameraType}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cameraButton} onPress={switchCamera}>
            <Text style={styles.cameraButtonText}>Switch Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
      <View style={styles.bottomContainer}>
        <Text style={styles.scannedText}>{scanned ? 'Scanned!' : ''}</Text>
        {scanned && (
          <View style={styles.allergenInfoContainer}>
            <Text style={styles.allergenInfoText}>{allergenInfo}</Text>
          </View>
        )}
        <Button title="Scan Again" onPress={resetScan} disabled={!scanned} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  cameraButton: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  cameraButtonText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'white',
  },
  bottomContainer: {
    flex: 0.3,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannedText: {
    fontSize: 20,
    marginBottom: 10,
  },
  allergenInfoContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  allergenInfoText: {
    fontSize: 16,
  },
});
