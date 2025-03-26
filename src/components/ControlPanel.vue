<template>
  <div class="control-panel">
    <h2>Панель управления</h2>
    <div class="control-group">
      <button @click="toggleLamp" :class="{ active: isLampOn }">
        Свет {{ isLampOn ? '(Включен)' : '(Выключен)' }}
      </button>
      <button @click="toggleFan" :class="{ active: fanIsOn }">
        Вентилятор {{ fanIsOn ? '(Включен)' : '(Выключен)' }}
      </button>
    </div>
    <div class="control-group">
      <label for="temperature">Температура: {{ temperature }}°C</label>
      <input
        id="temperature"
        type="range"
        min="15"
        max="35"
        v-model="temperature"
        @input="updateTemperature"
      />
      <div>
        <p>Текущее потребление энергии: {{ totalPowerConsumption }} Вт</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDeviceStore } from '../stores/useDeviceStore';

export default defineComponent({
  name: 'ControlPanel',
  setup() {
    const deviceStore = useDeviceStore();
    
    // Получаем состояние из хранилища
    const isLampOn = computed(() => deviceStore.isLampOn);
    const fanIsOn = computed(() => deviceStore.fanIsOn);
    const totalPowerConsumption = computed(() => deviceStore.totalPowerConsumption);

    // Управление температурой
    const temperature = computed({
      get: () => deviceStore.temperature,
      set: (value: number) => deviceStore.setTemperature(value)
    });

    // Действия
    const toggleLamp = () => deviceStore.toggleLamp();
    const toggleFan = () => deviceStore.toggleFan();
    const updateTemperature = () => deviceStore.setTemperature(temperature.value);

    return {
      isLampOn,
      fanIsOn,
      temperature,
      totalPowerConsumption,
      toggleLamp,
      toggleFan,
      updateTemperature
    };
  },
});
</script>

<style scoped>
.control-panel {
  padding: 20px;
  background-color: var(--panel-bg-color);
  border-radius: 8px;
  margin: 20px auto;
  color: var(--text-color);
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.control-group {
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
  border: none;
  border-radius: 5px;
  margin: 5px;
  transition: all 0.3s ease;
}

button:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

button.active {
  background-color: #ff9800;
}

input[type="range"] {
  width: 100%;
  margin-top: 10px;
}
</style>