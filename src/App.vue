<template>
  <div id="app" :class="themeClass">
    <House3D :isDarkTheme="isDarkTheme" />
    <ControlPanel />
    <SensorChart :temperatureData="temperatureData" :humidityData="humidityData" />
    <button @click="toggleTheme" class="theme-toggle">
      {{ isDarkTheme ? 'Светлая тема' : 'Темная тема' }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
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
    
    // Используем хранилище для темы
    const themeStore = useThemeStore();
    const isDarkTheme = computed(() => themeStore.isDarkTheme);
    const themeClass = computed(() => themeStore.themeClass);

    const toggleTheme = () => {
      themeStore.toggleTheme();
    };

    return {
      temperatureData,
      humidityData,
      isDarkTheme,
      themeClass,
      toggleTheme,
    };
  },
});
</script>

<style>
:root {
  /* Светлая тема (по умолчанию) */
  --text-color: #333333;
  --background-color: #ffffff;
  --button-bg-color: #4CAF50;
  --button-text-color: #ffffff;
  --panel-bg-color: #f5f5f5;
}

.dark-theme {
  --text-color: #f0f0f0;
  --background-color: #121212;
  --button-bg-color: #2d6a30;
  --button-text-color: #ffffff;
  --panel-bg-color: #1e1e1e;
}

.light-theme {
  --text-color: #333333;
  --background-color: #ffffff;
  --button-bg-color: #4CAF50;
  --button-text-color: #ffffff;
  --panel-bg-color: #f5f5f5;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: var(--text-color);
  margin-top: 20px;
  background-color: var(--background-color);
  min-height: 100vh;
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
}

.theme-toggle:hover {
  opacity: 0.9;
}
</style>