# PulseMate - Patient Vital Signs Monitoring System

A professional-grade health monitoring application built with React Native, GraphQL, and Apollo, designed for healthcare professionals to track patient vital signs and receive critical alerts in real-time.

## 🏥 Overview

PulseMate is a production-ready mobile health monitoring system that demonstrates modern healthcare technology patterns. Built with the same technologies used in enterprise medical systems, it showcases real-time data synchronization, medical-grade alert systems, and architecture designed for HIPAA compliance. This project was developed to demonstrate expertise in healthcare software development, particularly for mobile patient monitoring solutions.

## 🚀 Features

### Core Medical Functionality
- **Real-time Vital Signs Monitoring**: Track 7 essential vital signs with automatic status calculation
- **Intelligent Alert System**: Automatic generation of alerts based on evidence-based medical reference ranges
- **Medical-Grade Validation**: Input validation with warnings for abnormal values
- **Professional Healthcare UI**: Color-coded status indicators (Normal/Warning/Critical) for quick assessment
- **Multi-patient Architecture**: Designed for clinical environments with patient and device tracking capabilities
- **Trend Analysis Ready**: Data structure supports historical analysis and predictive insights

### Vital Signs Supported
- ❤️ Heart Rate (bpm)
- 💉 Blood Pressure (Systolic/Diastolic)
- 🌡️ Body Temperature
- 💨 Oxygen Saturation (SpO2)
- 🫁 Respiratory Rate
- 🩸 Glucose Level

### Technical Highlights
- **GraphQL API** with type-safe schema and comprehensive resolvers
- **Real-time Updates** using polling with WebSocket subscription support
- **Optimistic UI Updates** for responsive user experience
- **Apollo Client Cache** for offline capability
- **TypeScript** for end-to-end type safety
- **Professional Medical UI/UX** with intuitive vital selection and input
- **Comprehensive Error Handling** with user-friendly alerts

## 🛠️ Technology Stack

### Backend (Node.js)
- **Apollo Server Express** - GraphQL server with enterprise features
- **GraphQL** - Flexible and efficient data querying
- **UUID** - Unique identifier generation
- **Express** - Web application framework
- **CORS** - Cross-origin resource sharing

### Mobile (React Native / Expo)
- **Expo** - Rapid development and deployment
- **Apollo Client** - GraphQL client with intelligent caching
- **TypeScript** - Static typing for reliability
- **React Navigation** - Native navigation patterns
- **React Native** - Cross-platform mobile development

### Development Tools
- **Nodemon** - Auto-reloading during development
- **Jest** - Testing framework (ready for implementation)
- **ESLint** - Code quality and consistency

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
git clone https://github.com/yourusername/PulseMate.git
cd PulseMate
```

2. Install server dependencies:
```bash
cd Server
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
cd Server
npm start
# Server runs on http://localhost:4000/graphql
```

2. Update the server URL in `mobile/apollo.ts`:
```typescript
// Replace with your local IP address
uri: 'http://YOUR_LOCAL_IP:4000/graphql'
```

3. Start the mobile app:
```bash
cd mobile
npx expo start
# Press 'i' for iOS or 'a' for Android
```

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

### Available Queries
```graphql
# Get all vital readings with optional filtering
query GetVitals {
  getVitals {
    id
    type
    value
    unit
    status
    timestamp
    deviceId
    patientId
  }
}

# Get active alerts
query GetAlerts {
  getAlerts {
    id
    severity
    message
    createdAt
    acknowledged
  }
}
```

### Available Mutations
```graphql
# Add a new vital reading
mutation AddVital($input: VitalInput!) {
  addVital(input: $input) {
    id
    type
    value
    unit
    status
    timestamp
  }
}

# Remove a vital reading
mutation RemoveVital($id: ID!) {
  removeVital(id: $id)
}

# Acknowledge an alert
mutation AcknowledgeAlert($alertId: ID!) {
  acknowledgeAlert(alertId: $alertId) {
    id
    acknowledged
  }
}
```

### Input Types
```graphql
input VitalInput {
  type: VitalType!
  value: Float!
  unit: String!
  deviceId: String
  patientId: String
}
```

## 🏗️ Architecture

### Backend Architecture
- **GraphQL Schema-First Design**: Strongly typed API with clear contracts
- **Medical Logic Layer**: Encapsulated validation and alert generation
- **Stateless Design**: Ready for horizontal scaling
- **Extensible Structure**: Easy to add new vital types and validation rules

### Mobile Architecture
- **Component-Based Structure**: Reusable UI components
- **Apollo Cache Management**: Normalized cache with optimistic updates
- **Type-Safe Development**: Full TypeScript coverage
- **Responsive Design**: Adapts to different screen sizes and orientations

### Data Flow
1. User inputs vital reading through intuitive UI
2. Client validates input and shows warnings for abnormal values
3. Server performs medical-grade validation
4. Automatic alert generation for critical values
5. Real-time UI updates via Apollo Cache
6. Push notifications ready for critical alerts

## 🔒 Security & Compliance Considerations

This demonstration project is designed with healthcare security principles:

- **Patient Data Isolation**: Architecture supports multi-tenancy
- **Audit Trail Ready**: All mutations can be logged
- **Secure Communication**: HTTPS/WSS ready
- **Input Validation**: Both client and server-side validation
- **Error Handling**: No sensitive data in error messages

## 📱 UI/UX Features

- **Color-Coded Status**: Instant visual assessment (Green/Yellow/Red)
- **Medical Icons**: Intuitive vital type recognition
- **Smart Input**: Keyboard optimized for numeric entry
- **Contextual Help**: Normal ranges displayed during input
- **Confirmation Dialogs**: Prevent accidental deletions
- **Pull-to-Refresh**: Manual data synchronization
- **Empty States**: Clear guidance for new users
- **Error Recovery**: Retry mechanisms for network issues

## 🚀 Future Enhancements

### Planned Features
- [ ] Real-time GraphQL subscriptions for instant updates
- [ ] Historical trend charts and analytics
- [ ] Bluetooth integration for medical devices
- [ ] Biometric authentication (Face ID/Touch ID)
- [ ] Push notifications for critical alerts
- [ ] Dark mode for night shift staff
- [ ] Export data in HL7 FHIR format
- [ ] Multi-language support
- [ ] Offline data sync
- [ ] Advanced analytics with ML predictions

### Integration Opportunities
- Electronic Health Records (EHR) systems
- Medical device APIs (Bluetooth LE)
- Hospital Information Systems (HIS)
- Telemedicine platforms
- Clinical Decision Support Systems

## 🧪 Testing

The project includes a comprehensive test structure:

```bash
cd Server
npm test
```

Test coverage includes:
- Vital sign validation logic
- Alert generation rules
- GraphQL resolver functions
- Medical reference range calculations

## 🤝 Contributing

This project demonstrates healthcare software best practices:

1. Medical logic must be validated against clinical standards
2. All vital calculations require test coverage
3. UI changes must maintain accessibility standards
4. Documentation updates required with code changes
5. Follow medical software coding standards

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Medical reference ranges based on AHA (American Heart Association) and WHO guidelines
- Inspired by enterprise patient monitoring systems
- Built following healthcare interoperability standards
- UI/UX patterns from clinical software best practices

---

**⚠️ Disclaimer**: This is a demonstration project showcasing technical capabilities for healthcare application development. It is not certified for actual patient care and should not be used for medical purposes without proper regulatory approval and medical device certification.

**👨‍💻 Developer Note**: This project was created to demonstrate proficiency in healthcare mobile development, particularly showcasing skills relevant to patient monitoring systems used in clinical environments.