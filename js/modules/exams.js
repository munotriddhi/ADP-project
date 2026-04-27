const ExamsModule = {
    init() {
        this.list     = document.getElementById('dash-exams');
        this.stat     = document.getElementById('stat-exam');
        this.fullList = document.getElementById('full-exam-list');
        this.modal    = document.getElementById('exam-modal');
        this.form     = document.getElementById('exam-form');
        this.fTitle   = document.getElementById('exam-title');
        this.fDate    = document.getElementById('exam-date');
        this.fId      = document.getElementById('exam-id');
        this.mTitle   = document.getElementById('exam-modal-title');

        document.getElementById('btn-add-exam')?.addEventListener('click', () => this.open());
        document.getElementById('btn-add-exam-full')?.addEventListener('click', () => this.open());
        document.getElementById('close-exam-modal')?.addEventListener('click', () => this.close());
        this.form?.addEventListener('submit', e => this.save(e));
        this.modal?.addEventListener('click', e => { if (e.target === this.modal) this.close(); });

        const handleClick = (e) => {
            const row = e.target.closest('.exam-item') || e.target.closest('.exam-countdown-card');
            if (!row) return;
            const id = row.dataset.id;
            if (e.target.closest('.delete-exam')) return this.remove(id);
            if (e.target.closest('.edit-exam'))   return this.open(id);
        };
        this.list?.addEventListener('click', handleClick);
        this.fullList?.addEventListener('click', handleClick);
        this.render();
    },

    open(id = null) {
        this.form.reset(); this.fId.value = ''; this.mTitle.textContent = 'Add New Exam';
        if (id) {
            const ex = StorageManager.load().exams.find(e => e.id === id);
            if (ex) { this.fId.value = ex.id; this.fTitle.value = ex.title; this.fDate.value = ex.date; this.mTitle.textContent = 'Edit Exam'; }
        }
        this.modal.classList.add('active'); this.fTitle.focus();
    },
    close() { this.modal.classList.remove('active'); },

    save(e) {
        e.preventDefault();
        const data = StorageManager.load(), id = this.fId.value;
        const obj = { title: this.fTitle.value.trim(), date: this.fDate.value };
        if (!obj.title || !obj.date) return;
        if (id) { const idx = data.exams.findIndex(ex => ex.id === id); if (idx !== -1) Object.assign(data.exams[idx], obj); }
        else { data.exams.push({ id: 'exam_' + Date.now(), ...obj }); }
        StorageManager.update('exams', data.exams); this.close(); this.render(); this.renderFull();
    },

    remove(id) {
        const data = StorageManager.load();
        data.exams = data.exams.filter(e => e.id !== id);
        StorageManager.update('exams', data.exams); this.render(); this.renderFull();
    },

    daysLeft(d) { const now = new Date(); now.setHours(0,0,0,0); return Math.ceil((new Date(d+'T00:00:00') - now) / 86400000); },

    render() {
        const exams = (StorageManager.load().exams||[]).slice().sort((a,b) => new Date(a.date) - new Date(b.date));
        if (!this.list) return; this.list.innerHTML = '';
        const future = exams.filter(e => this.daysLeft(e.date) >= 0);
        if (this.stat) this.stat.textContent = future.length ? this.daysLeft(future[0].date) : '--';
        if (exams.length === 0) { this.list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:1.5rem 0;font-size:0.88rem">No exams — click <b>+</b> to add.</p>'; return; }
        exams.slice(0, 3).forEach(ex => {
            const days = this.daysLeft(ex.date); let cls='relaxed', txt=`${days}d`;
            if (days<0){cls='urgent';txt='Passed';}else if(days===0){cls='urgent';txt='Today!';}else if(days<=3){cls='urgent';}else if(days<=14){cls='soon';}
            const fmtDate = new Date(ex.date+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});
            const el = document.createElement('div'); el.className = 'exam-item'; el.dataset.id = ex.id;
            el.innerHTML = `<div class="exam-info"><h4>${this.esc(ex.title)}</h4><p>${fmtDate}</p></div><div style="display:flex;align-items:center;gap:0.4rem"><span class="pill ${cls}">${txt}</span><div class="task-actions"><button class="action-btn edit-exam" title="Edit"><i class="ph ph-pencil-simple"></i></button><button class="action-btn delete delete-exam" title="Delete"><i class="ph ph-trash"></i></button></div></div>`;
            this.list.appendChild(el);
        });
    },

    renderFull() {
        const exams = (StorageManager.load().exams||[]).slice().sort((a,b) => new Date(a.date) - new Date(b.date));
        if (!this.fullList) return; this.fullList.innerHTML = '';
        if (exams.length === 0) { this.fullList.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem">No exams. Click "Add Exam" to get started.</p>'; return; }
        exams.forEach(ex => {
            const days = this.daysLeft(ex.date); let cls='relaxed', borderColor='var(--success)';
            if(days<0){cls='urgent';borderColor='var(--text-secondary)';}else if(days<=3){cls='urgent';borderColor='var(--danger)';}else if(days<=14){cls='soon';borderColor='var(--warning)';}
            const fmtDate = new Date(ex.date+'T00:00:00').toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});
            const el = document.createElement('div'); el.className = 'card exam-countdown-card'; el.dataset.id = ex.id;
            el.style.borderLeft = `4px solid ${borderColor}`;
            el.innerHTML = `<div class="card-header" style="margin-bottom:0.5rem"><h3>${this.esc(ex.title)}</h3><div class="task-actions"><button class="action-btn edit-exam" title="Edit"><i class="ph ph-pencil-simple"></i></button><button class="action-btn delete delete-exam" title="Delete"><i class="ph ph-trash"></i></button></div></div><p style="color:var(--text-secondary);font-size:0.88rem">${fmtDate}</p><div style="font-size:2rem;font-weight:700;margin-top:0.5rem;color:${borderColor}">${days < 0 ? 'Passed' : days === 0 ? 'TODAY' : days + ' days'}</div>`;
            this.fullList.appendChild(el);
        });
    },

    esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
};
