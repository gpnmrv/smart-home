<template>
  <div class="chart-container" :class="{ 'mobile-view': isMobile }">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js/auto';

export default defineComponent({
  name: 'SensorChart',
  props: {
    temperatureData: {
      type: Array as () => number[],
      required: true,
    },
    humidityData: {
      type: Array as () => number[],
      required: true,
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    isDarkTheme: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    Chart.register(...registerables);

    const getChartOptions = () => {
      const isDark = props.isDarkTheme;
      const textColor = isDark ? '#f0f0f0' : '#666';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      const bgColor = isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)';

      return {
        responsive: true,
        maintainAspectRatio: false,
        backgroundColor: bgColor,
        scales: {
          x: {
            ticks: { 
              color: textColor,
              font: { size: props.isMobile ? 10 : 12 }
            },
            grid: { color: gridColor }
          },
          y: {
            ticks: { 
              color: textColor,
              font: { size: props.isMobile ? 10 : 12 }
            },
            grid: { color: gridColor }
          }
        },
        plugins: {
          legend: {
            labels: { 
              color: textColor,
              font: { size: props.isMobile ? 12 : 14 }
            }
          }
        }
      };
    };

    const createChart = () => {
      if (!chartCanvas.value) return;

      if (chart) chart.destroy();
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
          datasets: [
            {
              label: 'Температура (°C)',
              data: props.temperatureData,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: props.isMobile ? 1 : 2,
              tension: 0.4,
            },
            {
              label: 'Влажность (%)',
              data: props.humidityData,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: props.isMobile ? 1 : 2,
              tension: 0.4,
            }
          ]
        },
        options: getChartOptions()
      });
    };

    watch(
      () => [props.temperatureData, props.humidityData, props.isMobile, props.isDarkTheme],
      createChart,
      { deep: true }
    );

    onMounted(createChart);
    onBeforeUnmount(() => chart?.destroy());

    return { chartCanvas };
  },
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
  position: relative;
  background-color: var(--chart-bg-light);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.chart-container.mobile-view {
  height: 100%;
  width: 100%;
  padding: 10px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 35vh;
    margin-bottom: 0;
  }
}
</style>