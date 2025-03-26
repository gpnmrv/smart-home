import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkTheme: false,
  }),
  getters: {
    themeClass: (state) => state.isDarkTheme ? 'dark-theme' : 'light-theme',
  },
  actions: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
    },
  },
});