export interface SmartDevice {
  id: string;
  type: 'light' | 'thermostat' | 'sensor' | 'fan';
  power: number;
  status: 'on' | 'off';
  temperature?: number;
  humidity?: number;
}

export interface SensorData {
  timestamp: Date | string;
  temperature: number;
  humidity: number;
}

export interface AppState {
  devices: SmartDevice[];
  sensorData: SensorData[];
  isLampOn: boolean;
  temperature: number;
}