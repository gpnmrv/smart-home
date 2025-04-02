<template>
  <div id="app" :class="themeClass">
    <div class="mobile-layout">
      <House3D :isDarkTheme="isDarkTheme" />
      <ControlPanel @toggle-chart="toggleChart" />
      <SensorChart 
        v-if="!isMobile" 
        :temperatureData="temperatureData" 
        :humidityData="humidityData" 
        :isDarkTheme="isDarkTheme"
        :isMobile="isMobile"
      />
      
      <div v-if="isMobile && chartVisible" class="mobile-chart-overlay" @click.self="chartVisible = false">
        <div class="mobile-chart-container">
          <button @click="chartVisible = false" class="close-chart-btn">✕</button>
          <SensorChart 
            :temperatureData="temperatureData" 
            :humidityData="humidityData" 
            :isMobile="true"
            :isDarkTheme="isDarkTheme"
          />
        </div>
      </div>
      
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDarkTheme ? 'Светлая тема' : 'Темная тема' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import House3D from './components/House3D.vue';
import ControlPanel from './components/ControlPanel.vue';
import SensorChart from './components/SensorChart.vue';
import { useThemeStore } from './stores/useThemeStore';

export default defineComponent({
  name: 'App',
  components: {
    House3D,
    ControlPanel,
    SensorChart,
  },
  setup() {
    const temperatureData = ref(Array.from({ length: 24 }, () => Math.random() * 30));
    const humidityData = ref(Array.from({ length: 24 }, () => Math.random() * 100));
    const themeStore = useThemeStore();
    const isDarkTheme = computed(() => themeStore.isDarkTheme);
    const themeClass = computed(() => themeStore.themeClass);
    const isMobile = ref(false);
    const chartVisible = ref(false);

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    const toggleTheme = () => {
      themeStore.toggleTheme();
    };

    const toggleChart = () => {
      chartVisible.value = !chartVisible.value;
    };

    onMounted(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkMobile);
    });

    return {
      isMobile,
      chartVisible,
      temperatureData,
      humidityData,
      isDarkTheme,
      themeClass,
      toggleTheme,
      toggleChart,
    };
  },
});
</script>

<style>
:root {
  --text-color: #333333;
  --background-color: #ffffff;
  --button-bg-color: #4CAF50;
  --button-text-color: #ffffff;
  --panel-bg-color: #f5f5f5;
  --chart-bg-light: #ffffff;
}

.dark-theme {
  --text-color: #f0f0f0;
  --background-color: #121212;
  --button-bg-color: #2d6a30;
  --button-text-color: #ffffff;
  --panel-bg-color: #1e1e1e;
  --chart-bg-light: #1e1e1e;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: var(--text-color);
  background-color: var(--background-color);
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: var(--background-color);
}

.theme-toggle {
  position: fixed;
  top: 10px;
  left: 10px;
  padding: 8px 16px;
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
  border: none;
  cursor: pointer;
  z-index: 1000;
  font-size: 12px;
  border-radius: 5px;
}

.theme-toggle:hover {
  opacity: 0.9;
}

.mobile-chart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1001;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-chart-container {
  position: relative;
  width: 90%;
  max-width: 500px;
  max-height: 225px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
}

.dark-theme .mobile-chart-container {
  background-color: var(--panel-bg-color); 
}

.close-chart-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-color);
  z-index: 1002;
}

@media (max-width: 768px) {
  .mobile-layout {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .theme-toggle {
    position: static;
    margin: 10px auto;
    width: 50%;
    border-radius: 5px;
  }
}

@media (min-width: 769px) {
  .mobile-chart-container {
    display: none;
  }
}
</style>