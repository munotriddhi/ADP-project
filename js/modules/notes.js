// =========================================
// Notes Module — Full CRUD + Search
// =========================================
const NotesModule = {
    init() {
        this.grid   = document.getElementById('notes-grid');
        this.modal  = document.getElementById('note-modal');
        this.form   = document.getElementById('note-form');
        this.fTitle = document.getElementById('note-title-input');
        this.fContent = document.getElementById('note-content');
        this.fTag   = document.getElementById('note-tag');
        this.fId    = document.getElementById('note-id');
        this.mTitle = document.getElementById('note-modal-title');
        this.search = document.getElementById('note-search');

        document.getElementById('btn-add-note')?.addEventListener('click', () => this.open());
        document.getElementById('close-note-modal')?.addEventListener('click', () => this.close());
        this.form?.addEventListener('submit', e => this.save(e));
        this.modal?.addEventListener('click', e => { if (e.target === this.modal) this.close(); });
        this.search?.addEventListener('input', () => this.render());

        this.grid?.addEventListener('click', e => {
            const card = e.target.closest('.note-card');
            if (!card) return;
            const id = card.dataset.id;
            if (e.target.closest('.delete-note')) return this.remove(id);
            if (e.target.closest('.edit-note'))   return this.open(id);
        });

        this.render();
    },

    open(id = null) {
        this.form.reset();
        this.fId.value = '';
        this.mTitle.textContent = 'Add Note';
        if (id) {
            const n = StorageManager.load().notes.find(n => n.id === id);
            if (n) {
                this.fId.value = n.id;
                this.fTitle.value = n.title;
                this.fContent.value = n.content || '';
                this.fTag.value = n.tag || '';
                this.mTitle.textContent = 'Edit Note';
            }
        }
        this.modal.classList.add('active');
        this.fTitle.focus();
    },

    close() { this.modal.classList.remove('active'); },

    save(e) {
        e.preventDefault();
        const data = StorageManager.load();
        const id = this.fId.value;
        const obj = { title: this.fTitle.value.trim(), content: this.fContent.value.trim(), tag: this.fTag.value.trim() };
        if (!obj.title) return;

        if (id) {
            const idx = data.notes.findIndex(n => n.id === id);
            if (idx !== -1) Object.assign(data.notes[idx], obj);
        } else {
            data.notes.push({ id: 'note_' + Date.now(), ...obj, timestamp: new Date().toISOString() });
        }
        StorageManager.update('notes', data.notes);
        this.close();
        this.render();
    },

    remove(id) {
        const data = StorageManager.load();
        data.notes = data.notes.filter(n => n.id !== id);
        StorageManager.update('notes', data.notes);
        this.render();
    },

    esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },

    render() {
        if (!this.grid) return;
        const query = (this.search?.value || '').toLowerCase();
        let notes = StorageManager.load().notes || [];
        if (query) notes = notes.filter(n => n.title.toLowerCase().includes(query) || (n.content||'').toLowerCase().includes(query) || (n.tag||'').toLowerCase().includes(query));

        this.grid.innerHTML = '';
        if (notes.length === 0) {
            this.grid.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;grid-column:1/-1">No notes yet.</p>';
            return;
        }
        notes.forEach(n => {
            const el = document.createElement('div');
            el.className = 'note-card card';
            el.dataset.id = n.id;
            el.innerHTML = `
                <div class="card-header" style="margin-bottom:0.5rem">
                    <h4 style="font-size:0.95rem">${this.esc(n.title)}</h4>
                    <div class="task-actions">
                        <button class="action-btn edit-note" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn delete delete-note" title="Delete"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
                <p style="font-size:0.85rem;color:var(--text-secondary);white-space:pre-wrap;max-height:120px;overflow:hidden">${this.esc(n.content || '')}</p>
                ${n.tag ? `<span class="badge medium" style="margin-top:0.75rem;display:inline-block">${this.esc(n.tag)}</span>` : ''}
            `;
            this.grid.appendChild(el);
        });
    }
};
