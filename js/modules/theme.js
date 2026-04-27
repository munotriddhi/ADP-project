// =========================================
// Theme Manager — Dark/Light + Accent Color
// =========================================
const ThemeManager = {
    init() {
        this.apply();
        this.bind();
    },

    apply() {
        const s = StorageManager.load().settings;

        // Apply theme
        document.documentElement.setAttribute('data-theme', s.theme);

        // Toggle icon
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = s.theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';

        // Apply accent
        document.documentElement.style.setProperty('--accent', s.accentColor);

        // Compute hover shade
        const hex = s.accentColor.replace('#', '');
        const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 20);
        const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 20);
        const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 20);
        document.documentElement.style.setProperty('--accent-hover', `rgb(${r},${g},${b})`);
        document.documentElement.style.setProperty('--accent-glow', `rgba(${parseInt(hex.substring(0,2),16)},${parseInt(hex.substring(2,4),16)},${parseInt(hex.substring(4,6),16)},0.15)`);
    },

    bind() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const data = StorageManager.load();
                data.settings.theme = data.settings.theme === 'dark' ? 'light' : 'dark';
                StorageManager.update('settings', data.settings);
                this.apply();
            });
        }

        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const data = StorageManager.load();
                data.settings.accentColor = btn.dataset.color;
                StorageManager.update('settings', data.settings);
                this.apply();
            });
        });
    }
};
