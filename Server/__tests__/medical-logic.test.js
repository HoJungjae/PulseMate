// Server/__tests__/medical-logic.test.js
const { v4: uuidv4 } = require('uuid');

// Medical reference ranges from your resolver
const VITAL_RANGES = {
  HEART_RATE: { min: 60, max: 100, criticalMin: 40, criticalMax: 150, unit: 'bpm' },
  BLOOD_PRESSURE_SYSTOLIC: { min: 90, max: 120, criticalMin: 70, criticalMax: 180, unit: 'mmHg' },
  BLOOD_PRESSURE_DIASTOLIC: { min: 60, max: 80, criticalMin: 40, criticalMax: 110, unit: 'mmHg' },
  TEMPERATURE: { min: 36.1, max: 37.2, criticalMin: 35.0, criticalMax: 40.0, unit: '°C' },
  OXYGEN_SATURATION: { min: 95, max: 100, criticalMin: 90, criticalMax: 100, unit: '%' },
  RESPIRATORY_RATE: { min: 12, max: 20, criticalMin: 8, criticalMax: 30, unit: 'breaths/min' },
  GLUCOSE_LEVEL: { min: 70, max: 140, criticalMin: 54, criticalMax: 240, unit: 'mg/dL' }
};

// Copy the helper functions from your resolver to test them
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

describe('Medical Logic Tests', () => {
  describe('Vital Status Determination', () => {
    test('should return NORMAL for values within normal range', () => {
      expect(determineVitalStatus('HEART_RATE', 75)).toBe('NORMAL');
      expect(determineVitalStatus('TEMPERATURE', 36.8)).toBe('NORMAL');
      expect(determineVitalStatus('OXYGEN_SATURATION', 98)).toBe('NORMAL');
    });

    test('should return WARNING for values outside normal but within critical range', () => {
      expect(determineVitalStatus('HEART_RATE', 105)).toBe('WARNING');
      expect(determineVitalStatus('HEART_RATE', 55)).toBe('WARNING');
      expect(determineVitalStatus('TEMPERATURE', 37.8)).toBe('WARNING');
      expect(determineVitalStatus('OXYGEN_SATURATION', 93)).toBe('WARNING');
    });

    test('should return CRITICAL for values outside critical range', () => {
      expect(determineVitalStatus('HEART_RATE', 35)).toBe('CRITICAL');
      expect(determineVitalStatus('HEART_RATE', 160)).toBe('CRITICAL');
      expect(determineVitalStatus('TEMPERATURE', 41)).toBe('CRITICAL');
      expect(determineVitalStatus('OXYGEN_SATURATION', 85)).toBe('CRITICAL');
    });

    test('should handle unknown vital types', () => {
      expect(determineVitalStatus('UNKNOWN_TYPE', 100)).toBe('NORMAL');
    });
  });

  describe('Vital Ranges Validation', () => {
    test('all vital types should have valid ranges', () => {
      Object.entries(VITAL_RANGES).forEach(([type, range]) => {
        expect(range.min).toBeLessThan(range.max);
        expect(range.criticalMin).toBeLessThan(range.min);
        // Special case: Oxygen saturation can't exceed 100%
        if (type === 'OXYGEN_SATURATION') {
          expect(range.criticalMax).toBeGreaterThanOrEqual(range.max);
        } else {
          expect(range.criticalMax).toBeGreaterThan(range.max);
        }
        expect(range.unit).toBeTruthy();
      });
    });

    test('critical ranges should encompass normal ranges', () => {
      Object.entries(VITAL_RANGES).forEach(([type, range]) => {
        expect(range.criticalMin).toBeLessThanOrEqual(range.min);
        expect(range.criticalMax).toBeGreaterThanOrEqual(range.max);
      });
    });

    test('oxygen saturation has special upper limit', () => {
      const o2Range = VITAL_RANGES.OXYGEN_SATURATION;
      expect(o2Range.max).toBe(100);
      expect(o2Range.criticalMax).toBe(100);
      // But it can go critically low
      expect(o2Range.criticalMin).toBeLessThan(o2Range.min);
    });
  });

  describe('Edge Cases', () => {
    test('should handle boundary values correctly', () => {
      // Test exact boundary values
      expect(determineVitalStatus('HEART_RATE', 60)).toBe('NORMAL'); // min normal
      expect(determineVitalStatus('HEART_RATE', 100)).toBe('NORMAL'); // max normal
      expect(determineVitalStatus('HEART_RATE', 40)).toBe('WARNING'); // at critical min boundary
      expect(determineVitalStatus('HEART_RATE', 150)).toBe('WARNING'); // at critical max boundary
      expect(determineVitalStatus('HEART_RATE', 39)).toBe('CRITICAL'); // below critical min
      expect(determineVitalStatus('HEART_RATE', 151)).toBe('CRITICAL'); // above critical max
    });

    test('should handle decimal values for temperature', () => {
      expect(determineVitalStatus('TEMPERATURE', 36.1)).toBe('NORMAL');
      expect(determineVitalStatus('TEMPERATURE', 37.2)).toBe('NORMAL');
      expect(determineVitalStatus('TEMPERATURE', 37.3)).toBe('WARNING');
      expect(determineVitalStatus('TEMPERATURE', 34.9)).toBe('CRITICAL');
    });
  });
});

describe('Alert Generation Logic', () => {
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
      return {
        id: uuidv4(),
        vitalReading,
        severity,
        message,
        createdAt: new Date().toISOString(),
        acknowledged: false
      };
    }
    return null;
  }

  test('should create critical alert for critical vitals', () => {
    const criticalVital = {
      type: 'HEART_RATE',
      value: 180,
      unit: 'bpm',
      status: 'CRITICAL'
    };

    const alert = createAlert(criticalVital);
    expect(alert).toBeTruthy();
    expect(alert.severity).toBe('CRITICAL');
    expect(alert.message).toContain('Critical heart rate');
    expect(alert.message).toContain('180 bpm');
  });

  test('should create high severity alert for warning vitals', () => {
    const warningVital = {
      type: 'TEMPERATURE',
      value: 38.5,
      unit: '°C',
      status: 'WARNING'
    };

    const alert = createAlert(warningVital);
    expect(alert).toBeTruthy();
    expect(alert.severity).toBe('HIGH');
    expect(alert.message).toContain('Abnormal temperature');
  });

  test('should not create alert for normal vitals', () => {
    const normalVital = {
      type: 'HEART_RATE',
      value: 72,
      unit: 'bpm',
      status: 'NORMAL'
    };

    const alert = createAlert(normalVital);
    expect(alert).toBeNull();
  });
});

describe('Trend Analysis', () => {
  function calculateTrend(dataPoints) {
    if (dataPoints.length < 2) return 'STABLE';
    
    const recent = dataPoints.slice(-10);
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const avgFirst = firstHalf.reduce((sum, dp) => sum + dp.value, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, dp) => sum + dp.value, 0) / secondHalf.length;
    
    const percentChange = ((avgSecond - avgFirst) / avgFirst) * 100;
    
    if (percentChange > 5) return 'INCREASING';
    if (percentChange < -5) return 'DECREASING';
    return 'STABLE';
  }

  test('should detect increasing trend', () => {
    const dataPoints = [
      { value: 70 }, { value: 72 }, { value: 74 },
      { value: 76 }, { value: 78 }, { value: 80 }
    ];
    expect(calculateTrend(dataPoints)).toBe('INCREASING');
  });

  test('should detect decreasing trend', () => {
    const dataPoints = [
      { value: 80 }, { value: 78 }, { value: 76 },
      { value: 74 }, { value: 72 }, { value: 70 }
    ];
    expect(calculateTrend(dataPoints)).toBe('DECREASING');
  });

  test('should detect stable trend', () => {
    const dataPoints = [
      { value: 72 }, { value: 73 }, { value: 72 },
      { value: 71 }, { value: 72 }, { value: 73 }
    ];
    expect(calculateTrend(dataPoints)).toBe('STABLE');
  });

  test('should return STABLE for insufficient data', () => {
    expect(calculateTrend([])).toBe('STABLE');
    expect(calculateTrend([{ value: 72 }])).toBe('STABLE');
  });
});