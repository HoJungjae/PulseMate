const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type VitalReading {
    id: ID!
    type: String!
    value: Float!
    timestamp: String!
  }

  type Query {
    getVitals(type: String): [VitalReading]
  }

  type Mutation {
    addVital(type: String!, value: Float!): VitalReading
    removeVital(id: ID!): ID
  }

`;


module.exports = typeDefs;
