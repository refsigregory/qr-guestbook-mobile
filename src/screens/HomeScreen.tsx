import React, { useState } from 'react';
import { View, Alert, StyleSheet, Text, Button } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const HomeScreen: React.FC = () => {
  const [active, setActive] = useState(false);
  const [scanned, setScanned] = useState(false); // State to track if a code has been scanned
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async (codes) => {
      if (codes.length > 0 && !scanned) { // Check if not already scanned
        setScanned(true); // Mark as scanned
        const scannedCode = codes[0].value;
        console.log(`Scanned code: ${scannedCode}`);
        await logAccess(scannedCode || 'invalid');
      }
    },
  });

  const logAccess = async (accessCode: string) => {
    try {
      const res = await fetch('https://qr-guestbook.srv1.ref.si/api/logs/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const data = await res.json();
      Alert.alert('Selamat Datang', `${data.guest.name}: ${data.guest.description}`);
    } catch (error: any) {
      console.error('Error logging access:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setActive(false); // Deactivate camera after scanning
      setScanned(false); // Reset scanned state for future scans
    }
  };

  if (device == null) {
    return <Text>No Camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>
      <View style={styles.buttonTake}>
        <Button onPress={() => setActive(true)} title="Scan Sekarang" />
      </View>
      {
        active &&
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={active}
            codeScanner={codeScanner}
          />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    margin: 20,
  },
  buttonTake: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
});

export default HomeScreen;
