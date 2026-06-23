// Theme Manager
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.applyTheme();
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const icon = document.getElementById('themeIcon');
        icon.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }
}

const themeManager = new ThemeManager();

function toggleTheme() {
    themeManager.toggleTheme();
}
