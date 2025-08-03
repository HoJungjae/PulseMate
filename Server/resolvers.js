// Server/resolvers-simple.js (use this temporarily if you want to test without subscriptions)
const { v4: uuidv4 } = require('uuid');

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

// In-memory storage
let vitals = [
  {
    id: '1',
    type: 'HEART_RATE',
    value: 72,
    unit: 'bpm',
    status: 'NORMAL',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'TEMPERATURE',
    value: 36.5,
    unit: '°C',
    status: 'NORMAL',
    timestamp: new Date().toISOString(),
  },
];

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
    return alert;
  }
  return null;
}

const resolvers = {
  Query: {
    getVitals: (_, { type, patientId }) => {
      let filtered = vitals;
      if (type) filtered = filtered.filter(v => v.type === type);
      if (patientId) filtered = filtered.filter(v => v.patientId === patientId);
      console.log("Sending vitals:", filtered);
      return filtered;
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
  }
};

module.exports = resolvers;