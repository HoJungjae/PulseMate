import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const GET_HEALTH_METRICS = gql`
  query GetVitals {
    getVitals {
      id
      type
      value
      timestamp
    }
  }
`;

const REMOVE_VITAL = gql`
  mutation RemoveVital($id: ID!) {
    removeVital(id: $id)
  }
`;

export default function HomeScreen() {
  const { loading, error, data } = useQuery(GET_HEALTH_METRICS);

  React.useEffect(() => {
    if (data) {
      console.log('Received data from getVitals:', data.getVitals);
    }
  }, [data]);

  const [removeVital] = useMutation(REMOVE_VITAL, {
    update(cache, { data }) {
      const removedId = data?.removeVital;
      if (!removedId) return;

      const existing = cache.readQuery({ query: GET_HEALTH_METRICS });
      if (!existing) return;

      cache.writeQuery({
        query: GET_HEALTH_METRICS,
        data: {
          getVitals: existing.getVitals.filter((v: any) => v.id !== removedId),
        },
      });
    },
    onError(err) {
      Alert.alert('Error', err.message);
    },
  });



  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  if (error) return <Text style={styles.error}>Error: {error.message}</Text>;

  const confirmRemove = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this vital?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeVital({ variables: { id } }) },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Health Metrics</Text>
      {data.getVitals.length === 0 && <Text>No vitals recorded.</Text>}
      {data.getVitals.map((metric: any) => (
        <View key={metric.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text>Type: {metric.type}</Text>
            <Text>Value: {metric.value}</Text>
            <Text>Timestamp: {new Date(metric.timestamp).toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => confirmRemove(metric.id)}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
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
  error: {
    color: 'red',
    textAlign: 'center',
  },
});
