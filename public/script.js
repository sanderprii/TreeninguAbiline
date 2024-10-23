// Laadime dotenv paketi ja konfigureerime keskkonnamuutujad
require('dotenv').config();

// Impordi Cosmos DB klient
const { CosmosClient } = require("@azure/cosmos");

// Seadista Cosmos DB ühendus keskkonnamuutujate kaudu
const endpoint = process.env.COSMOS_DB_ENDPOINT;  // Endpoint loetud .env failist
const key = process.env.COSMOS_DB_KEY;            // Key loetud .env failist
const client = new CosmosClient({ endpoint, key });

// Andmebaasi ja konteineri ID-d
const databaseId = "fitnessAppDB";
const usersContainerId = "Users";
const workoutsContainerId = "Workouts";

// Initsialiseeri Cosmos DB ühendus
async function initCosmos() {
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    const { container: usersContainer } = await database.containers.createIfNotExists({ id: usersContainerId });
    const { container: workoutsContainer } = await database.containers.createIfNotExists({ id: workoutsContainerId });
    return { usersContainer, workoutsContainer };
}

// Globaalne muutuja konteinerite hoidmiseks
let containers = {};

// Initsialiseeri Cosmos DB ühendus, kui rakendus käivitub
initCosmos().then(res => {
    containers = res;
    console.log("Cosmos DB ühendus loodud.");
}).catch(err => console.error("Cosmos DB ühendus ebaõnnestus:", err));

// Loome muutujad kasutajate ja treeningute haldamiseks
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

async function createUser(username, password) {
    try {
        const { resources: users } = await containers.usersContainer.items.query({
            query: "SELECT * FROM c WHERE c.username = @username",
            parameters: [{ name: "@username", value: username }]
        }).fetchAll();

        if (users.length > 0) {
            alert('Kasutajanimi on juba olemas. Palun vali teine.');
            document.getElementById('username').classList.add('error');
            return;
        }

        await containers.usersContainer.items.create({ username, password });
        alert('Kasutaja loodud!');
        showAuthForm('login');
    } catch (error) {
        console.error("Kasutaja loomine ebaõnnestus:", error);
    }
}

async function loginUser(username, password) {
    try {
        const { resources: users } = await containers.usersContainer.items.query({
            query: "SELECT * FROM c WHERE c.username = @username AND c.password = @password",
            parameters: [
                { name: "@username", value: username },
                { name: "@password", value: password }
            ]
        }).fetchAll();

        if (users.length > 0) {
            loggedInUser = users[0];
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            document.getElementById('user-name').textContent = username;
        } else {
            alert('Vale kasutajanimi või parool.');
            document.getElementById('username').classList.add('error');
        }
    } catch (error) {
        console.error("Sisselogimine ebaõnnestus:", error);
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
document.getElementById('workout-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const duration = document.getElementById('duration').value;
    const calories = document.getElementById('calories').value;

    const workout = { date, type, duration, calories, username: loggedInUser.username };

    try {
        await containers.workoutsContainer.items.create(workout);
        addWorkoutToList(workout);
    } catch (error) {
        console.error("Treeningu lisamine ebaõnnestus:", error);
    }

    document.getElementById('workout-form').reset();
});

async function loadWorkouts() {
    try {
        const { resources: userWorkouts } = await containers.workoutsContainer.items.query({
            query: "SELECT * FROM c WHERE c.username = @username",
            parameters: [{ name: "@username", value: loggedInUser.username }]
        }).fetchAll();

        workouts = userWorkouts;
        userWorkouts.forEach(addWorkoutToList);
    } catch (error) {
        console.error("Treeningute laadimine ebaõnnestus:", error);
    }
}

function addWorkoutToList(workout) {
    const workoutList = document.getElementById('workout-list');
    const li = document.createElement('li');
    li.innerHTML = `${workout.date} - ${workout.type} (${workout.duration} min, ${workout.calories} kcal) <span class="delete" onclick="deleteWorkout(this, '${workout.id}')">Kustuta</span>`;
    workoutList.appendChild(li);
}

async function deleteWorkout(element, workoutId) {
    try {
        await containers.workoutsContainer.item(workoutId, loggedInUser.username).delete();
        const index = Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement);
        workouts.splice(index, 1);
        element.parentElement.remove();
    } catch (error) {
        console.error("Treeningu kustutamine ebaõnnestus:", error);
    }
}

// Logi välja
document.getElementById('logout-btn').addEventListener('click', function() {
    loggedInUser = null;
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    alert('Oled välja logitud.');
});
