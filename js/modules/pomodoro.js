// =========================================
// Pomodoro Full Page — uses shared PomodoroTimer
// =========================================
const PomodoroModule = {
    init() {
        this.display   = document.getElementById('pomo-full-timer');
        this.startBtn  = document.getElementById('pomo-full-start');
        this.resetBtn  = document.getElementById('pomo-full-reset');
        this.sessionsEl = document.getElementById('pomo-sessions');
        this.logEl     = document.getElementById('pomo-log');
        if (!this.display || !this.startBtn) return;

        // Mode tabs
        document.querySelectorAll('.pomo-mode').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pomo-mode').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                PomodoroTimer.reset(parseInt(btn.dataset.mins));
            });
        });

        // Listen to shared timer
        PomodoroTimer.onTick((remaining, running) => {
            this.display.textContent = PomodoroTimer.formatTime();
            if (running) { this.startBtn.textContent = 'Pause'; this.startBtn.className = 'btn secondary'; }
            else { this.startBtn.textContent = remaining < PomodoroTimer.duration * 60 ? 'Resume' : 'Start'; this.startBtn.className = 'btn primary'; }
        });

        // Sync initial state
        this.display.textContent = PomodoroTimer.formatTime();

        this.startBtn.addEventListener('click', () => PomodoroTimer.toggle());
        this.resetBtn.addEventListener('click', () => {
            const active = document.querySelector('.pomo-mode.active');
            PomodoroTimer.reset(active ? parseInt(active.dataset.mins) : 25);
        });

        this.renderLog();
    },

    renderLog() {
        if (!this.logEl) return;
        const sessions = StorageManager.load().analytics.studySessions || [];
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = sessions.filter(s => s.date === today);
        if (todaySessions.length === 0) {
            this.logEl.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:1rem">No sessions logged today.</p>';
        } else {
            this.logEl.innerHTML = todaySessions.map((s, i) =>
                `<div class="dash-task-item"><span class="dash-task-title">Session ${i + 1}</span><span class="badge low">${s.durationMinutes} min</span></div>`
            ).join('');
        }
        if (this.sessionsEl) this.sessionsEl.textContent = todaySessions.length;
    }
};
