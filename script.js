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
        alert('Kasutajanimi on juba olemas. Palun vali teine.');
        document.getElementById('username').classList.add('error');
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Kasutaja loodud!');
    showAuthForm('login');
}

function loginUser(username, password) {
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        loggedInUser = user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('user-name').textContent = username;
    } else {
        alert('Vale kasutajanimi või parool.');
        document.getElementById('username').classList.add('error');
    }
}

// Ristkülikute klikkimine
document.getElementById('workout-page').addEventListener('click', function() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('workout-container').style.display = 'block';
});

document.getElementById('timeline-page').addEventListener('click', function() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('timeline-container').style.display = 'block';
    showTimeline();
});

document.getElementById('ai-suggestions-page').addEventListener('click', function() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('ai-container').style.display = 'block';
    generateAISuggestions();
});

document.getElementById('profile-page').addEventListener('click', function() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('profile-container').style.display = 'block';
});

// Tagasi nupud
const backButtons = document.querySelectorAll('.back-btn');
backButtons.forEach(button => {
    button.addEventListener('click', function() {
        this.parentElement.style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    });
});

// Treeningute lisamine
document.getElementById('workout-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const duration = document.getElementById('duration').value;
    const calories = document.getElementById('calories').value;

    const workout = { date, type, duration, calories };
    workouts.push(workout);
    addWorkoutToList(workout);

    document.getElementById('workout-form').reset();
});

function addWorkoutToList(workout) {
    const workoutList = document.getElementById('workout-list');
    const li = document.createElement('li');
    li.innerHTML = `${workout.date} - ${workout.type} (${workout.duration} min, ${workout.calories} kcal) <span class="delete" onclick="deleteWorkout(this)">Kustuta</span>`;
    workoutList.appendChild(li);
}

function deleteWorkout(element) {
    const index = Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement);
    workouts.splice(index, 1);
    element.parentElement.remove();
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
        li.textContent = `${workout.date} - ${workout.type} (${workout.duration} min, ${workout.calories} kcal)`;
        searchResults.appendChild(li);
    });
});

// Ajajoone kuvamine
function showTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    // Sorteeri treeningud kuupäeva järgi
    const sortedWorkouts = workouts.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedWorkouts.forEach((workout, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';

        const circle = document.createElement('div');
        circle.className = 'circle';
        item.appendChild(circle);

        if (index < sortedWorkouts.length - 1) {
            const line = document.createElement('div');
            line.className = 'line';
            item.appendChild(line);
        }

        const info = document.createElement('p');
        info.textContent = `${workout.date} - ${workout.type}`;
        item.appendChild(info);

        timeline.appendChild(item);
    });
}

// Tehisintellekti soovituste genereerimine
function generateAISuggestions() {
    const aiSuggestionsContainer = document.getElementById('ai-suggestions');
    aiSuggestionsContainer.innerHTML = '';

    if (workouts.length === 0) {
        aiSuggestionsContainer.innerHTML = '<p>Tehisintellektil puuduvad andmed soovituste tegemiseks. Palun sisesta mõned treeningud.</p>';
        return;
    }

    // Loendame, milliseid treeninguid on kõige rohkem tehtud
    const workoutCounts = {};
    workouts.forEach(workout => {
        if (workoutCounts[workout.type]) {
            workoutCounts[workout.type]++;
        } else {
            workoutCounts[workout.type] = 1;
        }
    });

    // Leiame kõige  sagedamini tehtud treeningu tüübi
    const favoriteWorkout = Object.keys(workoutCounts).reduce((a, b) => workoutCounts[a] > workoutCounts[b] ? a : b);

    // Loome soovitused
    const suggestions = [
        `Kuna sulle meeldib ${favoriteWorkout}, soovitame proovida järgmist treeningut: ${favoriteWorkout} kõrgema intensiivsusega.`,
        `Proovi vahelduseks ${favoriteWorkout} intervalltreeningut, et parandada oma vastupidavust.`,
        `Et täiendada oma ${favoriteWorkout} treeninguid, lisage oma kavasse ka jõutreeningut.`
    ];

    // Kuvame soovitused
    suggestions.forEach(suggestion => {
        const p = document.createElement('p');
        p.textContent = suggestion;
        aiSuggestionsContainer.appendChild(p);
    });
}

// Logi välja
document.getElementById('logout-btn').addEventListener('click', function() {
    loggedInUser = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    alert('Oled välja logitud.');
});
