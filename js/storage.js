// =========================================
// Storage Manager — LocalStorage CRUD
// =========================================
const StorageManager = {
    KEY: 'studyPlannerData',

    DEFAULT: {
        settings: { theme: 'dark', accentColor: '#818cf8' },
        subjects: [],
        timetable: [],
        tasks: [],
        exams: [],
        notes: [],
        analytics: {
            studySessions: [],
            streak: 0,
            lastActive: new Date().toISOString().split('T')[0]
        }
    },

    setKey(newKey) {
        this.KEY = newKey;
    },

    init() {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) {
            this.save(this.DEFAULT);
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            // Deep-merge with defaults
            const merged = {
                ...this.DEFAULT,
                ...parsed,
                settings:  { ...this.DEFAULT.settings,  ...(parsed.settings  || {}) },
                analytics: { ...this.DEFAULT.analytics, ...(parsed.analytics || {}) }
            };
            this.save(merged);
        } catch (e) {
            console.warn('StorageManager: corrupted data, resetting.', e);
            this.save(this.DEFAULT);
        }
    },

    load() {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : this.DEFAULT;
        } catch (e) {
            return this.DEFAULT;
        }
    },

    save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    update(key, value) {
        const data = this.load();
        data[key] = value;
        this.save(data);
    }
};
