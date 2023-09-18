let questionCount = 0;
let correctCount = 0;
let startTime;
let endTime;
let username = '';
let duration;
let timerInterval;

const questionArea = document.getElementById('question');
const answersArea = document.getElementById('answers');
const BASE_URL = 'https://restcountries.com/v3.1/all';
let allCountriesData = [];  // Esta variable almacenará todos los datos de los países.
const rankingContainer = document.getElementById('rankingContainer');
function initialize() {
    questionCount = 0;
    correctCount = 0;
    startTime = new Date().getTime();
    document.getElementById('feedbackContainer').hidden = true;
    fetch(BASE_URL)
        .then(response => response.json())
        .then(data => {
            allCountriesData = data;
            fetchQuestion();
        });        
        document.getElementById('showRankingBtn').setAttribute('hidden', true);//al reiniciar tambien oculto el div de ranking
        let elapsedTime = 0;
        document.getElementById('timer').innerText = elapsedTime;
    
        clearInterval(timerInterval);  // Por si hay un intervalo previo corriendo, lo limpiamos
        timerInterval = setInterval(() => {
            elapsedTime++;
            document.getElementById('timer').innerText = elapsedTime;
        }, 1000);    
}
function fetchQuestion() {
    document.getElementById('questionContainer').hidden = false;
    const questionType = Math.random() > 0.5 ? 'capital' : 'flag';
    if (questionType === 'capital') {
        generateCapitalQuestion();
    } else {
        generateFlagQuestion();
    }
}
function generateCapitalQuestion() {
    const randomCountry = allCountriesData[Math.floor(Math.random() * allCountriesData.length)];    
    if (!randomCountry.capital) {
        console.error(`El país ${randomCountry.name.common} no tiene una capital definida.`);
        return;
    }
    const correctAnswer = randomCountry.capital[0];
    const options = getOptions(correctAnswer, allCountriesData.map(country => country.capital ? country.capital[0] : undefined));
    displayCapitalQuestion(`¿Cuál es la capital de ${randomCountry.name.common}?`, options, correctAnswer);
}
function generateFlagQuestion() {
    const randomCountry = allCountriesData[Math.floor(Math.random() * allCountriesData.length)];
    const correctAnswer = randomCountry.name.common;
    const options = getFlagOptions(randomCountry);
    displayFlagQuestion(`¿La siguiente bandera es del país?`, randomCountry, options, correctAnswer);
}
function displayCapitalQuestion(question, options, correctAnswer) {
    answersArea.innerHTML = '';  // Limpia el área de respuestas
    questionArea.innerText = question;
    options.forEach(option => {
        const div = document.createElement('div');
        div.innerText = option;
        div.onclick = () => checkAnswer(div, option, correctAnswer);
        answersArea.appendChild(div);
    });
}
function displayFlagQuestion(question, country, options, correctAnswer) {
    answersArea.innerHTML = '';  // Limpia el área de respuestas
    questionArea.innerHTML = '';  // Limpia el área de preguntas
    questionArea.innerText = question;
    const img = document.createElement('img');
    img.src = country.flags.png;
    img.alt = correctAnswer;
    questionArea.appendChild(img); // Añadir la imagen debajo de la pregunta
    options.forEach(optionCountryName => {
        const div = document.createElement('div');
        div.innerText = optionCountryName;
        div.onclick = () => checkAnswer(div, optionCountryName, correctAnswer);
        answersArea.appendChild(div);
    });
}
const feedbackArea = document.getElementById('feedback');
function checkAnswer(element, chosenAnswer, correctAnswer) {
    questionCount++;
    document.getElementById('questionContainer').hidden = true;
    document.getElementById('feedbackContainer').hidden = false;
if (chosenAnswer === correctAnswer) {
        correctCount++;
    }
    // Si el jugador ha respondido a 10 preguntas, muestra los resultados.
    if (questionCount >= 10) {
        showResults();
        return;
    }
    if (chosenAnswer === correctAnswer) {
        element.style.backgroundColor = 'green';
        document.getElementById('feedback').innerText = '¡Respuesta correcta!';
        document.getElementById('correctAnswerText').hidden = true;
    } else {
        element.style.backgroundColor = 'red';
        document.getElementById('feedback').innerText = '¡Respuesta incorrecta!';
        document.getElementById('correctAnswerText').hidden = false;
        document.getElementById('correctAnswer').innerText = correctAnswer;
    }
    document.getElementById('nextQuestionBtn').onclick = () => {
        document.getElementById('feedbackContainer').hidden = true;
        fetchQuestion();
    };
    
}
function showResults() {
    endTime = new Date().getTime();
    duration = Math.round((endTime - startTime) / 1000);  // Duración en segundos
    const averageTime = Math.round(duration / 10);
    document.getElementById('feedbackContainer').hidden = true;
    document.getElementById('resultsContainer').hidden = false;
    document.getElementById('showRankingBtn').removeAttribute('hidden');
    document.getElementById('correctResults').innerText = correctCount;
    document.getElementById('incorrectResults').innerText = 10 - correctCount;
    document.getElementById('totalTime').innerText = duration;
    document.getElementById('averageTime').innerText = averageTime;
    document.getElementById('restartBtn').addEventListener('click', function() {
        document.getElementById('resultsContainer').hidden = true;
        document.getElementById('startBtn').hidden = false;
        document.getElementById('showRankingBtn').setAttribute('hidden', 'true');  // oculta el botón
        document.getElementById('rankingContainer').setAttribute('hidden', true); //oculñtar tambien el div del ranking
        document.getElementById('rankingTableContainer').setAttribute('hidden', true); // <-- AGREGA ESTA LÍNEA AQUÍ

    });
    document.getElementById('usernameModal').style.display = "block";  // muestra el modal para ingresar el nombre
    clearInterval(timerInterval);  // Detener el intervalo cuando el juego termine

    ///saveToServer(username, correctCount, duration);
}
document.getElementById('showRankingBtn').addEventListener('click', showRanking);
function markCorrectAnswer(correctAnswer) {
    const options = answersArea.children;
    for (let i = 0; i < options.length; i++) {
        if (options[i].innerText === correctAnswer) {
            options[i].style.backgroundColor = 'green';
            break;
        }
    }
}
function displayCorrectAnswerMessage(correctAnswer) {
    const message = document.createElement('div');
    message.innerText = `¡Incorrecto! La respuesta correcta es: ${correctAnswer}`;
    message.style.color = 'red';
    questionArea.appendChild(message);
}
function getOptions(correctAnswer, allAnswers) {
    const filteredAnswers = allAnswers.filter(answer => answer);  
    const wrongAnswers = filteredAnswers.filter(answer => answer !== correctAnswer);
    const options = [correctAnswer];
    while (options.length < 4) {
        const randomWrongAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        if (!options.includes(randomWrongAnswer)) {
            options.push(randomWrongAnswer);
        }
    }
    return shuffleArray(options);
}
function getFlagOptions(correctCountry) {
    const wrongCountries = allCountriesData.filter(country => country.name.common !== correctCountry.name.common);
    const options = [correctCountry.name.common];

    while (options.length < 4) {
        const randomWrongCountry = wrongCountries[Math.floor(Math.random() * wrongCountries.length)];
        if (!options.includes(randomWrongCountry.name.common)) {
            options.push(randomWrongCountry.name.common);
        }
    }
    return shuffleArray(options);
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
document.getElementById('startBtn').addEventListener('click', function() {
    document.getElementById('startBtn').hidden = true;
    document.getElementById('questionContainer').hidden = false;
    initialize();
});
function saveToServer(username, correctAnswers, duration) {
    console.log("Datos enviados al servidor: ", {
        name: username,
        score: correctAnswers,
        totalTime: duration
    });
    fetch('/rankings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: username,
            score: correctAnswers,
            totalTime: duration// aquí puedes agregar el tiempo total si quieres
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log('Ranking guardado exitosamente');
        } else {
            console.error('Error guardando ranking:', data.message);
        }
    })
    .catch(err => {
        console.error('Error al comunicarse con el servidor:', err);
    });
}
document.getElementById('submitUsername').addEventListener('click', function() {
    username = document.getElementById('usernameInput').value;
    if (username.trim() !== "") {  // verifica que el usuario haya ingresado un nombre
        document.getElementById('usernameModal').style.display = "none";  // oculta el modal
        saveToServer(username, correctCount, duration);  // llama a tu función para guardar los datos en el servidor
    } else {
        alert("Por favor, ingresa un nombre válido.");
    }
});
function showRanking() {
    fetch('/rankings')
    .then(response => response.json())
    .then(rankings => {
        console.log(rankings); // Imprimir los datos recibidos del servidor
        let rankingContainer = document.getElementById('rankingContainer');
        rankingContainer.innerHTML = '';  // Limpiar contenido anterior
        
         // Mostrar el rankingContainer si estaba oculto
         document.getElementById('rankingTableContainer').removeAttribute('hidden');

        // Crear la tabla
        let table = document.createElement('table');
        // Crear encabezado
        let thead = document.createElement('thead');
        let headerRow = document.createElement('tr');
        ['Puesto', 'Jugador', 'Respuestas Correctas', 'Tiempo Total'].forEach(headerText => {
            let th = document.createElement('th');
            th.innerText = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Crear contenido
        let tbody = document.createElement('tbody');
        rankings.forEach((ranking, index) => {
            let row = document.createElement('tr');
            // Puesto
            let rankCell = document.createElement('td');
            rankCell.innerText = index + 1;
            row.appendChild(rankCell);
            // Jugador
            let playerCell = document.createElement('td');
            playerCell.innerText = ranking.name;
            row.appendChild(playerCell);
            // Respuestas correctas
            let correctCell = document.createElement('td');
            correctCell.innerText = ranking.score;
            row.appendChild(correctCell);
            // Tiempo total
            let timeCell = document.createElement('td');
            timeCell.innerText = ranking.totalTime + " seg.";
            row.appendChild(timeCell);
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        rankingContainer.appendChild(table);
        rankingContainer.removeAttribute('hidden');
    })
    .catch(err => {
        console.error('Error al recuperar rankings:', err);
    });
}

