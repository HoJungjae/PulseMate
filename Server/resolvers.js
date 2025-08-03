const { v4: uuidv4 } = require('uuid');
let vitals = [
  {
    id: '1',
    type: 'heartRate',
    value: 72,
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'temperature',
    value: 36.5,
    timestamp: new Date().toISOString(),
  },
];

const resolvers = {
  Query: {
    getVitals: (_, { type }) => {
      const filtered = type ? vitals.filter(v => v.type === type) : vitals;
      console.log("Sending vitals:", filtered);
      return filtered;
    }
  },
  Mutation: {
    addVital: (_, { type, value }) => {
      const newVital = {
        id: uuidv4(),
        type,
        value,
        timestamp: new Date().toISOString(),
      };
      vitals.push(newVital);
      return newVital;
    },
    removeVital: (_, { id }) => {
    const index = vitals.findIndex(v => v.id === id);
    if (index === -1) return null;
    vitals.splice(index, 1);
    return id;
    },
  }
};

module.exports = resolvers;
