// mobile/components/AddVitalScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'expo-router';

const ADD_VITAL = gql`
  mutation AddVital($input: VitalInput!) {
    addVital(input: $input) {
      id
      type
      value
      unit
      status
      timestamp
    }
  }
`;

const GET_VITALS = gql`
  query GetVitals {
    getVitals {
      id
      type
      value
      unit
      status
      timestamp
    }
  }
`;

interface VitalType {
  type: string;
  label: string;
  unit: string;
  icon: string;
  placeholder: string;
  min: number;
  max: number;
}

const VITAL_TYPES: VitalType[] = [
  { 
    type: 'HEART_RATE', 
    label: 'Heart Rate', 
    unit: 'bpm', 
    icon: '❤️',
    placeholder: '60-100',
    min: 30,
    max: 200
  },
  { 
    type: 'BLOOD_PRESSURE_SYSTOLIC', 
    label: 'Blood Pressure (Systolic)', 
    unit: 'mmHg', 
    icon: '💉',
    placeholder: '90-120',
    min: 60,
    max: 200
  },
  { 
    type: 'BLOOD_PRESSURE_DIASTOLIC', 
    label: 'Blood Pressure (Diastolic)', 
    unit: 'mmHg', 
    icon: '💉',
    placeholder: '60-80',
    min: 40,
    max: 130
  },
  { 
    type: 'TEMPERATURE', 
    label: 'Temperature', 
    unit: '°C', 
    icon: '🌡️',
    placeholder: '36.1-37.2',
    min: 35,
    max: 42
  },
  { 
    type: 'OXYGEN_SATURATION', 
    label: 'Oxygen Saturation', 
    unit: '%', 
    icon: '💨',
    placeholder: '95-100',
    min: 70,
    max: 100
  },
  { 
    type: 'RESPIRATORY_RATE', 
    label: 'Respiratory Rate', 
    unit: 'breaths/min', 
    icon: '🫁',
    placeholder: '12-20',
    min: 5,
    max: 40
  },
  { 
    type: 'GLUCOSE_LEVEL', 
    label: 'Glucose Level', 
    unit: 'mg/dL', 
    icon: '🩸',
    placeholder: '70-140',
    min: 20,
    max: 400
  },
];

export default function AddVitalScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<VitalType>(VITAL_TYPES[0]);
  const [value, setValue] = useState('');
  const [deviceId, setDeviceId] = useState('');

  const [addVital, { loading }] = useMutation(ADD_VITAL, {
    update(cache, { data }) {
      const newVital = data?.addVital;
      if (!newVital) return;

      const existing = cache.readQuery({ query: GET_VITALS });
      if (existing) {
        cache.writeQuery({
          query: GET_VITALS,
          data: {
            getVitals: [newVital, ...existing.getVitals],
          },
        });
      }
    },
    onCompleted: () => {
      Alert.alert(
        'Success',
        'Vital reading added successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    
    if (!value || isNaN(numValue)) {
      Alert.alert('Error', 'Please enter a valid numeric value');
      return;
    }

    if (numValue < selectedType.min || numValue > selectedType.max) {
      Alert.alert(
        'Warning', 
        `Value seems unusual for ${selectedType.label}. Normal range is ${selectedType.placeholder} ${selectedType.unit}. Continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: submitVital }
        ]
      );
      return;
    }

    submitVital();
  };

  const submitVital = () => {
    addVital({
      variables: {
        input: {
          type: selectedType.type,
          value: parseFloat(value),
          unit: selectedType.unit,
          deviceId: deviceId || undefined,
        },
      },
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Vital Reading</Text>
          <Text style={styles.subtitle}>Record a new health measurement</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Vital Type</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.typeSelector}
          >
            {VITAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.type}
                style={[
                  styles.typeCard,
                  selectedType.type === type.type && styles.typeCardSelected
                ]}
                onPress={() => {
                  setSelectedType(type);
                  setValue('');
                }}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  selectedType.type === type.type && styles.typeLabelSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Value</Text>
            <View style={styles.valueInputContainer}>
              <TextInput
                style={styles.valueInput}
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
                placeholder={selectedType.placeholder}
                placeholderTextColor="#6c757d"
              />
              <Text style={styles.unitText}>{selectedType.unit}</Text>
            </View>
            <Text style={styles.hint}>
              Normal range: {selectedType.placeholder} {selectedType.unit}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Device ID (Optional)</Text>
            <TextInput
              style={styles.input}
              value={deviceId}
              onChangeText={setDeviceId}
              placeholder="e.g., Device-001"
              placeholderTextColor="#6c757d"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding...' : 'Add Vital Reading'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  typeSelector: {
    marginBottom: 24,
  },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  typeCardSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  valueInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#212529',
  },
  unitText: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212529',
  },
  hint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});