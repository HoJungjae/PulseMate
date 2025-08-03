import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { gql, useQuery, useMutation } from '@apollo/client';

// Define GET_VITALS query here
export const GET_VITALS = gql`
  query GetVitals {
    getVitals {
      id
      type
      value
      timestamp
    }
  }
`;


// Define REMOVE_VITAL mutation here
const REMOVE_VITAL = gql`
  mutation RemoveVital($id: ID!) {
    removeVital(id: $id)
  }
`;

export default function HealthScreen() {
  const { loading, error, data } = useQuery(GET_VITALS);

  
  const [removeVital] = useMutation(REMOVE_VITAL, {
    update(cache, { data: { removeVital: removedId } }) {
      const existingVitals: any = cache.readQuery({ query: GET_VITALS });
      if (existingVitals?.getVitals) {
        cache.writeQuery({
          query: GET_VITALS,
          data: {
            getVitals: existingVitals.getVitals.filter((v: any) => v.id !== removedId),
          },
        });
      }
    },
    onError(err) {
      Alert.alert('Error', err.message);
    },
  });


  if (loading)
    return <ActivityIndicator style={styles.centered} size="large" />;
  if (error) return <Text style={styles.error}>Error: {error.message}</Text>;

  if (!data?.getVitals?.length) return <Text>No vitals found.</Text>;

  const handleRemove = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this vital?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeVital({ variables: { id } }),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Health Metrics</Text>
      {data.getVitals.map((metric: any) => (
        <View key={metric.id} style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.type}>Type: {metric.type}</Text>
              <Text>Value: {metric.value}</Text>
              <Text>
                Timestamp: {new Date(metric.timestamp).toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(metric.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  removeButton: {
    backgroundColor: '#e63946',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: { color: 'red', textAlign: 'center' },
});
