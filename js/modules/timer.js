// =========================================
// Shared Pomodoro Timer — persists across tabs
// =========================================
const PomodoroTimer = {
    running: false,
    remaining: 25 * 60,
    duration: 25,
    tid: null,
    listeners: [],

    onTick(fn) { this.listeners.push(fn); },
    broadcast() { this.listeners.forEach(fn => fn(this.remaining, this.running)); },

    start() {
        if (this.running) return;
        this.running = true;
        this.tid = setInterval(() => {
            if (this.remaining > 0) {
                this.remaining--;
                this.broadcast();
            } else {
                this.finish();
            }
        }, 1000);
        this.broadcast();
    },

    pause() {
        clearInterval(this.tid);
        this.running = false;
        this.broadcast();
    },

    reset(mins) {
        clearInterval(this.tid);
        this.running = false;
        this.duration = mins || this.duration;
        this.remaining = this.duration * 60;
        this.broadcast();
    },

    finish() {
        clearInterval(this.tid);
        this.running = false;
        this.logSession();
        this.remaining = this.duration * 60;
        this.broadcast();

        // --- ALARM ---
        this.playAlarm();
        this.showNotification();
        this.showInAppAlert();
    },

    toggle() {
        if (this.running) this.pause();
        else this.start();
    },

    formatTime() {
        return String(Math.floor(this.remaining / 60)).padStart(2, '0') + ':' + String(this.remaining % 60).padStart(2, '0');
    },

    // Play a beep sound using Web Audio API (no external file needed)
    playAlarm() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const beep = (freq, start, dur) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
                osc.start(ctx.currentTime + start);
                osc.stop(ctx.currentTime + start + dur);
            };
            // Three ascending beeps
            beep(523, 0, 0.3);
            beep(659, 0.35, 0.3);
            beep(784, 0.7, 0.5);
        } catch (e) { /* Audio not supported */ }
    },

    // Browser notification (works even if user is on a different browser tab)
    showNotification() {
        const label = this.duration <= 5 ? 'Short Break' : this.duration <= 15 ? 'Break' : 'Focus Session';
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('⏰ Timer Complete!', { body: `Your ${label} is over. Time to get back!`, icon: '📚' });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(p => {
                    if (p === 'granted') new Notification('⏰ Timer Complete!', { body: `Your ${label} is over.` });
                });
            }
        }
    },

    // In-app alert overlay (always works)
    showInAppAlert() {
        const label = this.duration <= 5 ? 'Short Break' : this.duration <= 15 ? 'Break' : 'Focus Session';
        const overlay = document.createElement('div');
        overlay.className = 'timer-alert-overlay';
        overlay.innerHTML = `
            <div class="timer-alert-box">
                <div class="timer-alert-icon">⏰</div>
                <h3>${label} Complete!</h3>
                <p>Time's up. Ready for the next round?</p>
                <button class="btn primary" id="dismiss-timer-alert">Got it</button>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));
        document.getElementById('dismiss-timer-alert').addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        });
    },

    logSession() {
        const data = StorageManager.load();
        data.analytics.studySessions.push({
            date: new Date().toISOString().split('T')[0],
            durationMinutes: this.duration,
            subjectId: null
        });
        StorageManager.update('analytics', data.analytics);
        if (typeof PomodoroModule !== 'undefined') PomodoroModule.renderLog();
    }
};

// Request notification permission on first load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
