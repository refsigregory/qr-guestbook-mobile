import React from 'react';
import { View, Alert, StyleSheet, Text } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const HomeScreen: React.FC = () => {
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async (codes) => {
      if (codes.length > 0) {
        const scannedCode = codes[0].value;
        console.log(`Scanned code: ${scannedCode}`);
        await logAccess(scannedCode || 'invalid');
      }
    },
  });

  const logAccess = async (accessCode: string) => {
    try {
      const res = await fetch('https://qr-guestbook.srv1.ref.si/api/logs/add', { // Replace with your actual API URL
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
      Alert.alert('Success', `Halo ${data.guest.name}: ${data.guest.description}`);
    } catch (error: any) {
      console.error('Error logging access:', error.message);
      Alert.alert('Error', error.message);
    }
  };

  if (device == null) {
    return <Text>No Camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    margin: 20,
  },
});

export default HomeScreen;
