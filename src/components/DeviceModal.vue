<template>
  <div v-if="isVisible" class="modal" @click.self="close">
    <div class="modal-content">
      <h2>Данные с датчиков</h2>
      <p>Температура: {{ sensorData.temperature }}°C</p>
      <p>Влажность: {{ sensorData.humidity }}%</p>
      <button @click="close">Закрыть</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { SensorData } from '../types/devices';

export default defineComponent({
  name: 'DeviceModal',
  props: {
    sensorData: {
      type: Object as PropType<SensorData>,
      required: true,
      default: () => ({
        temperature: 0,
        humidity: 0
      })
    },
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const close = () => {
      emit('close');
    };

    return {
      close
    };
  }
});
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
}

.modal-content {
  background-color: var(--background-color);
  padding: 20px;
  border-radius: 8px;
  color: var(--text-color);
  min-width: 250px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

h2 {
  margin-top: 0;
  color: var(--heading-color);
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
  border: none;
  border-radius: 5px;
  margin-top: 15px;
  transition: all 0.2s ease;
}

button:hover {
  opacity: 0.9;
  transform: scale(1.05);
}
</style>