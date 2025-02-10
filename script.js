// Fonction pour la gestion des utilisateurs ou l'upload de fichiers
async function submitForm(url, formData) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    const data = await response.json();
    return data;
}

// Pour gérer l'inscription
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const data = await submitForm('http://localhost:5000/register', { username, password });
    alert(data.message);
});

// Pour gérer la connexion
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const data = await submitForm('http://localhost:5000/login', { username, password });
    alert(data.message);
    if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'index.html';  // Redirection vers la page d'accueil
    }
});

