// Server/schema.js - Add subscription type
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type VitalReading {
    id: ID!
    type: String!
    value: Float!
    timestamp: String!
    unit: String!
    status: VitalStatus!
    deviceId: String
    patientId: String
  }

  enum VitalStatus {
    NORMAL
    WARNING
    CRITICAL
  }

  enum VitalType {
    HEART_RATE
    BLOOD_PRESSURE_SYSTOLIC
    BLOOD_PRESSURE_DIASTOLIC
    TEMPERATURE
    OXYGEN_SATURATION
    RESPIRATORY_RATE
    GLUCOSE_LEVEL
  }

  type Query {
    getVitals(type: VitalType, patientId: String): [VitalReading]
    getVitalTrends(type: VitalType!, timeRange: TimeRange!, patientId: String): VitalTrend
    getAlerts(patientId: String): [Alert]
  }

  type Mutation {
    addVital(input: VitalInput!): VitalReading
    removeVital(id: ID!): ID
    acknowledgeAlert(alertId: ID!): Alert
  }

  type Subscription {
    vitalAdded(patientId: String): VitalReading
    alertCreated(patientId: String): Alert
  }

  input VitalInput {
    type: VitalType!
    value: Float!
    unit: String!
    deviceId: String
    patientId: String
  }

  type VitalTrend {
    type: VitalType!
    average: Float!
    min: Float!
    max: Float!
    trend: TrendDirection!
    dataPoints: [TrendDataPoint]
  }

  type TrendDataPoint {
    timestamp: String!
    value: Float!
  }

  enum TrendDirection {
    INCREASING
    DECREASING
    STABLE
  }

  input TimeRange {
    start: String!
    end: String!
  }

  type Alert {
    id: ID!
    vitalReading: VitalReading!
    severity: AlertSeverity!
    message: String!
    createdAt: String!
    acknowledged: Boolean!
    acknowledgedAt: String
  }

  enum AlertSeverity {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }
`;

module.exports = typeDefs;