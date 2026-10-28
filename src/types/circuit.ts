export type SignalType =
  | 'POWER_5V'
  | 'POWER_3V3'
  | 'GND'
  | 'GPIO_INPUT'
  | 'GPIO_OUTPUT'
  | 'ANALOG_IN'
  | 'ANALOG_OUT'
  | 'I2C_SDA'
  | 'I2C_SCL'
  | 'UART_TX'
  | 'UART_RX'
  | 'ONEWIRE'
  | 'PASSIVE';

export interface PinDefinition {
  id: string; // e.g. "PA9" or "VCC"
  name: string; // readable label
  pinNumber?: number; // physical pin on header
  signalType: SignalType;
  voltageLevel: 0 | 3.3 | 5; // rated operating voltage
  is5VTolerant?: boolean;
  isRequired?: boolean;
  positionOffset: [number, number, number]; // 3D coordinate relative to component origin
  description: string;
}

export interface CircuitComponent {
  id: string;
  name: string;
  category: 'MCU' | 'WIRELESS' | 'SENSOR' | 'ACTUATOR' | 'DISPLAY' | 'POWER' | 'PASSIVE';
  modelNumber: string;
  position: [number, number, number];
  rotation: [number, number, number];
  dimensions: [number, number, number]; // width, height, depth in 3D units
  color: string;
  description: string;
  datasheetSnippet: string;
  pins: PinDefinition[];
  associatedSensorKey?: 'ULTRASONIC' | 'GAS' | 'TEMPERATURE' | 'COVER' | 'ACCEL' | 'SYSTEM';
}

export interface WireConnection {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  color: string;
  netName?: string;
  label?: string;
}

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationIssue {
  id: string;
  ruleId: string;
  severity: ValidationSeverity;
  title: string;
  description: string;
  affectedComponents: string[];
  affectedPins: { componentId: string; pinId: string }[];
  recommendation: string;
}

export interface CircuitValidationReport {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  connectedNetsCount: number;
  unconnectedRequiredPins: { componentId: string; pinId: string; name: string }[];
}
