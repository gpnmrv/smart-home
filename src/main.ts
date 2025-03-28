import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useDeviceStore } from './stores/useDeviceStore';
import { fetchSensorData } from './utils/api';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Инициализация хранилища
const deviceStore = useDeviceStore();

// Глобальная обработка ошибок
app.config.errorHandler = (err) => {
  console.error('Global Vue error:', err);
};

// Обработчик ошибок для хранилища
deviceStore.$onAction(({ name, onError }) => {
  onError((error) => {
    console.error(`Action ${name} failed:`, error);
    deviceStore.resetDevices();
  });
});

// Инициализация устройств
deviceStore.initDevices().catch(err => {
  console.error('Initial device load failed:', err);
});

// Функция обновления данных сенсоров
const updateSensorData = async () => {
  try {
    const data = await fetchSensorData();
    if (Array.isArray(data) && data.length > 0) {
      deviceStore.addSensorData(data[data.length - 1]);
    } else {
      deviceStore.addSensorData({
        timestamp: new Date().toISOString(),
        temperature: 22 + Math.random() * 6,
        humidity: 50 + Math.random() * 30
      });
    }
  } catch (error) {
    console.error('Sensor data update failed:', error);
  }
};

// Периодическое обновление данных
const dataUpdateInterval = setInterval(updateSensorData, 30000);
updateSensorData();

// Очистка при размонтировании
window.addEventListener('beforeunload', () => {
  clearInterval(dataUpdateInterval);
});

app.mount('#app');