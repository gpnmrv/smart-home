import axios from 'axios';
import { SmartDevice, SensorData } from '../types/devices';

// Настройка базового URL для API
const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10 секунд таймаут
  headers: {
    'Content-Type': 'application/json',
  },
});

// Обработчик ошибок
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.response) {
    // Ошибка от сервера
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
  } else if (error.request) {
    // Запрос был сделан, но ответ не получен
    console.error('No response received:', error.request);
  } else {
    // Что-то при настройке запроса вызвало ошибку
    console.error('Request error:', error.message);
  }
  throw error;
};

// Получение списка устройств
export const fetchDevices = async (): Promise<SmartDevice[]> => {
  try {
    const response = await api.get('/devices');
    return response.data;
  } catch (error) {
    handleApiError(error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
};

// Получение данных датчиков
export const fetchSensorData = async (): Promise<SensorData[]> => {
  try {
    const response = await api.get('/sensors');
    return response.data;
  } catch (error) {
    handleApiError(error);
    // Возвращаем пустой массив в случае ошибки
    return [];
  }
};

// Обновление состояния устройства
export const updateDeviceStatus = async (deviceId: string, status: 'on' | 'off'): Promise<boolean> => {
  try {
    await api.put(`/devices/${deviceId}`, { status });
    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// Обновление температуры
export const updateTemperature = async (temperature: number): Promise<boolean> => {
  try {
    await api.put('/thermostat', { temperature });
    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};

// Обновление состояния вентилятора
export const updateFanStatus = async (isOn: boolean, speed: number): Promise<boolean> => {
  try {
    await api.put('/fan', { isOn, speed });
    return true;
  } catch (error) {
    handleApiError(error);
    return false;
  }
};