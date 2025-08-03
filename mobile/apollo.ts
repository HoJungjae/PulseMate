import { ApolloClient, InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getVitals: {
          // This helps Apollo merge arrays properly on cache updates:
          merge(existing = [], incoming: any[]) {
            return incoming;
          },
        },
      },
    },
    VitalReading: {
      keyFields: ['id'], // essential to uniquely identify vitals by 'id'
    },
  },
});

const client = new ApolloClient({
  uri: 'http://192.168.1.89:4000/graphql',
  cache,
});

export default client;
