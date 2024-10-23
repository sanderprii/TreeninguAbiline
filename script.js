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

// Treeningu tüübi valiku muutmine
document.getElementById('type').addEventListener('change', function() {
    const selectedType = this.value;
    const dynamicFields = document.getElementById('dynamic-fields');
    dynamicFields.innerHTML = ''; // Kustutame eelmised väljad

    if (selectedType === 'WOD') {
        showWODFields(dynamicFields);
    } else if (selectedType === 'Klassikaline tõstmine') {
        showClassicalFields(dynamicFields);
    } else if (selectedType === 'Aeroobne') {
        showAerobicFields(dynamicFields);
    }
});

// Funktsioonid erinevate treeningu tüüpide väljade kuvamiseks

function showWODFields(container) {
    // "WOD nimi" väli
    const wodNameInput = document.createElement('input');
    wodNameInput.type = 'text';
    wodNameInput.id = 'wod-name';
    wodNameInput.placeholder = 'WOD nimi';
    wodNameInput.required = true;
    container.appendChild(wodNameInput);

    // Harjutuste konteiner
    const exerciseContainer = document.createElement('div');
    exerciseContainer.id = 'exercise-container';

    // Lisa esialgne harjutuse rida
    addExerciseRow(exerciseContainer, ['Harjutuse nimi', 'Kordused']);

    container.appendChild(exerciseContainer);

    // "Lisa rida" nupp
    const addRowButton = document.createElement('button');
    addRowButton.type = 'button';
    addRowButton.textContent = 'Lisa rida';
    addRowButton.className = 'add-row-btn';
    addRowButton.addEventListener('click', function() {
        addExerciseRow(exerciseContainer, ['Harjutuse nimi', 'Kordused']);
    });
    container.appendChild(addRowButton);

    // "Tulemus" väli
    const resultLabel = document.createElement('label');
    resultLabel.textContent = 'Tulemus:';
    container.appendChild(resultLabel);

    const resultSelect = document.createElement('select');
    resultSelect.id = 'result-type';
    resultSelect.required = true;

    const defaultOption = new Option('Vali tulemus', '', true, true);
    defaultOption.disabled = true;
    resultSelect.add(defaultOption);
    resultSelect.add(new Option('Aeg', 'Aeg'));
    resultSelect.add(new Option('Kordused', 'Kordused'));

    container.appendChild(resultSelect);

    // Tulemuse sisestamise konteiner
    const resultInputContainer = document.createElement('div');
    resultInputContainer.id = 'result-input-container';
    container.appendChild(resultInputContainer);

    // Kuulame "Tulemus" dropdowni muutust
    resultSelect.addEventListener('change', function() {
        const selectedResultType = this.value;
        resultInputContainer.innerHTML = '';

        if (selectedResultType === 'Aeg') {
            const minutesInput = document.createElement('input');
            minutesInput.type = 'number';
            minutesInput.name = 'minutes';
            minutesInput.placeholder = 'Minutid';
            minutesInput.required = true;

            const secondsInput = document.createElement('input');
            secondsInput.type = 'number';
            secondsInput.name = 'seconds';
            secondsInput.placeholder = 'Sekundid';
            secondsInput.required = true;

            resultInputContainer.appendChild(minutesInput);
            resultInputContainer.appendChild(secondsInput);
        } else if (selectedResultType === 'Kordused') {
            const repsResultInput = document.createElement('input');
            repsResultInput.type = 'number';
            repsResultInput.name = 'result-reps';
            repsResultInput.placeholder = 'Kordused';
            repsResultInput.required = true;

            resultInputContainer.appendChild(repsResultInput);
        }
    });
}

function showClassicalFields(container) {
    const exerciseContainer = document.createElement('div');
    exerciseContainer.id = 'exercise-container';

    // Lisa esialgne harjutuse rida
    addExerciseRow(exerciseContainer, ['Harjutuse nimi', 'Kordused', 'Mitu ringi']);

    container.appendChild(exerciseContainer);

    // "Lisa rida" nupp
    const addRowButton = document.createElement('button');
    addRowButton.type = 'button';
    addRowButton.textContent = 'Lisa rida';
    addRowButton.className = 'add-row-btn';
    addRowButton.addEventListener('click', function() {
        addExerciseRow(exerciseContainer, ['Harjutuse nimi', 'Kordused', 'Mitu ringi']);
    });
    container.appendChild(addRowButton);
}

function showAerobicFields(container) {
    const exerciseContainer = document.createElement('div');
    exerciseContainer.id = 'exercise-container';

    // Lisa esialgne harjutuse rida
    addExerciseRow(exerciseContainer, ['Harjutuse nimi', 'Kestvus']);

    container.appendChild(exerciseContainer);

    // "Lisa rida" nupp
    const addRowButton = document.createElement('button');
    addRowButton.type = 'button';
    addRowButton.textContent = 'Lisa rida';
    addRowButton.className = 'add-row-btn';
    addRowButton.addEventListener('click', function() {
        addExerciseRow(exerciseContainer, ['Harjutuse nimi', 'Kestvus']);
    });
    container.appendChild(addRowButton);
}

// Funktsioon harjutuse rea lisamiseks
function addExerciseRow(container, fields) {
    const exerciseRow = document.createElement('div');
    exerciseRow.className = 'exercise-row';

    fields.forEach(field => {
        const input = document.createElement('input');
        input.type = field === 'Kestvus' || field === 'Kordused' || field === 'Mitu ringi' ? 'number' : 'text';
        input.name = field.toLowerCase().replace(/ /g, '-');
        input.placeholder = field;
        input.required = true;
        exerciseRow.appendChild(input);
    });

    container.appendChild(exerciseRow);
}

// Treeningute lisamine
document.getElementById('workout-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;

    let additionalData = {};

    if (type === 'WOD') {
        const wodName = document.getElementById('wod-name').value;
        const exercises = collectExercises(['harjutuse-nimi', 'kordused']);
        const resultType = document.getElementById('result-type').value;
        let result = {};

        if (resultType === 'Aeg') {
            const minutes = document.querySelector('input[name="minutes"]').value;
            const seconds = document.querySelector('input[name="seconds"]').value;
            result = { type: 'Aeg', minutes, seconds };
        } else if (resultType === 'Kordused') {
            const repsResult = document.querySelector('input[name="result-reps"]').value;
            result = { type: 'Kordused', reps: repsResult };
        }

        additionalData = {
            wodName,
            exercises,
            result
        };
    } else if (type === 'Klassikaline tõstmine') {
        const exercises = collectExercises(['harjutuse-nimi', 'kordused', 'mitu-ringi']);
        additionalData = { exercises };
    } else if (type === 'Aeroobne') {
        const exercises = collectExercises(['harjutuse-nimi', 'kestvus']);
        additionalData = { exercises };
    }

    const duration = document.getElementById('duration').value;
    const calories = document.getElementById('calories').value;

    const workout = { date, type, duration, calories, ...additionalData };

    workouts.push(workout);
    addWorkoutToList(workout);

    document.getElementById('workout-form').reset();
    document.getElementById('dynamic-fields').innerHTML = '';
});

// Funktsioon harjutuste kogumiseks
function collectExercises(fieldNames) {
    const exerciseRows = document.querySelectorAll('#exercise-container .exercise-row');
    const exercises = [];

    exerciseRows.forEach(row => {
        const exerciseData = {};
        fieldNames.forEach(fieldName => {
            const input = row.querySelector(`input[name="${fieldName}"]`);
            exerciseData[fieldName] = input.value;
        });
        exercises.push(exerciseData);
    });

    return exercises;
}

// Treeningute kuvamine
function addWorkoutToList(workout) {
    const workoutList = document.getElementById('workout-list');
    const li = document.createElement('li');

    let workoutDetails = `${workout.date} - ${workout.type} (${workout.duration} min, ${workout.calories} kcal)`;

    if (workout.type === 'WOD') {
        workoutDetails += ` - WOD nimi: ${workout.wodName}`;
        workoutDetails += ' - Harjutused: ';
        workout.exercises.forEach(exercise => {
            workoutDetails += `${exercise['harjutuse-nimi']} (${exercise['kordused']} kordust), `;
        });
        workoutDetails += ' - Tulemus: ';
        if (workout.result.type === 'Aeg') {
            workoutDetails += `${workout.result.minutes} min ${workout.result.seconds} sek`;
        } else {
            workoutDetails += `${workout.result.reps} kordust`;
        }
    } else if (workout.type === 'Klassikaline tõstmine') {
        workoutDetails += ' - Harjutused: ';
        workout.exercises.forEach(exercise => {
            workoutDetails += `${exercise['harjutuse-nimi']} (${exercise['kordused']} kordust, ${exercise['mitu-ringi']} ringi), `;
        });
    } else if (workout.type === 'Aeroobne') {
        workoutDetails += ' - Harjutused: ';
        workout.exercises.forEach(exercise => {
            workoutDetails += `${exercise['harjutuse-nimi']} (${exercise['kestvus']} min), `;
        });
    }

    li.innerHTML = workoutDetails + ' <span class="delete" onclick="deleteWorkout(this)">Kustuta</span>';
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

    // Leiame kõige sagedamini tehtud treeningu tüübi
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
