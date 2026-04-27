const Dashboard = {
    quotes: [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
        { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
        { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
        { text: "Education is the most powerful weapon to change the world.", author: "Nelson Mandela" }
    ],
    chart: null,

    init() {
        this.renderChart();
        this.setupPomodoro();
        this.renderQuote();
        this.renderStudyHours();
    },

    renderStudyHours() {
        const sessions = StorageManager.load().analytics.studySessions || [];
        const totalMins = sessions.reduce((s, x) => s + (x.durationMinutes || 0), 0);
        const el = document.getElementById('stat-hours');
        if (el) el.textContent = (totalMins / 60).toFixed(1) + 'h';
    },

    renderChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#818cf8';
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{ label: 'Hours', data: [0,0,0,0,0,0,0], backgroundColor: accent, borderRadius: 6, borderSkipped: false }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7a829e' } },
                    x: { grid: { display: false }, ticks: { color: '#7a829e' } }
                }
            }
        });
    },

    setupPomodoro() {
        const startBtn = document.getElementById('dash-start-timer');
        const resetBtn = document.getElementById('dash-reset-timer');
        const display = document.getElementById('dash-timer');
        if (!startBtn || !resetBtn || !display) return;

        // Listen to shared timer
        PomodoroTimer.onTick((remaining, running) => {
            display.textContent = PomodoroTimer.formatTime();
            if (running) { startBtn.textContent = 'Pause'; startBtn.className = 'btn secondary'; }
            else { startBtn.textContent = remaining < PomodoroTimer.duration * 60 ? 'Resume' : 'Start'; startBtn.className = 'btn primary'; }
        });

        // Sync initial state
        display.textContent = PomodoroTimer.formatTime();

        startBtn.addEventListener('click', () => PomodoroTimer.toggle());
        resetBtn.addEventListener('click', () => PomodoroTimer.reset());
    },

    renderQuote() {
        const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const q = this.quotes[day % this.quotes.length];
        const el = document.getElementById('daily-quote');
        const au = document.getElementById('daily-quote-author');
        if (el) el.textContent = '"' + q.text + '"';
        if (au) au.textContent = '— ' + q.author;
    }
};
