// mobile/app/(tabs)/index.tsx
import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';

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

const REMOVE_VITAL = gql`
  mutation RemoveVital($id: ID!) {
    removeVital(id: $id)
  }
`;

interface VitalReading {
  id: string;
  type: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

const VitalCard: React.FC<{ vital: VitalReading; onRemove: (id: string) => void }> = ({ vital, onRemove }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return '#e63946';
      case 'WARNING': return '#f77f00';
      case 'NORMAL': return '#06d6a0';
      default: return '#6c757d';
    }
  };

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'HEART_RATE': return '❤️';
      case 'TEMPERATURE': return '🌡️';
      case 'BLOOD_PRESSURE_SYSTOLIC':
      case 'BLOOD_PRESSURE_DIASTOLIC': return '💉';
      case 'OXYGEN_SATURATION': return '💨';
      case 'RESPIRATORY_RATE': return '🫁';
      case 'GLUCOSE_LEVEL': return '🩸';
      default: return '📊';
    }
  };

  const formatVitalType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase();
  };

  return (
    <View style={[styles.vitalCard, { borderLeftColor: getStatusColor(vital.status) }]}>
      <View style={styles.vitalHeader}>
        <Text style={styles.vitalIcon}>{getVitalIcon(vital.type)}</Text>
        <Text style={styles.vitalType}>{formatVitalType(vital.type)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vital.status) }]}>
          <Text style={styles.statusText}>{vital.status}</Text>
        </View>
      </View>
      <View style={styles.vitalContent}>
        <Text style={styles.vitalValue}>{vital.value}</Text>
        <Text style={styles.vitalUnit}>{vital.unit}</Text>
      </View>
      <View style={styles.vitalFooter}>
        <Text style={styles.timestamp}>
          {new Date(vital.timestamp).toLocaleString()}
        </Text>
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => onRemove(vital.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  
  const { loading, error, data, refetch } = useQuery(GET_VITALS, {
    pollInterval: 30000, // Poll every 30 seconds
  });

  const [removeVital] = useMutation(REMOVE_VITAL, {
    update(cache, { data }) {
      const removedId = data?.removeVital;
      if (!removedId) return;

      const existing = cache.readQuery({ query: GET_VITALS });
      if (!existing) return;

      cache.writeQuery({
        query: GET_VITALS,
        data: {
          getVitals: existing.getVitals.filter((v: any) => v.id !== removedId),
        },
      });
    },
    onError(err) {
      Alert.alert('Error', err.message);
    },
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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

  if (loading && !data) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Error: {error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vitals = data?.getVitals || [];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Vital Signs Monitor</Text>
        <Text style={styles.subtitle}>Real-time Health Tracking</Text>
      </View>

      {vitals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No vitals recorded yet</Text>
          <Text style={styles.emptySubtext}>Add a vital reading from the Add tab</Text>
        </View>
      ) : (
        <View style={styles.vitalsContainer}>
          {vitals.map((vital: VitalReading) => (
            <VitalCard key={vital.id} vital={vital} onRemove={confirmRemove} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
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
  vitalsContainer: {
    padding: 16,
  },
  vitalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vitalIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  vitalType: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
    flex: 1,
    color: '#495057',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  vitalContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  vitalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#212529',
  },
  vitalUnit: {
    fontSize: 18,
    color: '#6c757d',
    marginLeft: 8,
  },
  vitalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  error: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});