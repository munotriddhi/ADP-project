const TasksModule = {
    init() {
        this.list     = document.getElementById('dash-tasks');
        this.fill     = document.getElementById('task-progress-fill');
        this.stat     = document.getElementById('stat-tasks');
        this.fullList = document.getElementById('full-task-list');
        this.modal    = document.getElementById('task-modal');
        this.form     = document.getElementById('task-form');
        this.fTitle   = document.getElementById('task-title');
        this.fPri     = document.getElementById('task-priority');
        this.fId      = document.getElementById('task-id');
        this.mTitle   = document.getElementById('task-modal-title');

        document.getElementById('btn-add-task')?.addEventListener('click', () => this.open());
        document.getElementById('btn-add-task-full')?.addEventListener('click', () => this.open());
        document.getElementById('close-task-modal')?.addEventListener('click', () => this.close());
        this.form?.addEventListener('submit', e => this.save(e));
        this.modal?.addEventListener('click', e => { if (e.target === this.modal) this.close(); });

        const handleClick = (e) => {
            const row = e.target.closest('.dash-task-item');
            if (!row) return;
            const id = row.dataset.id;
            if (e.target.closest('.delete-task')) return this.remove(id);
            if (e.target.closest('.edit-task'))   return this.open(id);
            if (e.target.type === 'checkbox')     return this.toggle(id, e.target.checked);
        };
        this.list?.addEventListener('click', handleClick);
        this.fullList?.addEventListener('click', handleClick);
        this.list?.addEventListener('change', e => { if (e.target.type==='checkbox') { const r=e.target.closest('.dash-task-item'); if(r) this.toggle(r.dataset.id, e.target.checked); }});
        this.fullList?.addEventListener('change', e => { if (e.target.type==='checkbox') { const r=e.target.closest('.dash-task-item'); if(r) this.toggle(r.dataset.id, e.target.checked); }});

        this.render();
    },

    open(id = null) {
        this.form.reset(); this.fId.value = ''; this.mTitle.textContent = 'Add New Task';
        if (id) {
            const t = StorageManager.load().tasks.find(t => t.id === id);
            if (t) { this.fId.value = t.id; this.fTitle.value = t.title; this.fPri.value = t.priority; this.mTitle.textContent = 'Edit Task'; }
        }
        this.modal.classList.add('active'); this.fTitle.focus();
    },
    close() { this.modal.classList.remove('active'); },

    save(e) {
        e.preventDefault();
        const data = StorageManager.load(), id = this.fId.value;
        const obj = { title: this.fTitle.value.trim(), priority: this.fPri.value };
        if (!obj.title) return;
        if (id) { const idx = data.tasks.findIndex(t => t.id === id); if (idx !== -1) Object.assign(data.tasks[idx], obj); }
        else { data.tasks.push({ id: 'task_' + Date.now(), ...obj, status: 'pending', dueDate: new Date().toISOString().split('T')[0] }); }
        StorageManager.update('tasks', data.tasks); this.close(); this.render(); this.renderFull();
    },

    remove(id) {
        const data = StorageManager.load();
        data.tasks = data.tasks.filter(t => t.id !== id);
        StorageManager.update('tasks', data.tasks); this.render(); this.renderFull();
    },

    toggle(id, done) {
        const data = StorageManager.load(), t = data.tasks.find(t => t.id === id);
        if (t) { t.status = done ? 'completed' : 'pending'; StorageManager.update('tasks', data.tasks); this.render(); this.renderFull(); }
    },

    _renderInto(container, tasks) {
        container.innerHTML = '';
        if (tasks.length === 0) { container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:1.5rem 0;font-size:0.88rem">No tasks yet — click <b>+</b> to add one.</p>'; return; }
        tasks.forEach(t => {
            const isDone = t.status === 'completed';
            const el = document.createElement('div'); el.className = 'dash-task-item'; el.dataset.id = t.id;
            el.innerHTML = `<input type="checkbox" ${isDone?'checked':''}><span class="dash-task-title" style="${isDone?'text-decoration:line-through;opacity:0.5':''}">${this.esc(t.title)}</span><span class="badge ${t.priority}">${t.priority}</span><div class="task-actions"><button class="action-btn edit-task" title="Edit"><i class="ph ph-pencil-simple"></i></button><button class="action-btn delete delete-task" title="Delete"><i class="ph ph-trash"></i></button></div>`;
            container.appendChild(el);
        });
    },

    render() {
        const tasks = StorageManager.load().tasks || [];
        if (this.list) this._renderInto(this.list, tasks);
        let done = tasks.filter(t => t.status === 'completed').length;
        const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
        if (this.fill) this.fill.style.width = pct + '%';
        if (this.stat) this.stat.textContent = `${done}/${tasks.length}`;
    },

    renderFull() {
        const tasks = StorageManager.load().tasks || [];
        if (this.fullList) this._renderInto(this.fullList, tasks);
    },

    esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
};
