<template>
  <div v-if="isVisible" class="modal" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Данные с датчиков</h2>
        <button 
          @click.stop="handleClose" 
          class="close-button"
          aria-label="Закрыть"
        >
          &times;
        </button>
      </div>
      <div class="modal-body">
        <p><strong>Температура:</strong> {{ sensorData.temperature }}°C</p>
        <p><strong>Влажность:</strong> {{ sensorData.humidity }}%</p>
      </div>
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
    const handleClose = () => {
      emit('close');
    };

    return {
      handleClose
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
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: var(--panel-bg-color);
  border-radius: 12px;
  color: var(--text-color);
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  transform: translateY(20px);
  animation: slideUp 0.3s ease-out forwards;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

@keyframes slideUp {
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg-color);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--heading-color);
}

.modal-body {
  padding: 25px 20px;
}

.modal-body p {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  line-height: 1.6;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-body strong {
  color: var(--accent-color);
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: var(--text-secondary-color);
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  color: var(--error-color);
  background-color: rgba(255, 0, 0, 0.1);
  transform: rotate(90deg);
}

/* Адаптация для мобильных устройств */
@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    max-width: none;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-header h2 {
    font-size: 1.3rem;
  }
  
  .modal-body {
    padding: 20px 16px;
  }
  
  .modal-body p {
    font-size: 1rem;
  }
  
  .close-button {
    font-size: 1.5rem;
    width: 32px;
    height: 32px;
  }
}
</style>