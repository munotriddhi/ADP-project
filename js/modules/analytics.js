// =========================================
// Analytics Module — Chart + GPA + Streak
// =========================================
const AnalyticsModule = {
    chart: null, courses: [],

    init() {
        this.renderStreak();
        this.setupGPA();
        this.setupExport();

        // Full page "Add" buttons wiring to shared modals
        document.getElementById('btn-add-task-full')?.addEventListener('click', () => TasksModule.open());
        document.getElementById('btn-add-exam-full')?.addEventListener('click', () => ExamsModule.open());
        document.getElementById('btn-add-class-full')?.addEventListener('click', () => TimetableModule.open());
    },

    renderChart() {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx) return;
        if (this.chart) this.chart.destroy();
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#818cf8';
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

    renderStreak() {
        const data = StorageManager.load();
        const el = document.getElementById('analytics-streak');
        if (el) el.textContent = data.analytics.streak || 0;
    },

    setupGPA() {
        const addBtn = document.getElementById('gpa-add');
        if (!addBtn) return;
        addBtn.addEventListener('click', () => {
            const grade = parseFloat(document.getElementById('gpa-grade')?.value);
            const credits = parseInt(document.getElementById('gpa-credits')?.value);
            if (isNaN(grade) || isNaN(credits)) return;
            this.courses.push({ grade, credits });
            this.renderGPA();
        });
    },

    renderGPA() {
        const listEl = document.getElementById('gpa-list');
        const resultEl = document.getElementById('gpa-result');
        if (!listEl || !resultEl) return;

        listEl.innerHTML = this.courses.map((c, i) =>
            `<div class="dash-task-item" style="margin-bottom:0.4rem">
                <span class="dash-task-title">Course ${i+1}: Grade ${c.grade}, ${c.credits} credits</span>
                <button class="action-btn delete" onclick="AnalyticsModule.removeCourse(${i})" title="Remove"><i class="ph ph-trash"></i></button>
            </div>`
        ).join('');

        const totalCredits = this.courses.reduce((s, c) => s + c.credits, 0);
        const totalPoints = this.courses.reduce((s, c) => s + c.grade * c.credits, 0);
        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
        resultEl.textContent = `GPA: ${gpa}`;
    },

    removeCourse(i) {
        this.courses.splice(i, 1);
        this.renderGPA();
    },

    setupExport() {
        document.getElementById('btn-export')?.addEventListener('click', () => {
            const data = StorageManager.load();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'study-planner-backup.json';
            a.click();
        });

        document.getElementById('btn-clear')?.addEventListener('click', () => {
            if (confirm('This will delete ALL your data. Are you sure?')) {
                localStorage.removeItem(StorageManager.KEY);
                StorageManager.init();
                location.reload();
            }
        });
    }
};
