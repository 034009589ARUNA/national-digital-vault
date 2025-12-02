import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';

const API_BASE_URL = 'http://localhost:5000/api'; // Change to your backend URL

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [hashInput, setHashInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [cachedHashes, setCachedHashes] = useState([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      loadCachedHashes();
    })();
  }, []);

  const loadCachedHashes = async () => {
    try {
      const cached = await AsyncStorage.getItem('verifiedHashes');
      if (cached) {
        setCachedHashes(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error loading cached hashes:', error);
    }
  };

  const verifyHash = async (hash) => {
    try {
      // Try online verification first
      const response = await axios.get(`${API_BASE_URL}/verify/hash/${hash}`);
      
      if (response.data.verified) {
        // Cache the verified hash
        const newCached = [...cachedHashes, { hash, verified: true, timestamp: new Date().toISOString() }];
        setCachedHashes(newCached);
        await AsyncStorage.setItem('verifiedHashes', JSON.stringify(newCached));
        setIsOffline(false);
        return response.data;
      }
    } catch (error) {
      console.error('Online verification failed:', error);
      setIsOffline(true);
      
      // Try offline verification from cache
      const cached = cachedHashes.find(h => h.hash === hash);
      if (cached && cached.verified) {
        return {
          verified: true,
          offline: true,
          message: 'Verified from cached data (offline mode)'
        };
      }
    }
    
    return { verified: false, message: 'Document not found or not verified' };
  };

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    
    // Extract hash from QR code data (could be URL or direct hash)
    let hash = data;
    if (data.includes('/verify/')) {
      hash = data.split('/verify/')[1];
    }
    
    const result = await verifyHash(hash);
    setVerificationResult(result);
  };

  const handleManualVerify = async () => {
    if (!hashInput.trim()) {
      Alert.alert('Error', 'Please enter a document hash');
      return;
    }
    
    const result = await verifyHash(hashInput.trim());
    setVerificationResult(result);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.title}>🏛️ Document Vault</Text>
        <Text style={styles.subtitle}>Offline Verification App</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scan QR Code</Text>
        <Camera
          style={styles.camera}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeTypes={['qr']}
        />
        {scanned && (
          <Button title="Tap to Scan Again" onPress={() => { setScanned(false); setVerificationResult(null); }} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Or Enter Hash Manually</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter document hash"
          value={hashInput}
          onChangeText={setHashInput}
        />
        <Button title="Verify" onPress={handleManualVerify} />
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>⚠️ Offline Mode - Using cached data</Text>
        </View>
      )}

      {verificationResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Verification Result</Text>
          <View style={[styles.resultBox, verificationResult.verified ? styles.verified : styles.notVerified]}>
            <Text style={styles.resultStatus}>
              {verificationResult.verified ? '✅ VERIFIED' : '❌ NOT VERIFIED'}
            </Text>
            {verificationResult.offline && (
              <Text style={styles.offlineNote}>Verified from cache (offline)</Text>
            )}
            {verificationResult.document && (
              <View style={styles.documentInfo}>
                <Text>Document: {verificationResult.document.filename}</Text>
                <Text>Hash: {verificationResult.document.hash.substring(0, 20)}...</Text>
                <Text>Transaction: {verificationResult.document.txHash.substring(0, 20)}...</Text>
              </View>
            )}
            {verificationResult.message && (
              <Text style={styles.message}>{verificationResult.message}</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cached Hashes ({cachedHashes.length})</Text>
        {cachedHashes.length === 0 ? (
          <Text style={styles.emptyText}>No cached verifications</Text>
        ) : (
          cachedHashes.slice(-5).map((item, index) => (
            <View key={index} style={styles.cachedItem}>
              <Text style={styles.cachedHash}>{item.hash.substring(0, 20)}...</Text>
              <Text style={styles.cachedDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    margin: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  camera: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#ffc107',
    padding: 10,
    margin: 20,
    borderRadius: 8,
  },
  offlineText: {
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
  resultContainer: {
    margin: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  resultBox: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  verified: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  notVerified: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  resultStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  offlineNote: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  documentInfo: {
    marginTop: 10,
  },
  message: {
    marginTop: 10,
    fontSize: 14,
  },
  cachedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cachedHash: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  cachedDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});

