<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, onUnmounted } from 'vue';
import { Chart, type ChartOptions, type ChartData } from 'chart.js/auto';

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
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    const createChart = () => {
      if (!chartCanvas.value) return;
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      const chartData: ChartData<'line'> = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: 'Температура (°C)',
            data: props.temperatureData,
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Влажность (%)',
            data: props.humidityData,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.1)', 
            fill: true,
            tension: 0.4,
          }
        ]
      };

      const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Время (часы)' },
            grid: { color: 'rgba(200, 200, 200, 0.2)' },
          },
          y: {
            display: true,
            title: { display: true, text: 'Значение' },
            grid: { color: 'rgba(200, 200, 200, 0.2)' },
          },
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      };

      chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions,
      });
    };

    watch(
      () => [props.temperatureData, props.humidityData],
      () => {
        if (chart?.data?.datasets) {
          chart.data.datasets[0].data = props.temperatureData;
          chart.data.datasets[1].data = props.humidityData;
          chart.update();
        }
      },
      { deep: true }
    );

    onMounted(() => {
      createChart();
      window.addEventListener('resize', () => chart?.resize());
    });

    onUnmounted(() => {
      chart?.destroy();
      window.removeEventListener('resize', () => chart?.resize());
    });

    return { chartCanvas };
  },
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  margin: 20px auto;
  max-width: 800px;
  background-color: var(--panel-bg-color);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: 200px;
  }
}
</style>