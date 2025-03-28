import { defineStore } from 'pinia';
import { SmartDevice, SensorData } from '../types/devices';
import { fetchDevices } from '../utils/api';

interface DeviceState {
  devices: SmartDevice[];
  sensorData: SensorData[];
  isLampOn: boolean;
  fanIsOn: boolean;
  temperature: number;
  devicePower: {
    lamp: number;
    fan: number;
    thermostat: number;
    sensor: number;
  };
}

export const useDeviceStore = defineStore('devices', {
  state: (): DeviceState => ({
    devices: [],
    sensorData: [],
    isLampOn: true,
    fanIsOn: true,
    temperature: 25,
    devicePower: {
      lamp: 60,
      fan: 50,
      thermostat: 15,
      sensor: 5
    }
  }),

  getters: {
    validDevices(state): SmartDevice[] {
      if (!Array.isArray(state.devices)) {
        console.warn('Devices is not an array, resetting...');
        return [];
      }
      return state.devices;
    },
    
    totalPowerConsumption(state): number {
      const devices = this.validDevices;
      let total = state.isLampOn ? state.devicePower.lamp : 0;
      total += state.fanIsOn ? state.devicePower.fan : 0;
      
      return devices
        .filter(device => device?.status === 'on')
        .reduce((sum, device) => sum + (device.power || 0), total);
    }
  },

  actions: {
    async initDevices() {
      try {
        const apiDevices = await fetchDevices();
        this.devices = Array.isArray(apiDevices) ? apiDevices : this.getDefaultDevices();
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        this.devices = this.getDefaultDevices();
      }
    },

    getDefaultDevices(): SmartDevice[] {
      return [
        {
          id: 'lamp1',
          type: 'light',
          power: this.devicePower.lamp,
          status: this.isLampOn ? 'on' : 'off'
        },
        {
          id: 'fan1',
          type: 'fan',
          power: this.devicePower.fan,
          status: this.fanIsOn ? 'on' : 'off'
        },
        {
          id: 'thermostat1',
          type: 'thermostat',
          power: this.devicePower.thermostat,
          status: 'on',
          temperature: this.temperature
        }
      ];
    },

    resetDevices() {
      this.devices = this.getDefaultDevices();
    },

    toggleLamp() {
      if (!Array.isArray(this.devices)) {
        this.resetDevices();
      }
      this.isLampOn = !this.isLampOn;
      this.updateDeviceStatus('lamp1', this.isLampOn);
    },

    toggleFan() {
      if (!Array.isArray(this.devices)) {
        this.resetDevices();
      }
      this.fanIsOn = !this.fanIsOn;
      this.updateDeviceStatus('fan1', this.fanIsOn);
    },

    updateDeviceStatus(deviceId: string, isOn: boolean) {
      if (!Array.isArray(this.devices)) {
        this.resetDevices();
        return;
      }
      
      const device = this.devices.find(d => d?.id === deviceId);
      if (device) {
        device.status = isOn ? 'on' : 'off';
      }
    },

    setTemperature(temp: number) {
      this.temperature = temp;
      if (!Array.isArray(this.devices)) {
        this.resetDevices();
        return;
      }
      
      const thermostat = this.devices.find(d => d.id === 'thermostat1');
      if (thermostat) {
        thermostat.temperature = temp;
      }
    },

    addSensorData(data: SensorData) {
      if (!Array.isArray(this.sensorData)) {
        this.sensorData = [];
      }
      this.sensorData.push(data);
      if (this.sensorData.length > 100) {
        this.sensorData.shift();
      }
    }
  }
});