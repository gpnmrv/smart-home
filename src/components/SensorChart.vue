<template>
  <div class="chart-container" :class="{ 'mobile-view': isMobile }" ref="container">
    <div class="chart-scroll-container" ref="scrollContainer">
      <div class="chart-wrapper">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js/auto';
import type { ChartOptions } from 'chart.js';

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
    const scrollContainer = ref<HTMLElement | null>(null);
    const container = ref<HTMLElement | null>(null);
    let chart: Chart | null = null;

    Chart.register(...registerables);

    const getChartOptions = (): ChartOptions<'line'> => {
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
              font: {
                size: props.isMobile ? 12 : 14,
                weight: 'bold' as const
              }
            },
            grid: { color: gridColor }
          },
          y: {
            ticks: { 
              color: textColor,
              font: {
                size: props.isMobile ? 12 : 14,
                weight: 'bold' as const
              }
            },
            grid: { color: gridColor }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: {
                size: props.isMobile ? 14 : 16,
                weight: 'bold' as const
              }
            }
          }
        }
      };
    };

    const calculateChartDimensions = () => {
      if (!props.isMobile || !chartCanvas.value || !container.value || !scrollContainer.value) return;
      
      const chartHeight = 220;
      const pointWidth = 60;
      const chartWidth = props.temperatureData.length * pointWidth;
      
      chartCanvas.value.width = chartWidth;
      chartCanvas.value.height = chartHeight;
      chartCanvas.value.style.width = `${chartWidth}px`;
      chartCanvas.value.style.height = `${chartHeight}px`;
      
      container.value.style.height = `${chartHeight}px`;
      scrollContainer.value.style.height = `${chartHeight}px`;
      
      const chartWrapper = scrollContainer.value.querySelector('.chart-wrapper') as HTMLElement;
      if (chartWrapper) {
        chartWrapper.style.width = `${chartWidth}px`;
        chartWrapper.style.height = `${chartHeight}px`;
      }
    };

    const createChart = async () => {
      if (!chartCanvas.value) return;

      if (chart) chart.destroy();
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      if (props.isMobile) {
        calculateChartDimensions();
      } else {
        chartCanvas.value.style.width = '100%';
        chartCanvas.value.style.height = '300px';
      }

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
              borderWidth: props.isMobile ? 2 : 3,
              tension: 0.4,
            },
            {
              label: 'Влажность (%)',
              data: props.humidityData,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: props.isMobile ? 2 : 3,
              tension: 0.4,
            }
          ]
        },
        options: getChartOptions()
      });

      if (props.isMobile && scrollContainer.value) {
        await nextTick();
        scrollContainer.value.scrollLeft = chartCanvas.value.width;
      }
    };

    watch(
      () => [props.temperatureData, props.humidityData, props.isDarkTheme],
      createChart,
      { deep: true }
    );

    onMounted(() => {
      createChart();
      window.addEventListener('resize', createChart);
    });

    onBeforeUnmount(() => {
      if (chart) chart.destroy();
      window.removeEventListener('resize', createChart);
    });

    return { chartCanvas, scrollContainer, container };
  },
});
</script>

<style scoped>
.chart-container {
  position: relative;
  background-color: var(--chart-bg-light);
  border-radius: 12px;
  overflow: hidden;
}

.chart-container.mobile-view {
  width: 100%;
}

.chart-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.chart-wrapper {
  display: inline-block;
}

.chart-wrapper canvas {
  display: block;
}

/* Для десктопной версии */
@media (min-width: 769px) {
  .chart-container {
    width: 100%;
    height: 300px;
    padding: 12px;
    margin-bottom: 15px;
  }
  
  .chart-scroll-container {
    width: 100%;
    height: 300px;
    overflow-x: hidden; 
  }
  
  .chart-wrapper {
    width: 100% !important; 
  }
  
  .chart-wrapper canvas {
    width: 100% !important;
    height: 300px !important;
  }
}

/* Для мобильной версии */
@media (max-width: 768px) {
  .chart-container {
    height: 220px;
    margin-bottom: 5px;
  }
  
  .chart-scroll-container {
    height: 220px;
  }
  
  .chart-wrapper {
    width: 1440px;
    height: 220px;
  }
  
  .chart-wrapper canvas {
    height: 220px;
    width: 1440px;
  }
  
  .chart-scroll-container::-webkit-scrollbar {
    height: 5px;
  }
  
  .chart-scroll-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
  }
  
  .chart-scroll-container::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
</style>