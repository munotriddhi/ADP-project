const App = {
    initialized: false,
    
    init() {
        if (this.initialized) return;
        this.initialized = true;

        Dashboard.init();
        TasksModule.init();
        ExamsModule.init();
        TimetableModule.init();
        NotesModule.init();
        PomodoroModule.init();
        AnalyticsModule.init();

        this.setupNavigation();
        this.updateGreeting();
        this.updateStreak();
    },

    setupNavigation() {
        const links = document.querySelectorAll('.nav-links li');
        const tabs  = document.querySelectorAll('.tab-content');

        links.forEach(link => {
            link.addEventListener('click', () => {
                if (!link.dataset.tab) return;
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                tabs.forEach(t => t.classList.remove('active'));
                const target = document.getElementById(link.dataset.tab);
                if (target) target.classList.add('active');

                // Lazy-render charts & full-page lists
                if (link.dataset.tab === 'analytics-tab') AnalyticsModule.renderChart();
                if (link.dataset.tab === 'tasks-tab') TasksModule.renderFull();
                if (link.dataset.tab === 'timetable-tab') TimetableModule.renderFull();
                if (link.dataset.tab === 'exams-tab') ExamsModule.renderFull();
            });
        });
    },

    updateGreeting() {
        const el = document.getElementById('greeting-text');
        if (!el) return;
        const h = new Date().getHours();
        el.textContent = h < 12 ? 'Good Morning!' : h < 18 ? 'Good Afternoon!' : 'Good Evening!';
    },

    updateStreak() {
        const data = StorageManager.load();
        const el = document.getElementById('streak-count');
        const stat = document.getElementById('stat-streak');
        if (el) el.textContent = data.analytics.streak || 0;
        if (stat) stat.textContent = data.analytics.streak || 0;
        
        const analyticsStreak = document.getElementById('analytics-streak');
        if (analyticsStreak) analyticsStreak.textContent = data.analytics.streak || 0;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // AuthManager will call App.init() upon success
    AuthManager.init();
});

window.App = App;
