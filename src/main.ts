import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useDeviceStore } from './stores/useDeviceStore';
import { fetchSensorData } from './utils/api';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Получаем экземпляр хранилища после инициализации Pinia
const deviceStore = useDeviceStore();

// Инициализация устройств
deviceStore.initDevices();

// Функция для периодического обновления данных с датчиков
const updateSensorData = async () => {
  try {
    const data = await fetchSensorData();
    if (data.length > 0) {
      // Добавляем только последние данные
      deviceStore.addSensorData(data[data.length - 1]);
    } else {
      // Если API не вернуло данные, генерируем фиктивные для демо
      deviceStore.addSensorData({
        timestamp: new Date().toISOString(),
        temperature: Math.random() * 10 + 20, // 20-30°C
        humidity: Math.random() * 30 + 50, // 50-80%
      });
    }
  } catch (error) {
    console.error('Failed to update sensor data:', error);
    // Генерируем фиктивные данные в случае ошибки
    deviceStore.addSensorData({
      timestamp: new Date().toISOString(),
      temperature: Math.random() * 10 + 20,
      humidity: Math.random() * 30 + 50,
    });
  }
};

// Запускаем начальное обновление данных
updateSensorData();

// Запускаем обновление данных с интервалом
const dataUpdateInterval = setInterval(updateSensorData, 30000); // Каждые 30 секунд

// Очистка интервала при закрытии приложения
window.addEventListener('beforeunload', () => {
  clearInterval(dataUpdateInterval);
});

// Запускаем приложение
app.mount('#app');