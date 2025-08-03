// Server/__tests__/resolvers.test.js
const { ApolloServer } = require('apollo-server-express');
const { createTestClient } = require('apollo-server-testing');
const typeDefs = require('../schema');
const resolvers = require('../resolvers');
const { gql } = require('apollo-server-express');

describe('Health Monitoring API Tests', () => {
  let server;
  let query;
  let mutate;

  beforeEach(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    const testClient = createTestClient(server);
    query = testClient.query;
    mutate = testClient.mutate;
  });

  describe('Vital Readings', () => {
    test('should add a vital reading with correct status', async () => {
      const ADD_VITAL = gql`
        mutation AddVital($input: VitalInput!) {
          addVital(input: $input) {
            id
            type
            value
            unit
            status
          }
        }
      `;

      // Test normal heart rate
      const normalResult = await mutate({
        mutation: ADD_VITAL,
        variables: {
          input: {
            type: 'HEART_RATE',
            value: 75,
            unit: 'bpm'
          }
        }
      });

      expect(normalResult.data.addVital.status).toBe('NORMAL');
      expect(normalResult.data.addVital.value).toBe(75);

      // Test critical heart rate
      const criticalResult = await mutate({
        mutation: ADD_VITAL,
        variables: {
          input: {
            type: 'HEART_RATE',
            value: 180,
            unit: 'bpm'
          }
        }
      });

      expect(criticalResult.data.addVital.status).toBe('CRITICAL');
    });

    test('should retrieve vitals filtered by type', async () => {
      const GET_VITALS = gql`
        query GetVitals($type: VitalType) {
          getVitals(type: $type) {
            id
            type
            value
          }
        }
      `;

      // Add multiple vitals
      await mutate({
        mutation: gql`
          mutation AddVital($input: VitalInput!) {
            addVital(input: $input) { id }
          }
        `,
        variables: {
          input: { type: 'HEART_RATE', value: 72, unit: 'bpm' }
        }
      });

      await mutate({
        mutation: gql`
          mutation AddVital($input: VitalInput!) {
            addVital(input: $input) { id }
          }
        `,
        variables: {
          input: { type: 'TEMPERATURE', value: 37.0, unit: '°C' }
        }
      });

      const result = await query({
        query: GET_VITALS,
        variables: { type: 'HEART_RATE' }
      });

      expect(result.data.getVitals).toHaveLength(1);
      expect(result.data.getVitals[0].type).toBe('HEART_RATE');
    });
  });

  describe('Alert Generation', () => {
    test('should create alert for critical vitals', async () => {
      // Add critical vital
      await mutate({
        mutation: gql`
          mutation AddVital($input: VitalInput!) {
            addVital(input: $input) { id }
          }
        `,
        variables: {
          input: {
            type: 'OXYGEN_SATURATION',
            value: 85,
            unit: '%'
          }
        }
      });

      const GET_ALERTS = gql`
        query GetAlerts {
          getAlerts {
            id
            severity
            message
          }
        }
      `;

      const result = await query({ query: GET_ALERTS });
      
      expect(result.data.getAlerts).toHaveLength(1);
      expect(result.data.getAlerts[0].severity).toBe('CRITICAL');
      expect(result.data.getAlerts[0].message).toContain('oxygen saturation');
    });
  });

  describe('Trend Analysis', () => {
    test('should calculate vital trends correctly', async () => {
      const now = new Date();
      
      // Add multiple readings over time
      for (let i = 0; i < 10; i++) {
        await mutate({
          mutation: gql`
            mutation AddVital($input: VitalInput!) {
              addVital(input: $input) { id }
            }
          `,
          variables: {
            input: {
              type: 'HEART_RATE',
              value: 70 + i * 2, // Increasing trend
              unit: 'bpm'
            }
          }
        });
      }

      const GET_TRENDS = gql`
        query GetTrends($type: VitalType!, $timeRange: TimeRange!) {
          getVitalTrends(type: $type, timeRange: $timeRange) {
            average
            min
            max
            trend
          }
        }
      `;

      const result = await query({
        query: GET_TRENDS,
        variables: {
          type: 'HEART_RATE',
          timeRange: {
            start: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
            end: now.toISOString()
          }
        }
      });

      expect(result.data.getVitalTrends.trend).toBe('INCREASING');
      expect(result.data.getVitalTrends.min).toBe(70);
      expect(result.data.getVitalTrends.max).toBe(88);
    });
  });
});