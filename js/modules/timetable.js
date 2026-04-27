const TimetableModule = {
    init() {
        this.list     = document.getElementById('dash-timeline');
        this.fullList = document.getElementById('full-class-list');
        this.modal    = document.getElementById('class-modal');
        this.form     = document.getElementById('class-form');
        this.fTitle   = document.getElementById('class-title');
        this.fStart   = document.getElementById('class-start');
        this.fEnd     = document.getElementById('class-end');
        this.fId      = document.getElementById('class-id');
        this.mTitle   = document.getElementById('class-modal-title');

        // OCR elements
        this.uploadBtn = document.getElementById('btn-upload-timetable');
        this.fileInput = document.getElementById('timetable-upload');
        this.ocrStatus = document.getElementById('ocr-status');
        this.ocrProgress = document.getElementById('ocr-progress');
        this.ocrModal = document.getElementById('ocr-modal');
        this.ocrResultsList = document.getElementById('ocr-results-list');
        this.ocrSaveAllBtn = document.getElementById('btn-ocr-save-all');
        this.pendingClasses = [];

        document.getElementById('btn-add-class')?.addEventListener('click', () => this.open());
        document.getElementById('btn-add-class-full')?.addEventListener('click', () => this.open());
        document.getElementById('close-class-modal')?.addEventListener('click', () => this.close());
        document.getElementById('close-ocr-modal')?.addEventListener('click', () => this.ocrModal.classList.remove('active'));
        this.form?.addEventListener('submit', e => this.save(e));
        this.modal?.addEventListener('click', e => { if (e.target === this.modal) this.close(); });

        this.uploadBtn?.addEventListener('click', () => this.fileInput.click());
        this.fileInput?.addEventListener('change', (e) => this.handleImageUpload(e));
        this.ocrSaveAllBtn?.addEventListener('click', () => this.saveOcrResults());

        const handleClick = (e) => {
            const row = e.target.closest('.timeline-item') || e.target.closest('.full-class-row');
            if (!row) return;
            const id = row.dataset.id;
            if (e.target.closest('.delete-class')) return this.remove(id);
            if (e.target.closest('.edit-class'))   return this.open(id);
        };
        this.list?.addEventListener('click', handleClick);
        this.fullList?.addEventListener('click', handleClick);
        this.render();
    },

    async handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        this.ocrStatus.style.display = 'flex';
        this.ocrProgress.textContent = 'Preparing image...';

        try {
            // --- Image Pre-processing for better OCR ---
            const processedImage = await this.preprocessImage(file);
            
            this.ocrProgress.textContent = 'Initializing AI...';
            const { data: { text } } = await Tesseract.recognize(processedImage, 'eng', {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        this.ocrProgress.textContent = `Reading: ${Math.round(m.progress * 100)}%`;
                    }
                }
            });

            this.parseTimetableText(text);
        } catch (err) {
            console.error('OCR Error:', err);
            alert('Failed to read image. Please ensure you are online and using a clear photo.');
        } finally {
            this.ocrStatus.style.display = 'none';
            this.fileInput.value = ''; 
        }
    },

    async preprocessImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw image
                    ctx.drawImage(img, 0, 0);
                    
                    // Basic Binarization / Contrast increase
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        // Increase contrast: boost high values, dim low values
                        const val = avg > 128 ? 255 : 0; 
                        data[i] = data[i+1] = data[i+2] = val;
                    }
                    ctx.putImageData(imageData, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    parseTimetableText(text) {
        console.log('Processed Text:', text);
        const timeRegex = /(\d{1,2}[:.]\d{2})\s*(AM|PM)?/gi;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
        
        this.pendingClasses = [];
        let currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const dayFound = daysOfWeek.find(d => line.toLowerCase().includes(d.toLowerCase()));
            if (dayFound) currentDay = dayFound;

            const matches = [...line.matchAll(timeRegex)];
            if (matches.length >= 1) {
                let title = line.replace(timeRegex, '').replace(/[-–|]/g, '').trim();
                
                if (title.length < 3) {
                    if (i > 0 && ![...lines[i-1].matchAll(timeRegex)].length) {
                        title = lines[i-1];
                    } else if (i < lines.length - 1 && ![...lines[i+1].matchAll(timeRegex)].length) {
                        title = lines[i+1];
                    }
                }

                title = title.replace(/[^\w\s]/gi, '').trim(); 
                if (title.length < 2) title = "Class Entry";

                let startTime = this.normalizeTime(matches[0][0]);
                let endTime = matches[1] ? this.normalizeTime(matches[1][0]) : this.addHour(startTime);

                this.pendingClasses.push({
                    id: 'temp_' + Date.now() + Math.random(),
                    title: title,
                    startTime: startTime,
                    endTime: endTime,
                    day: currentDay
                });
            }
        }

        if (this.pendingClasses.length > 0) {
            this.showOcrReview();
        } else {
            alert("Reading complete, but I couldn't find a clear schedule pattern. \n\nTip: Use a photo where the text is horizontal and the lighting is even.");
        }
    },

    showOcrReview() {
        this.ocrResultsList.innerHTML = '';
        this.pendingClasses.forEach((cls, idx) => {
            const div = document.createElement('div');
            div.className = 'dash-task-item';
            div.style.padding = '0.5rem';
            div.innerHTML = `
                <div style="flex:1">
                    <input type="text" value="${cls.title}" onchange="TimetableModule.pendingClasses[${idx}].title = this.value" style="background:transparent; border:none; color:var(--text-primary); font-weight:600; width:100%">
                    <div style="display:flex; gap:0.5rem; margin-top:0.25rem">
                        <input type="time" value="${cls.startTime}" onchange="TimetableModule.pendingClasses[${idx}].startTime = this.value" style="background:transparent; border:none; color:var(--text-secondary); font-size:0.8rem">
                        <span style="color:var(--text-secondary); font-size:0.8rem">to</span>
                        <input type="time" value="${cls.endTime}" onchange="TimetableModule.pendingClasses[${idx}].endTime = this.value" style="background:transparent; border:none; color:var(--text-secondary); font-size:0.8rem">
                    </div>
                </div>
                <button class="action-btn delete" onclick="this.parentElement.remove(); TimetableModule.pendingClasses[${idx}].deleted=true"><i class="ph ph-trash"></i></button>
            `;
            this.ocrResultsList.appendChild(div);
        });
        this.ocrModal.classList.add('active');
    },

    saveOcrResults() {
        const data = StorageManager.load();
        const toAdd = this.pendingClasses.filter(c => !c.deleted).map(c => ({
            ...c,
            id: 'cls_' + Date.now() + Math.random()
        }));

        data.timetable.push(...toAdd);
        StorageManager.update('timetable', data.timetable);
        this.render();
        this.renderFull();
        this.ocrModal.classList.remove('active');
        alert(`Successfully saved ${toAdd.length} classes!`);
    },

    normalizeTime(timeStr) {
        let clean = timeStr.replace('.', ':').trim();
        let modifier = '';
        if (clean.toUpperCase().endsWith('PM')) { modifier = 'PM'; clean = clean.slice(0, -2).trim(); }
        else if (clean.toUpperCase().endsWith('AM')) { modifier = 'AM'; clean = clean.slice(0, -2).trim(); }

        let parts = clean.split(':');
        let h = parseInt(parts[0], 10);
        let m = parts[1] || '00';
        if (modifier === 'PM' && h < 12) h += 12;
        if (modifier === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    },

    addHour(timeStr) {
        let [h, m] = timeStr.split(':');
        let newH = (parseInt(h) + 1) % 24;
        return `${newH.toString().padStart(2, '0')}:${m}`;
    },

    open(id = null) {
        this.form.reset(); this.fId.value = ''; this.mTitle.textContent = 'Add Class';
        if (id) {
            const cls = StorageManager.load().timetable.find(c => c.id === id);
            if (cls) { 
                this.fId.value = cls.id; 
                this.fTitle.value = cls.title; 
                this.fStart.value = cls.startTime; 
                this.fEnd.value = cls.endTime; 
                if (document.getElementById('class-day')) document.getElementById('class-day').value = cls.day;
                this.mTitle.textContent = 'Edit Class'; 
            }
        }
        this.modal.classList.add('active'); this.fTitle.focus();
    },
    close() { this.modal.classList.remove('active'); },

    save(e) {
        e.preventDefault();
        const data = StorageManager.load(), id = this.fId.value;
        const daySelect = document.getElementById('class-day');
        const obj = { 
            title: this.fTitle.value.trim(), 
            startTime: this.fStart.value, 
            endTime: this.fEnd.value,
            day: daySelect ? daySelect.value : new Date().toLocaleDateString('en-US', { weekday: 'long' })
        };
        if (!obj.title || !obj.startTime || !obj.endTime) return;
        if (id) { const idx = data.timetable.findIndex(c => c.id === id); if (idx !== -1) Object.assign(data.timetable[idx], obj); }
        else { data.timetable.push({ id: 'cls_' + Date.now(), ...obj }); }
        StorageManager.update('timetable', data.timetable); this.close(); this.render(); this.renderFull();
    },

    remove(id) {
        const data = StorageManager.load();
        data.timetable = data.timetable.filter(c => c.id !== id);
        StorageManager.update('timetable', data.timetable); this.render(); this.renderFull();
    },

    fmt(t) { if (!t) return ''; const [h,m] = t.split(':'); const hr = +h%12||12; return `${hr}:${m} ${+h>=12?'PM':'AM'}`; },

    render() {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const classes = (StorageManager.load().timetable||[])
            .filter(c => c.day === today)
            .sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||''));
            
        if (!this.list) return;
        this.list.innerHTML = '';
        if (classes.length === 0) { this.list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:1.5rem 0;font-size:0.88rem">No classes today — click <b>+</b> to add.</p>'; return; }
        classes.forEach(cls => {
            const el = document.createElement('div'); el.className = 'timeline-item'; el.dataset.id = cls.id;
            el.innerHTML = `<div class="timeline-dot"></div><div class="timeline-content"><div><h4>${this.esc(cls.title)}</h4><p>${this.fmt(cls.startTime)} – ${this.fmt(cls.endTime)}</p></div><div class="task-actions"><button class="action-btn edit-class" title="Edit"><i class="ph ph-pencil-simple"></i></button><button class="action-btn delete delete-class" title="Delete"><i class="ph ph-trash"></i></button></div></div>`;
            this.list.appendChild(el);
        });
    },

    renderFull() {
        if (!this.fullList) return;
        this.fullList.innerHTML = '';
        this.fullList.className = 'weekly-grid';
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const allData = StorageManager.load().timetable || [];

        days.forEach(day => {
            const dayClasses = allData.filter(c => c.day === day).sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''));
            
            const col = document.createElement('div');
            col.className = 'day-column';
            col.innerHTML = `<h4>${day}</h4>`;
            
            if (dayClasses.length === 0) {
                col.innerHTML += `<p style="font-size:0.75rem; color:var(--text-secondary); text-align:center; margin-top:1rem; opacity:0.5">Free Day</p>`;
            }

            dayClasses.forEach(cls => {
                const card = document.createElement('div');
                card.className = 'day-class-card';
                card.dataset.id = cls.id;
                card.innerHTML = `
                    <span class="title">${this.esc(cls.title)}</span>
                    <span class="time">${this.fmt(cls.startTime)} - ${this.fmt(cls.endTime)}</span>
                    <div class="actions">
                        <button class="action-btn small edit-class"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn small delete delete-class"><i class="ph ph-trash"></i></button>
                    </div>
                `;
                col.appendChild(card);
            });
            
            this.fullList.appendChild(col);
        });
    },

    esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
};
