// Server/resolvers.js
const { v4: uuidv4 } = require('uuid');
const { PubSub } = require('graphql-subscriptions');

const pubsub = new PubSub();

// Medical reference ranges
const VITAL_RANGES = {
  HEART_RATE: { min: 60, max: 100, criticalMin: 40, criticalMax: 150, unit: 'bpm' },
  BLOOD_PRESSURE_SYSTOLIC: { min: 90, max: 120, criticalMin: 70, criticalMax: 180, unit: 'mmHg' },
  BLOOD_PRESSURE_DIASTOLIC: { min: 60, max: 80, criticalMin: 40, criticalMax: 110, unit: 'mmHg' },
  TEMPERATURE: { min: 36.1, max: 37.2, criticalMin: 35.0, criticalMax: 40.0, unit: '°C' },
  OXYGEN_SATURATION: { min: 95, max: 100, criticalMin: 90, criticalMax: 100, unit: '%' },
  RESPIRATORY_RATE: { min: 12, max: 20, criticalMin: 8, criticalMax: 30, unit: 'breaths/min' },
  GLUCOSE_LEVEL: { min: 70, max: 140, criticalMin: 54, criticalMax: 240, unit: 'mg/dL' }
};

// In-memory storage (replace with database in production)
let vitals = [];
let alerts = [];

// Helper functions
function determineVitalStatus(type, value) {
  const range = VITAL_RANGES[type];
  if (!range) return 'NORMAL';
  
  if (value < range.criticalMin || value > range.criticalMax) {
    return 'CRITICAL';
  } else if (value < range.min || value > range.max) {
    return 'WARNING';
  }
  return 'NORMAL';
}

function createAlert(vitalReading) {
  const range = VITAL_RANGES[vitalReading.type];
  let severity, message;
  
  if (vitalReading.status === 'CRITICAL') {
    severity = 'CRITICAL';
    message = `Critical ${vitalReading.type.replace(/_/g, ' ').toLowerCase()}: ${vitalReading.value} ${vitalReading.unit}`;
  } else if (vitalReading.status === 'WARNING') {
    severity = 'HIGH';
    message = `Abnormal ${vitalReading.type.replace(/_/g, ' ').toLowerCase()}: ${vitalReading.value} ${vitalReading.unit}`;
  }
  
  if (severity) {
    const alert = {
      id: uuidv4(),
      vitalReading,
      severity,
      message,
      createdAt: new Date().toISOString(),
      acknowledged: false
    };
    alerts.push(alert);
    pubsub.publish('ALERT_CREATED', { alertCreated: alert });
    return alert;
  }
  return null;
}

function calculateTrend(dataPoints) {
  if (dataPoints.length < 2) return 'STABLE';
  
  const recent = dataPoints.slice(-10); // Last 10 readings
  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));
  
  const avgFirst = firstHalf.reduce((sum, dp) => sum + dp.value, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, dp) => sum + dp.value, 0) / secondHalf.length;
  
  const percentChange = ((avgSecond - avgFirst) / avgFirst) * 100;
  
  if (percentChange > 5) return 'INCREASING';
  if (percentChange < -5) return 'DECREASING';
  return 'STABLE';
}

const resolvers = {
  Query: {
    getVitals: (_, { type, patientId }) => {
      let filtered = vitals;
      if (type) filtered = filtered.filter(v => v.type === type);
      if (patientId) filtered = filtered.filter(v => v.patientId === patientId);
      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    
    getVitalTrends: (_, { type, timeRange, patientId }) => {
      const start = new Date(timeRange.start);
      const end = new Date(timeRange.end);
      
      let filtered = vitals.filter(v => 
        v.type === type &&
        new Date(v.timestamp) >= start &&
        new Date(v.timestamp) <= end
      );
      
      if (patientId) filtered = filtered.filter(v => v.patientId === patientId);
      
      if (filtered.length === 0) return null;
      
      const values = filtered.map(v => v.value);
      const dataPoints = filtered.map(v => ({
        timestamp: v.timestamp,
        value: v.value
      }));
      
      return {
        type,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        trend: calculateTrend(dataPoints),
        dataPoints
      };
    },
    
    getAlerts: (_, { patientId }) => {
      let filtered = alerts;
      if (patientId) {
        filtered = alerts.filter(a => a.vitalReading.patientId === patientId);
      }
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  
  Mutation: {
    addVital: (_, { input }) => {
      const range = VITAL_RANGES[input.type];
      const newVital = {
        id: uuidv4(),
        ...input,
        unit: input.unit || range.unit,
        status: determineVitalStatus(input.type, input.value),
        timestamp: new Date().toISOString(),
      };
      
      vitals.push(newVital);
      
      // Create alert if needed
      if (newVital.status !== 'NORMAL') {
        createAlert(newVital);
      }
      
      // Publish to subscribers
      pubsub.publish('VITAL_ADDED', { vitalAdded: newVital });
      
      return newVital;
    },
    
    removeVital: (_, { id }) => {
      const index = vitals.findIndex(v => v.id === id);
      if (index === -1) return null;
      vitals.splice(index, 1);
      return id;
    },
    
    acknowledgeAlert: (_, { alertId }) => {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return null;
      
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      return alert;
    }
  },
  
  Subscription: {
    vitalAdded: {
      subscribe: (_, { patientId }) => {
        if (patientId) {
          return pubsub.asyncIterator(['VITAL_ADDED']).filter(
            payload => payload.vitalAdded.patientId === patientId
          );
        }
        return pubsub.asyncIterator(['VITAL_ADDED']);
      }
    },
    
    alertCreated: {
      subscribe: (_, { patientId }) => {
        if (patientId) {
          return pubsub.asyncIterator(['ALERT_CREATED']).filter(
            payload => payload.alertCreated.vitalReading.patientId === patientId
          );
        }
        return pubsub.asyncIterator(['ALERT_CREATED']);
      }
    }
  }
};

module.exports = resolvers;