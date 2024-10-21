// Loome muutujad, et salvestada kasutajad ja loginud kasutaja
let users = JSON.parse(localStorage.getItem('users')) || []; // Laadi kasutajad localStorage'ist
let loggedInUser = null;

// Kuva autentimise vorm
document.getElementById('register-btn').addEventListener('click', function() {
    showAuthForm('register');
});

document.getElementById('login-btn').addEventListener('click', function() {
    showAuthForm('login');
});

// Kui kasutaja on registreerimislehel ja soovib logida sisse
document.getElementById('to-login-btn').addEventListener('click', function() {
    showAuthForm('login');
});

// Kui kasutaja on sisselogimislehel ja soovib luua konto
document.getElementById('to-register-btn').addEventListener('click', function() {
    showAuthForm('register');
});

// Funktsioon autentimise vormi kuvamiseks
function showAuthForm(mode) {
    document.getElementById('main-menu').style.display = 'none'; // Peida peamenüü
    document.getElementById('auth-container').style.display = 'block'; // Näita vormi konteinerit

    if (mode === 'register') {
        document.getElementById('form-title').textContent = 'Kasutaja loomine'; // Muuda pealkiri
        document.getElementById('submit-btn').textContent = 'Loo kasutaja'; // Muuda nupu tekst
        document.getElementById('to-register-btn').style.display = 'none'; // Peida "Loo kasutaja" nupp
        document.getElementById('to-login-btn').style.display = 'block'; // Näita "Logi sisse" nuppu
    } else {
        document.getElementById('form-title').textContent = 'Sisselogimine'; // Muuda pealkiri
        document.getElementById('submit-btn').textContent = 'Logi sisse'; // Muuda nupu tekst
        document.getElementById('to-register-btn').style.display = 'block'; // Näita "Loo kasutaja" nuppu
        document.getElementById('to-login-btn').style.display = 'none'; // Peida "Logi sisse" nupp
    }
}

// Kasutaja loomise vormi käsitlemine
document.getElementById('user-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Vältige vormi vaikimisi käitumist

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Eemaldage võimalikud veateated
    document.getElementById('username').classList.remove('error');

    if (document.getElementById('submit-btn').textContent === 'Loo kasutaja') {
        createUser(username, password);
    } else {
        loginUser(username, password);
    }

    // Tühjendage vorm
    document.getElementById('user-form').reset();
});

// Funktsioon kasutaja loomiseks
function createUser(username, password) {
    // Kontrolli, kas kasutajanimi juba eksisteerib
    if (users.find(user => user.username === username)) {
        alert('Kasutajanimi on juba olemas. Palun vali teine.');
        document.getElementById('username').classList.add('error');
        return;
    }

    // Lisa uus kasutaja
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users)); // Salvesta localStorage'isse
    alert('Kasutaja loodud!');

    // Naase algsesse vaatesse
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

// Funktsioon kasutaja sisselogimiseks
function loginUser(username, password) {
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        loggedInUser = user;
        alert('Sisse logitud!');

        // Kuvame kasutaja nime
        document.getElementById('user-name').textContent = username;

        // Näita treeningute lisamise vormi
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('workout-container').style.display = 'block';
    } else {
        alert('Vale kasutajanimi või parool.');
        document.getElementById('username').classList.add('error');
    }
}

// Treeningu lisamise vormi käsitlemine
document.getElementById('workout-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Vältige vormi vaikimisi käitumist

    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const duration = document.getElementById('duration').value;

    addWorkout(date, type, duration);

    // Tühjendage vorm
    document.getElementById('workout-form').reset();
});

// Funktsioon treeningu lisamiseks
function addWorkout(date, type, duration) {
    const workoutList = document.getElementById('workout-list');

    const li = document.createElement('li');
    li.innerHTML = `
        <span>${date} - ${type} (${duration} min)</span>
        <span class="delete" onclick="deleteWorkout(this)">Kustuta</span>
    `;

    workoutList.appendChild(li);
}

// Funktsioon treeningu kustutamiseks
function deleteWorkout(element) {
    const workoutList = document.getElementById('workout-list');
    workoutList.removeChild(element.parentElement);
}

// Logi välja nupp
document.getElementById('logout-btn').addEventListener('click', function() {
    loggedInUser = null;
    document.getElementById('workout-container').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    alert('Oled välja logitud.');
});
