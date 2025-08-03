import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { gql, useMutation } from '@apollo/client';
import { GET_VITALS } from './HealthScreen';  // confirm this path!

const ADD_VITAL = gql`
  mutation AddVital($type: String!, $value: Float!) {
    addVital(type: $type, value: $value) {
      id
      type
      value
      timestamp
    }
  }
`;

export default function AddVitalScreen() {
  const [type, setType] = useState('');
  const [value, setValue] = useState('');

  const [addVital, { loading, error }] = useMutation(ADD_VITAL, {
    update(cache, { data: { addVital } }) {
      try {
        const existingVitals: any = cache.readQuery({ query: GET_VITALS });
        cache.writeQuery({
          query: GET_VITALS,
          data: {
            getVitals: [addVital, ...(existingVitals?.getVitals || [])],
          },
        });
      } catch (e) {
        // If cache read fails, just ignore or log it
        console.log('Cache update error:', e);
      }
    },
    onCompleted: () => {
      Alert.alert('Success', 'Vital added!');
      setType('');
      setValue('');
    },
    onError: (err) => {
      Alert.alert('Error', err.message);
    },
  });

  const handleSubmit = () => {
    const valueFloat = parseFloat(value);
    if (!type.trim() || isNaN(valueFloat)) {
      Alert.alert('Error', 'Please enter a valid type and numeric value.');
      return;
    }
    console.log('Adding vital:', { type, value: valueFloat });
    addVital({ variables: { type, value: valueFloat } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vital Type (e.g., heartRate)</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="Type"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Value</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Value"
        keyboardType="numeric"
      />
      {error && <Text style={styles.error}>Error: {error.message}</Text>}
      <Button
        title={loading ? 'Submitting...' : 'Add Vital'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  label: { marginBottom: 4, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    marginBottom: 16,
    padding: 8,
  },
  error: { color: 'red', marginBottom: 8 },
});
