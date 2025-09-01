class UserAuth {
    constructor(apiBase) {
        this.apiBase = apiBase;
    }

    async signup(username, email, password) {
        try {
            const res = await fetch(`${this.apiBase}/signup`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username, email, password })
            });
            return await res.json();
        } catch (err) {
            console.error("Signup fetch failed:", err);
            return { success: false, message: "Network error" };
        }
    }

    async login(username, password) {
        try {
            const res = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username, password })
            });
            return await res.json();
        } catch (err) {
            console.error("Login fetch failed:", err);
            return { success: false, message: "Network error" };
        }
    }

    async getProfile() {
        try {
            const res = await fetch(`${this.apiBase}/profile`);
            return await res.json();
        } catch {
            return { loggedIn: false };
        }
    }

    async logout() {
        try {
            const res = await fetch(`${this.apiBase}/logout`, { method: 'POST' });
            return await res.json();
        } catch {
            return { success: false, message: "Logout failed" };
        }
    }
}

const auth = new UserAuth('http://localhost:3000');

// --- SIGNUP ---
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const result = await auth.signup(username, email, password);
        console.log("Signup result:", result);

        alert(result.message);

        // Loose equality to handle string/boolean
        if (result.success == true || result.success == "true") {
            // redirect after alert closes
            setTimeout(() => window.location.href = '/index.html', 50);
        }
    });
}

// --- LOGIN ---
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const result = await auth.login(username, password);
        console.log("Login result:", result);

        alert(result.message);

        if (result.success == true || result.success == "true") {
            setTimeout(() => window.location.href = '/profile.html', 50);
        }
    });
}

// --- PROFILE ---
if (document.getElementById('profile')) {
    window.onload = async () => {
        const profile = await auth.getProfile();
        console.log("Profile fetched:", profile);

        if (!profile.loggedIn) return window.location.href = '/index.html';

        document.getElementById('profile').innerHTML = `
            <p>Username: ${profile.username}</p>
            <p>Email: ${profile.email}</p>
            <p>Account Created: ${profile.createdAt}</p>
            <p>Logged In: ${profile.loggedIn}</p>
        `;
    };

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const result = await auth.logout();
        console.log("Logout result:", result);
        setTimeout(() => window.location.href = '/index.html', 50);
    });
}
