<template>
  <div class="control-panel" :class="{ 'mobile-view': isMobile }">
    <h2 class="panel-title">Панель управления</h2>
    <div class="control-group">
      <div class="button-row">
        <button @click="toggleLamp" :class="{ active: isLampOn }" class="control-button">
          Свет {{ isLampOn ? '(Вкл)' : '(Выкл)' }}
        </button>
        <button @click="toggleFan" :class="{ active: fanIsOn }" class="control-button">
          Вент. {{ fanIsOn ? '(Вкл)' : '(Выкл)' }}
        </button>
      </div>
      <button 
        v-if="isMobile" 
        @click="toggleChartVisibility" 
        class="control-button chart-toggle"
      >
        Показать график
      </button>
    </div>
    <div class="control-group">
      <label for="temperature" class="temp-label">Температура: {{ temperature }}°C</label>
      <input
        id="temperature"
        type="range"
        min="15"
        max="35"
        v-model="temperature"
        @input="updateTemperature"
        class="temp-slider"
      />
      <div class="power-consumption">
        <p>Потребление: {{ totalPowerConsumption }} Вт</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useDeviceStore } from '../stores/useDeviceStore';

export default defineComponent({
  name: 'ControlPanel',
  emits: ['toggle-chart'],
  setup(props, { emit }) {
    const deviceStore = useDeviceStore();
    const isMobile = ref(false);
    const showChart = ref(false);
    const isLampOn = computed(() => deviceStore.isLampOn);
    const fanIsOn = computed(() => deviceStore.fanIsOn);
    const totalPowerConsumption = computed(() => deviceStore.totalPowerConsumption);

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    const toggleChartVisibility = () => {
      showChart.value = !showChart.value;
      emit('toggle-chart', showChart.value);
    };

    onMounted(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkMobile);
    });

    const temperature = computed({
      get: () => deviceStore.temperature,
      set: (value: number) => {
        try {
          deviceStore.setTemperature(value);
        } catch (error) {
          console.error('Temperature update failed:', error);
        }
      }
    });

    const toggleLamp = () => {
      try {
        deviceStore.toggleLamp();
      } catch (error) {
        console.error('Lamp toggle failed:', error);
      }
    };

    const toggleFan = () => {
      try {
        deviceStore.toggleFan();
      } catch (error) {
        console.error('Fan toggle failed:', error);
      }
    };

    const updateTemperature = () => {
      try {
        deviceStore.setTemperature(temperature.value);
      } catch (error) {
        console.error('Temperature update failed:', error);
      }
    };

    return {
      isLampOn,
      fanIsOn,
      isMobile,
      showChart,
      toggleChartVisibility,
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
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  padding: 15px;
  background-color: var(--panel-bg-color);
  border-radius: 8px;
  color: var(--text-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 90vh;
  overflow-y: auto;
}

.control-group {
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
  text-align:center;
}

.panel-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2rem;
  text-align:center;
}

.control-button {
  padding: 10px 15px;
  font-size: 1rem;
  cursor: pointer;
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
  border: none;
  border-radius: 5px;
  margin: 5px;
  transition: all 0.3s ease;
  width: 100%;
  display: block;
}

.control-button:hover {
  opacity: 0.9;
  transform: scale(1.02);
}

.control-button.active {
  background-color: #ff9800;
}

.temp-label {
  display: block;
  margin-bottom: 8px;
  font-size: 1rem;
}

.temp-slider {
  width: 100%;
  margin: 5px 0;
}

.power-consumption {
  font-size: 0.9rem;
  margin-top: 10px;
}

.chart-toggle {
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
}

.chart-toggle:hover,
.chart-toggle:active,
.chart-toggle:focus {
  background-color: var(--button-bg-color) !important;
  transform: none !important;
  opacity: 1 !important;
}

@media (max-width: 768px) {
  .control-panel {
    position: relative;
    width: 90%;
    max-width: 350px;
    margin: 10px auto;
    padding: 20px; 
    top: auto;
    right: auto;
    left: auto;
    bottom: 20px;
    min-height: 250px; 
  }

  .control-panel.mobile-view {
    z-index: 1001;
  }

  .button-row {
    display: flex;
    justify-content: space-between;
    gap: 5px;
  }

  .button-row .control-button {
    width: calc(50% - 5px);
    margin-bottom: 0;
  }

  .chart-toggle {
    display: block;
    width: 80%;
    margin: 10px auto 0;
    max-width: 200px;
    padding: 12px 15px;
  }

  .panel-title {
    font-size: 1.1rem;
    margin-bottom: 15px; 
  }

  .control-group {
    margin-top: 5px; 
  }

  .control-button {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .temp-label {
    font-size: 0.95rem; 
  }

  .power-consumption {
    font-size: 0.85rem; 
    margin-top: 12px; 
  }
}
</style>