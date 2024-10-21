// Loome muutujad kasutajate ja treeningute haldamiseks
let users = JSON.parse(localStorage.getItem('users')) || [];
let loggedInUser = null;
let workouts = [];

// Kuva autentimise vorm
document.getElementById('register-btn').addEventListener('click', function() {
    showAuthForm('register');
});

document.getElementById('login-btn').addEventListener('click', function() {
    showAuthForm('login');
});

document.getElementById('to-login-btn').addEventListener('click', function() {
    showAuthForm('login');
});

document.getElementById('to-register-btn').addEventListener('click', function() {
    showAuthForm('register');
});

function showAuthForm(mode) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';

    if (mode === 'register') {
        document.getElementById('form-title').textContent = 'Kasutaja loomine';
        document.getElementById('submit-btn').textContent = 'Loo kasutaja';
        document.getElementById('to-register-btn').style.display = 'none';
        document.getElementById('to-login-btn').style.display = 'block';
    } else {
        document.getElementById('form-title').textContent = 'Sisselogimine';
        document.getElementById('submit-btn').textContent = 'Logi sisse';
        document.getElementById('to-register-btn').style.display = 'block';
        document.getElementById('to-login-btn').style.display = 'none';
    }
}

document.getElementById('user-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (document.getElementById('submit-btn').textContent === 'Loo kasutaja') {
        createUser(username, password);
    } else {
        loginUser(username, password);
    }

    document.getElementById('user-form').reset();
});

function createUser(username, password) {
    if (users.find(user => user.username === username)) {
        alert('Kasutajanimi on juba olemas.');
        document.getElementById('username').classList.add('error');
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Kasutaja loodud!');

    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

function loginUser(username, password) {
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        loggedInUser = user;
        document.getElementById('user-name').textContent = username;
        alert('Sisse logitud!');
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('workout-container').style.display = 'block';
    } else {
        alert('Vale kasutajanimi või parool.');
        document.getElementById('username').classList.add('error');
    }
}

// Treeningu lisamine
document.getElementById('workout-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const duration = document.getElementById('duration').value;

    addWorkout(date, type, duration);

    document.getElementById('workout-form').reset();
});

function addWorkout(date, type, duration) {
    const workoutList = document.getElementById('workout-list');

    const li = document.createElement('li');
    li.innerHTML = `
        <span>${date} - ${type} (${duration} min)</span>
        <span class="delete" onclick="deleteWorkout(this)">Kustuta</span>
    `;

    workoutList.appendChild(li);
    workouts.push({ date, type, duration });
}

// Treeningu kustutamine
function deleteWorkout(element) {
    const workoutList = document.getElementById('workout-list');
    workoutList.removeChild(element.parentElement);
}

// Otsing
document.getElementById('search-bar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    if (searchTerm === '') return;

    const filteredWorkouts = workouts.filter(workout => workout.type.toLowerCase().startsWith(searchTerm));

    filteredWorkouts.forEach(workout => {
        const li = document.createElement('li');
        li.textContent = `${workout.date} - ${workout.type} (${workout.duration} min)`;
        searchResults.appendChild(li);
    });
});

// Logi välja
document.getElementById('logout-btn').addEventListener('click', function() {
    loggedInUser = null;
    document.getElementById('workout-container').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
});
