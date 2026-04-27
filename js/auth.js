// =========================================
// Auth Manager — Handle Login/Signup
// =========================================
const AuthManager = {
    USER_KEY: 'studyPlannerUsers',
    SESSION_KEY: 'studyPlannerCurrentSession',

    init() {
        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.authOverlay = document.getElementById('auth-overlay');
        this.appContainer = document.getElementById('app-container');
        this.logoutBtn = document.getElementById('btn-logout');
        
        this.showSignupLink = document.getElementById('show-signup');
        this.showLoginLink = document.getElementById('show-login');

        this.showSignupLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginForm.style.display = 'none';
            this.signupForm.style.display = 'block';
        });

        this.showLoginLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.signupForm.style.display = 'none';
            this.loginForm.style.display = 'block';
        });

        this.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm?.addEventListener('submit', (e) => this.handleSignup(e));
        this.logoutBtn?.addEventListener('click', () => this.handleLogout());

        // Profile Modal Logic
        this.profilePill = document.querySelector('.profile-pill');
        this.profileModal = document.getElementById('profile-modal');
        this.closeProfModal = document.getElementById('close-profile-modal');
        this.profForm = document.getElementById('profile-details-form');

        this.profilePill?.addEventListener('click', () => this.openProfile());
        this.closeProfModal?.addEventListener('click', () => this.profileModal.classList.remove('active'));
        this.profForm?.addEventListener('submit', (e) => this.saveProfile(e));

        this.checkAuth();
    },

    checkAuth() {
        const user = localStorage.getItem(this.SESSION_KEY);
        if (user) {
            this.onAuthSuccess(user);
        } else {
            this.onAuthRequired();
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value;

        const users = JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
        const found = users.find(u => u.username === user && u.password === pass);

        if (found) {
            localStorage.setItem(this.SESSION_KEY, user);
            this.onAuthSuccess(user);
        } else {
            alert('Invalid username or password.');
        }
    },

    handleSignup(e) {
        e.preventDefault();
        const user = document.getElementById('signup-user').value.trim();
        const pass = document.getElementById('signup-pass').value;
        const confirm = document.getElementById('signup-pass-confirm').value;

        if (pass.length < 4) {
            alert('Password must be at least 4 characters.');
            return;
        }

        if (pass !== confirm) {
            alert('Passwords do not match.');
            return;
        }

        const users = JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
        if (users.find(u => u.username.toLowerCase() === user.toLowerCase())) {
            alert('Username already exists.');
            return;
        }

        users.push({ 
            username: user, 
            password: pass,
            fullName: '',
            email: '',
            className: ''
        });
        localStorage.setItem(this.USER_KEY, JSON.stringify(users));
        localStorage.setItem(this.SESSION_KEY, user);
        this.onAuthSuccess(user);
    },

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem(this.SESSION_KEY);
            location.reload();
        }
    },

    openProfile() {
        const user = localStorage.getItem(this.SESSION_KEY);
        const users = JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
        const found = users.find(u => u.username === user);
        
        if (found) {
            document.getElementById('prof-modal-username').textContent = found.username;
            document.getElementById('prof-fullname').value = found.fullName || '';
            document.getElementById('prof-email').value = found.email || '';
            document.getElementById('prof-class').value = found.className || '';
            this.profileModal.classList.add('active');
        }
    },

    saveProfile(e) {
        e.preventDefault();
        const user = localStorage.getItem(this.SESSION_KEY);
        const users = JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
        const idx = users.findIndex(u => u.username === user);

        if (idx !== -1) {
            users[idx].fullName = document.getElementById('prof-fullname').value;
            users[idx].email = document.getElementById('prof-email').value;
            users[idx].className = document.getElementById('prof-class').value;
            
            localStorage.setItem(this.USER_KEY, JSON.stringify(users));
            this.profileModal.classList.remove('active');
            
            // Update display name if full name exists
            const profileName = document.getElementById('profile-display-name');
            if (profileName) profileName.textContent = users[idx].fullName || users[idx].username;
            
            alert('Profile updated successfully!');
        }
    },

    onAuthSuccess(username) {
        this.authOverlay.classList.remove('active');
        this.appContainer.style.display = 'flex';
        
        // Update storage key to user-specific
        StorageManager.setKey(`studyPlannerData_${username}`);
        StorageManager.init();

        // Update UI
        const users = JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
        const current = users.find(u => u.username === username);
        
        const welcome = document.getElementById('user-welcome');
        if (welcome) welcome.textContent = `Welcome back, ${current?.fullName || username}! Let's make today productive.`;
        
        const profileName = document.getElementById('profile-display-name');
        if (profileName) profileName.textContent = current?.fullName || username;

        // Initialize the rest of the application
        if (window.App) window.App.init(); 
    },

    onAuthRequired() {
        this.authOverlay.classList.add('active');
        this.appContainer.style.display = 'none';
        
        // Ensure theme is loaded even on auth screen
        ThemeManager.init();
    }
};
