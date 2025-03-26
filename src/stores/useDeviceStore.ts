import { defineStore } from 'pinia';
import { SmartDevice, SensorData } from '../types/devices';
import { fetchDevices } from '../utils/api';

export const useDeviceStore = defineStore('devices', {
  state: () => ({
    devices: [] as SmartDevice[],
    sensorData: [] as SensorData[],
    isLampOn: true, // Состояние лампы
    fanIsOn: true,   // Состояние вентилятора (вкл/выкл)
    temperature: 25, // Температура
    devicePower: {
      lamp: 60,       // Лампа 60W
      fan: 50,        // Вентилятор 50W (фиксированная мощность)
      thermostat: 15, // Термостат 15W
      sensor: 5       // Датчик 5W
    }
  }),

  getters: {
    // Общее потребление энергии
    totalPowerConsumption(): number {
      let total = 0;

      // Учет лампы
      if (this.isLampOn) total += this.devicePower.lamp;

      // Учет вентилятора (если включен)
      if (this.fanIsOn) total += this.devicePower.fan;

      // Учет других устройств из списка
      total += this.devices
        .filter(device => device.status === 'on')
        .reduce((sum, device) => sum + device.power, 0);

      return total;
    }
  },

  actions: {
    // Инициализация устройств
    async initDevices() {
      try {
        const apiDevices = await fetchDevices();
        this.devices = apiDevices.length > 0 ? apiDevices : this.getDefaultDevices();
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        this.devices = this.getDefaultDevices();
      }
    },

    // Дефолтные устройства
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
        },
        {
          id: 'sensor1',
          type: 'sensor',
          power: this.devicePower.sensor,
          status: 'on',
          humidity: 65,
          temperature: 23
        }
      ];
    },

    // Переключение лампы
    toggleLamp() {
      this.isLampOn = !this.isLampOn;
      this.updateDeviceStatus('lamp1', this.isLampOn);
    },

    // Переключение вентилятора
    toggleFan() {
      this.fanIsOn = !this.fanIsOn;
      this.updateDeviceStatus('fan1', this.fanIsOn);
    },

    // Обновление статуса устройства
    updateDeviceStatus(deviceId: string, isOn: boolean) {
      const device = this.devices.find(d => d.id === deviceId);
      if (device) {
        device.status = isOn ? 'on' : 'off';
      }
    },

    // Установка температуры
    setTemperature(temp: number) {
      this.temperature = temp;
      const thermostat = this.devices.find(d => d.id === 'thermostat1');
      if (thermostat) {
        thermostat.temperature = temp;
      }
    },

    // Добавление данных с датчиков
    addSensorData(data: SensorData) {
      this.sensorData.push(data);
      if (this.sensorData.length > 100) {
        this.sensorData.shift();
      }
    }
  }
});