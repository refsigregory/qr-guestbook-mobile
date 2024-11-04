import React, { useState } from 'react';
import { View, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';

const HomeScreen: React.FC = () => {
  const [active, setActive] = useState(false);
  const [selectedType, setType] = useState('CheckIn');
  const [scanned, setScanned] = useState(false); // State to track if a code has been scanned
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: async (codes) => {
      if (codes.length > 0 && !scanned) { // Check if not already scanned
        setScanned(true); // Mark as scanned
        const scannedCode = codes[0].value;
        console.log(`Scanned code: ${scannedCode}`);
        await logAccess(scannedCode || 'invalid', selectedType);
      }
    },
  });

  const logAccess = async (accessCode: string, type: string) => {
    try {
      const res = await fetch('https://qr-guestbook.srv1.ref.si/api/logs/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessCode,
          status: type,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      interface ResponseApi {
        message: string
        data: any
      }

      const response: ResponseApi = await res.json();
      Alert.alert(`Halo ${response.data.guest.name}`, response.message);
    } catch (error: any) {
      Alert.alert('Message', error?.message ?? 'Something was wrong');
    } finally {
      setActive(false); // Deactivate camera after scanning
      setScanned(false); // Reset scanned state for future scans
    }
  };

  const handleClick = (type: string) => {
    setActive(true);
    setType(type);
  };

  if (device == null) {
    return <Text>No Camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}><Icon name="qr-code" color="#000" size={18} /> Scan QR Code</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => handleClick('CheckIn')} style={styles.button}>
          <Icon name="log-in" color="#fff" size={80} />
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleClick('CheckOut')} style={styles.button}>
          <Icon name="log-out" color="#fff" size={80} />
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    margin: 20,
  },
  buttonContainer: {
    marginTop: '30%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    backgroundColor: '#3B82F6',
    width: 300,
    borderRadius: 30,
    flexDirection: 'row',
    padding: 20,
    color: '#ffffff',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
