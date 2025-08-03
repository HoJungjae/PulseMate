# Patient Vital Signs Monitoring System

A real-time health monitoring application built with React Native, GraphQL, and Apollo, designed for healthcare professionals to track patient vital signs and receive critical alerts.

## 🏥 Overview

This project demonstrates a production-ready mobile health monitoring system that could be deployed in clinical settings. It showcases modern healthcare technology patterns including real-time data synchronization, medical-grade alert systems, and HIPAA-compliant architecture considerations.

## 🚀 Features

### Core Functionality
- **Real-time Vital Signs Monitoring**: Track heart rate, blood pressure, temperature, oxygen saturation, respiratory rate, and glucose levels
- **Intelligent Alert System**: Automatic alert generation based on medical reference ranges
- **GraphQL Subscriptions**: Live updates without polling
- **Trend Analysis**: Historical data visualization and trend detection
- **Multi-patient Support**: Designed for clinical environments with multiple patients
- **Device Integration Ready**: Architecture supports medical device integration

### Technical Highlights
- **Type-safe GraphQL API** with comprehensive schema
- **Real-time subscriptions** for instant updates
- **Optimistic UI updates** for better UX
- **Offline capability** with Apollo Cache
- **Comprehensive test suite** with medical validation
- **Performance optimized** for resource-constrained environments

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express
- **Apollo Server** for GraphQL API
- **GraphQL Subscriptions** for real-time updates
- **UUID** for unique identifiers
- **Jest** for testing

### Mobile (React Native)
- **Expo** for rapid development
- **Apollo Client** with reactive cache
- **TypeScript** for type safety
- **React Navigation** for routing
- **React Native Chart Kit** for data visualization

## 📋 Medical Reference Ranges

The system uses evidence-based medical reference ranges:

| Vital Sign | Normal Range | Critical Range |
|------------|--------------|----------------|
| Heart Rate | 60-100 bpm | <40 or >150 bpm |
| Systolic BP | 90-120 mmHg | <70 or >180 mmHg |
| Diastolic BP | 60-80 mmHg | <40 or >110 mmHg |
| Temperature | 36.1-37.2°C | <35 or >40°C |
| O2 Saturation | 95-100% | <90% |
| Respiratory Rate | 12-20 bpm | <8 or >30 bpm |
| Glucose | 70-140 mg/dL | <54 or >240 mg/dL |

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/health-monitoring-app.git
cd health-monitoring-app
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install mobile dependencies:
```bash
cd ../mobile
npm install
```

### Running the Application

1. Start the GraphQL server:
```bash
cd server
npm start
# Server runs on http://localhost:4000/graphql
```

2. Start the mobile app:
```bash
cd mobile
npx expo start
```

3. Update the GraphQL endpoint in `mobile/apollo.ts` with your local IP address

## 🧪 Testing

Run the comprehensive test suite:

```bash
cd server
npm test
```

Tests include:
- Vital sign validation
- Alert generation logic
- Trend analysis algorithms
- GraphQL resolver testing
- Integration tests

## 📊 GraphQL API

### Queries
```graphql
# Get all vitals with optional filtering
getVitals(type: VitalType, patientId: String): [VitalReading]

# Get vital trends over time
getVitalTrends(type: VitalType!, timeRange: TimeRange!, patientId: String): VitalTrend

# Get active alerts
getAlerts(patientId: String): [Alert]
```

### Mutations
```graphql
# Add new vital reading
addVital(input: VitalInput!): VitalReading

# Acknowledge alert
acknowledgeAlert(alertId: ID!): Alert
```

### Subscriptions
```graphql
# Subscribe to new vitals
vitalAdded(patientId: String): VitalReading

# Subscribe to alerts
alertCreated(patientId: String): Alert
```

## 🏗️ Architecture

### Backend Architecture
- **GraphQL Schema First**: Strongly typed API design
- **Pub/Sub Pattern**: For real-time subscriptions
- **In-Memory Storage**: Easily replaceable with database
- **Medical Logic Layer**: Encapsulated vital sign validation

### Mobile Architecture
- **Feature-based Structure**: Organized by clinical features
- **Apollo Cache**: Normalized cache for offline support
- **Reactive UI**: Subscription-based updates
- **Type Safety**: Full TypeScript coverage

## 🔒 Security Considerations

While this is a demonstration project, it's designed with healthcare security in mind:

- **Authentication Ready**: Auth middleware hooks in place
- **HIPAA Compliance Path**: Architecture supports encryption and audit logging
- **Patient Data Isolation**: Multi-tenancy support
- **Secure WebSocket**: For subscription transport

## 🚀 Future Enhancements

### Planned Features
- [ ] Biometric authentication
- [ ] End-to-end encryption
- [ ] Medical device Bluetooth integration
- [ ] Advanced analytics and ML predictions
- [ ] Clinical decision support system
- [ ] Multi-language support
- [ ] Dark mode for night shifts

### Integration Ready For
- Electronic Health Records (EHR) systems
- Medical device APIs (HL7 FHIR compatible)
- Hospital information systems
- Telemedicine platforms

## 📱 Screenshots

*[Add screenshots of your app here]*

## 🤝 Contributing

This project follows healthcare software best practices:
1. All medical logic must be validated against clinical standards
2. Tests required for all vital sign calculations
3. Code review required for alert logic changes
4. Documentation must be updated with code changes

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Medical reference ranges based on AHA and WHO guidelines
- Inspired by Philips patient monitoring systems
- Built with modern healthcare interoperability standards in mind

---

**Note**: This is a demonstration project showcasing technical capabilities for healthcare applications. It should not be used for actual patient care without proper medical device certification and regulatory approval.
