// Global Variables
let currentUser = null;
let currentTopic = null;
let currentLevel = 1;
let currentScore = 0;
let currentQuestionIndex = 0;
let questions = [];
let userProgress = {};
let gameMode = 'multiple'; // 'multiple' or 'input'
let secondChanceActive = false;
let lastAttemptCorrect = false;
let lastWrongAnswer = '';

// User data storage (using localStorage)
const STORAGE_KEY = 'kidsMathsApp';

// Encouraging messages
const encouragingMessages = [
    "Well done! You're amazing! 🌟",
    "Fantastic work! Keep it up! 🎉",
    "Brilliant! You're getting so smart! 🧠",
    "Excellent! You're a maths star! ⭐",
    "Great job! You're doing wonderfully! 👏",
    "Super! You're learning so fast! 🚀",
    "Awesome! Keep up the great work! 💪",
    "Incredible! You're a maths hero! 🦸"
];

const tryAgainMessages = [
    "That's okay! Try again! 💪",
    "No worries! Give it another go! 🌈",
    "Almost there! You can do it! 🎯",
    "Keep trying! You're learning! 📚",
    "Don't give up! Try once more! 🔥",
    "Good effort! Have another try! ⭐",
    "Nice try! Let's try again! 🌟",
    "You're doing great! Try again! 👍"
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();
    showScreen('loginScreen');
});

// Event Listeners
function setupEventListeners() {
    // ...existing code...
    // Add previous wrong answer display element
    if (!document.getElementById('previousWrongAnswer')) {
        const prevDiv = document.createElement('div');
        prevDiv.id = 'previousWrongAnswer';
        prevDiv.style.display = 'none';
        prevDiv.style.margin = '10px 0';
        prevDiv.style.fontSize = '1.2em';
        prevDiv.style.color = '#e53e3e';
        prevDiv.style.fontWeight = 'bold';
        prevDiv.innerHTML = '';
        document.getElementById('directInput').appendChild(prevDiv);
    }
    // Second chance modal button
    document.getElementById('tryAgainBtn').addEventListener('click', function() {
        document.getElementById('secondChanceModal').classList.add('hidden');
        // Re-show input for another try
        document.getElementById('directInput').classList.remove('hidden');
        document.getElementById('submitBtn').style.display = '';
        document.getElementById('answerInput').focus();
    });
    // Login screen
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('newUserBtn').addEventListener('click', handleNewUser);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Dashboard
    document.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', function() {
            const topic = this.dataset.topic;
            showTopicModal(topic);
        });
    });
// Topic Modal Logic
function showTopicModal(topic) {
    const modal = document.getElementById('topicModal');
    const title = document.getElementById('modalTopicTitle');
    const desc = document.getElementById('modalTopicDesc');
    const videoDiv = document.getElementById('modalTopicVideo');
    const showVideoBtn = document.getElementById('showTopicVideoBtn');
    const continueBtn = document.getElementById('continueTopicBtn');
    const closeBtn = document.getElementById('closeTopicModal');

    // Topic info
    const teachingData = {
        addition: {
            title: 'Learn Addition!',
            desc: 'Addition means putting numbers together to find out how many you have in total.',
            video: '<iframe width="560" height="315" src="https://www.youtube.com/embed/mAvuom42NyY?si=N6Lts-PJOXdH1j3R3" title="Addition" frameborder="0" allowfullscreen></iframe>'
        },
        subtraction: {
            title: 'Learn Subtraction!',
            desc: 'Subtraction means taking away from a number to see what is left.',
            video: '<iframe width="560" height="315" src="https://www.youtube.com/embed/Y6M89-6106I?si=FSj_yu14F3tdtjh-" title="Subtraction" frameborder="0" allowfullscreen></iframe>'
        },
        multiplication: {
            title: 'Learn Multiplication!',
            desc: 'Multiplication is repeated addition. Learn your times tables!',
            video: '<iframe width="560" height="315" src="https://www.youtube.com/embed/FJ5qLWP3Fqo?si=gp_7DQV4QmfRr3os" title="Multiplication" frameborder="0" allowfullscreen></iframe>'
        },
        division: {
            title: 'Learn Division!',
            desc: 'Division means sharing or grouping numbers equally.',
            video: '<iframe width="560" height="315" src="https://www.youtube.com/embed/KGMf314LUc0?si=mGiz5FO0JwZtwZAM" title="Division" frameborder="0" allowfullscreen></iframe>'
        },
        fractions: {
            title: 'Learn Fractions!',
            desc: 'Fractions are parts of a whole.',
            video: '<iframe width="560" height="315" src="https://www.youtube.com/embed/CA9XLJpQp3c?si=uHWVHMI1j3qzRPY5" title="Fractions" frameborder="0" allowfullscreen></iframe>'
        }
    };
    const teaching = teachingData[topic];
    title.textContent = teaching ? teaching.title : 'Learn this topic!';
    desc.textContent = teaching ? teaching.desc : '';
    videoDiv.innerHTML = '';
    modal.classList.remove('hidden');

    showVideoBtn.onclick = function() {
        videoDiv.innerHTML = teaching ? teaching.video : '';
        showVideoBtn.style.display = 'none';
    };
    continueBtn.onclick = function() {
        modal.classList.add('hidden');
        startTopic(topic);
        // Reset modal for next time
        videoDiv.innerHTML = '';
        showVideoBtn.style.display = '';
    };
    closeBtn.onclick = function() {
        modal.classList.add('hidden');
        // Reset modal for next time
        videoDiv.innerHTML = '';
        showVideoBtn.style.display = '';
    };
}
    
    // Game screen
    document.getElementById('backBtn').addEventListener('click', function() {
        // Show quit confirmation modal instead of going straight back
        const modal = document.getElementById('quitLevelModal');
        modal.classList.remove('hidden');
        // Confirm quit
        document.getElementById('confirmQuitBtn').onclick = function() {
            modal.classList.add('hidden');
            showScreen('dashboard');
        };
        // Cancel quit
        document.getElementById('cancelQuitBtn').onclick = function() {
            modal.classList.add('hidden');
        };
    });
    document.getElementById('submitBtn').addEventListener('click', handleDirectAnswer);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    
    // Results modal
    document.getElementById('continueBtn').addEventListener('click', hideResultsModal);
    
    // Multiple choice buttons
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            handleMultipleChoice(parseInt(this.dataset.choice));
        });
    });
    
    // Enter key for input
    document.getElementById('answerInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleDirectAnswer();
        }
    });

    // Wrong answer modal close button
    document.getElementById('closeWrongAnswerBtn').addEventListener('click', function() {
        document.getElementById('wrongAnswerModal').classList.add('hidden');
        // After closing, continue to next question
        nextQuestion();
    });
}

// User Management
function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter both your name and secret number!');
        return;
    }
    
    if (password.length !== 4) {
        alert('Your secret number must be exactly 4 digits!');
        return;
    }
    
    const userData = getUserData();
    const userKey = `${username}_${password}`;
    
    if (userData[userKey]) {
        currentUser = userData[userKey];
        userProgress = currentUser.progress || {};
        showDashboard();
    } else {
        alert('We don\'t know you yet! Click "I\'m New Here!" to join the fun!');
    }
}

function handleNewUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter your name and pick a 4-digit secret number!');
        return;
    }
    
    if (password.length !== 4) {
        alert('Your secret number must be exactly 4 digits!');
        return;
    }
    
    const userData = getUserData();
    const userKey = `${username}_${password}`;
    
    if (userData[userKey]) {
        alert('This superhero name and secret number are already taken! Try different ones.');
        return;
    }
    
    // Create new user
    currentUser = {
        username: username,
        password: password,
        stars: 0,
        points: 0,
        progress: {
            addition: 0,
            multiplication: 0,
            fractions: 0,
            measurement: 0,
            shapes: 0,
            statistics: 0,
            numbers: 0
        }
    };
    
    userData[userKey] = currentUser;
    userProgress = currentUser.progress;
    saveUserData(userData);
    
    alert(`Welcome to the team, ${username}! Let's start learning! 🎉`);
    showDashboard();
}

function handleLogout() {
    currentUser = null;
    userProgress = {};
    showScreen('loginScreen');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('currentUser').textContent = currentUser.username;
    document.getElementById('userStars').textContent = currentUser.stars;
    document.getElementById('userPoints').textContent = currentUser.points;
    
    // Update progress bars
    Object.keys(userProgress).forEach(topic => {
        const progressBar = document.querySelector(`[data-progress="${topic}"]`);
        if (progressBar) {
            progressBar.style.width = `${Math.min(userProgress[topic] * 10, 100)}%`;
        }
    });
    
    showScreen('dashboard');
}

// Topic Management
function startTopic(topic) {
    currentTopic = topic;
    currentLevel = Math.floor(userProgress[topic] || 0) + 1;
    currentScore = 0;
    currentQuestionIndex = 0;
    questions = generateQuestions(topic, currentLevel);
    document.getElementById('gameTitle').textContent = getTopicTitle(topic);
    document.getElementById('currentLevel').textContent = currentLevel;
    document.getElementById('currentScore').textContent = currentScore;
    document.getElementById('totalQuestions').textContent = questions.length;
    showScreen('gameScreen');
    nextQuestion();
}

function getTopicTitle(topic) {
    const titles = {
        addition: 'Addition & Subtraction Fun!',
        multiplication: 'Times Tables Adventure!',
        fractions: 'Fraction Pizza Party!',
        measurement: 'Measurement Magic!',
        shapes: 'Shape Detective!',
        statistics: 'Chart Champions!',
        numbers: 'Number Heroes!'
    };
    return titles[topic] || 'Let\'s Learn!';
}

// Question Generation
function generateQuestions(topic, level) {
    const questionGenerators = {
        addition: generateAdditionQuestions,
        subtraction: generateSubtractionQuestions,
        multiplication: generateMultiplicationQuestions,
        division: generateDivisionQuestions,
        fractions: generateFractionQuestions,
        measurement: generateMeasurementQuestions,
        shapes: generateShapeQuestions,
        statistics: generateStatisticsQuestions,
        numbers: generateNumberQuestions
    };
    if (questionGenerators[topic]) {
        return questionGenerators[topic](level);
    } else {
        // fallback: show addition questions
        return generateAdditionQuestions(level);
    }
}

function generateAdditionQuestions(level) {
    const questions = [];
    const numQuestions = 10;
    const usedQuestions = new Set();
    while (questions.length < numQuestions) {
        let questionText = '';
        let answer = null;
        let type = 'input';
        if (level === 1) {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            const operation = Math.random() < 0.7 ? '+' : '-';
            if (operation === '+') {
                questionText = `What is ${num1} + ${num2}?`;
                answer = num1 + num2;
            } else {
                const larger = Math.max(num1, num2);
                const smaller = Math.min(num1, num2);
                questionText = `What is ${larger} - ${smaller}?`;
                answer = larger - smaller;
            }
        } else if (level === 2) {
            const num1 = Math.floor(Math.random() * 50) + 10;
            const num2 = Math.floor(Math.random() * 30) + 5;
            const operation = Math.random() < 0.6 ? '+' : '-';
            if (operation === '+') {
                questionText = `What is ${num1} + ${num2}?`;
                answer = num1 + num2;
            } else {
                questionText = `What is ${num1} - ${num2}?`;
                answer = num1 - num2;
            }
        } else {
            const num1 = Math.floor(Math.random() * 500) + 100;
            const num2 = Math.floor(Math.random() * 200) + 50;
            const operation = Math.random() < 0.5 ? '+' : '-';
            if (operation === '+') {
                questionText = `What is ${num1} + ${num2}?`;
                answer = num1 + num2;
            } else {
                questionText = `What is ${num1} - ${num2}?`;
                answer = num1 - num2;
            }
        }
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer, type });
            usedQuestions.add(questionText);
        }
    }
    return questions;
}

// Subtraction questions
function generateSubtractionQuestions(level) {
    const questions = [];
    const numQuestions = 10;
    const usedQuestions = new Set();
    while (questions.length < numQuestions) {
        let questionText = '';
        let answer = null;
        let type = 'input';
        if (level === 1) {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            questionText = `What is ${larger} - ${smaller}?`;
            answer = larger - smaller;
        } else if (level === 2) {
            const num1 = Math.floor(Math.random() * 50) + 10;
            const num2 = Math.floor(Math.random() * 30) + 5;
            questionText = `What is ${num1} - ${num2}?`;
            answer = num1 - num2;
        } else {
            const num1 = Math.floor(Math.random() * 500) + 100;
            const num2 = Math.floor(Math.random() * 200) + 50;
            questionText = `What is ${num1} - ${num2}?`;
            answer = num1 - num2;
        }
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer, type });
            usedQuestions.add(questionText);
        }
    }
    return questions;
}

// Division questions
function generateDivisionQuestions(level) {
    const questions = [];
    const numQuestions = 10;
    const usedQuestions = new Set();
    while (questions.length < numQuestions) {
        let questionText = '';
        let answer = null;
        let type = 'input';
        if (level === 1) {
            const divisor = Math.floor(Math.random() * 5) + 2;
            const quotient = Math.floor(Math.random() * 10) + 1;
            const dividend = divisor * quotient;
            questionText = `What is ${dividend} ÷ ${divisor}?`;
            answer = quotient;
        } else if (level === 2) {
            const divisor = Math.floor(Math.random() * 10) + 2;
            const quotient = Math.floor(Math.random() * 10) + 1;
            const dividend = divisor * quotient;
            questionText = `What is ${dividend} ÷ ${divisor}?`;
            answer = quotient;
        } else {
            const divisor = Math.floor(Math.random() * 12) + 2;
            const quotient = Math.floor(Math.random() * 20) + 1;
            const dividend = divisor * quotient;
            questionText = `What is ${dividend} ÷ ${divisor}?`;
            answer = quotient;
        }
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer, type });
            usedQuestions.add(questionText);
        }
    }
    return questions;
}

function generateMultiplicationQuestions(level) {
    const questions = [];
    const tables = [3, 4, 8];
    const numQuestions = 10;
    const usedQuestions = new Set();
    while (questions.length < numQuestions) {
        let questionText = '';
        let answer = null;
        let type = 'input';
        if (level === 1) {
            const table = tables[Math.floor(Math.random() * tables.length)];
            const easyMultiplier = Math.floor(Math.random() * 5) + 1;
            questionText = `What is ${table} × ${easyMultiplier}?`;
            answer = table * easyMultiplier;
        } else if (level === 2) {
            const table = tables[Math.floor(Math.random() * tables.length)];
            const mediumMultiplier = Math.floor(Math.random() * 10) + 1;
            questionText = `What is ${table} × ${mediumMultiplier}?`;
            answer = table * mediumMultiplier;
        } else {
            const table = tables[Math.floor(Math.random() * tables.length)];
            const multiplier = Math.floor(Math.random() * 12) + 1;
            if (Math.random() < 0.7) {
                questionText = `What is ${table} × ${multiplier}?`;
                answer = table * multiplier;
            } else {
                const product = table * multiplier;
                questionText = `What is ${product} ÷ ${table}?`;
                answer = multiplier;
            }
        }
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer, type });
            usedQuestions.add(questionText);
        }
    }
    return questions;
}

function generateFractionQuestions(level) {
    const questions = [];
    const fractions = [
        { name: 'half', numerator: 1, denominator: 2 },
        { name: 'third', numerator: 1, denominator: 3 },
        { name: 'quarter', numerator: 1, denominator: 4 },
        { name: 'sixth', numerator: 1, denominator: 6 },
        { name: 'eighth', numerator: 1, denominator: 8 },
        { name: 'tenth', numerator: 1, denominator: 10 }
    ];
    const numQuestions = 10;
    const usedQuestions = new Set();
    while (questions.length < numQuestions) {
        const fraction = fractions[Math.floor(Math.random() * fractions.length)];
        const total = fraction.denominator * (Math.floor(Math.random() * 3) + 2);
        const answer = total / fraction.denominator;
        const questionText = `What is one ${fraction.name} of ${total}?`;
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer, type: 'input' });
            usedQuestions.add(questionText);
        }
    }
    return questions;
}

function generateMeasurementQuestions(level) {
    const questions = [];
    const numQuestions = 10;
    const usedQuestions = new Set();
    // Time questions
    while (questions.length < 3) {
        const hour = Math.floor(Math.random() * 12) + 1;
        const minute = Math.floor(Math.random() * 12) * 5;
        const timeString = minute === 0 ? `${hour} o'clock` : `${minute} minutes past ${hour}`;
        const questionText = `What time is ${timeString} in digital format? (Write as HH:MM, like 3:15)`;
        const answer = `${hour}:${minute.toString().padStart(2, '0')}`;
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer, type: 'text' });
            usedQuestions.add(questionText);
        }
    }
    // Money questions
    while (questions.length < 7) {
        const pounds = Math.floor(Math.random() * 10);
        const pence = Math.floor(Math.random() * 100);
        const total = pounds * 100 + pence;
        const questionText = `How many pence is £${pounds}.${pence.toString().padStart(2, '0')}?`;
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer: total, type: 'input' });
            usedQuestions.add(questionText);
        }
    }
    // Length questions
    while (questions.length < numQuestions) {
        const meters = Math.floor(Math.random() * 5) + 1;
        const cm = meters * 100;
        const questionText = `How many centimeters are in ${meters} meter${meters > 1 ? 's' : ''}?`;
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer: cm, type: 'input' });
            usedQuestions.add(questionText);
        }
    }
    return questions;
}

function generateShapeQuestions(level) {
    const questions = [];
    const usedQuestions = new Set();
    // 2D shape questions
    const shapes2D = [
        { name: 'triangle', sides: 3, question: 'How many sides does a triangle have?' },
        { name: 'square', sides: 4, question: 'How many sides does a square have?' },
        { name: 'rectangle', sides: 4, question: 'How many sides does a rectangle have?' },
        { name: 'pentagon', sides: 5, question: 'How many sides does a pentagon have?' },
        { name: 'hexagon', sides: 6, question: 'How many sides does a hexagon have?' }
    ];
    // 3D shape questions
    const shapes3D = [
        { name: 'cube', faces: 6, question: 'How many faces does a cube have?' },
        { name: 'sphere', faces: 1, question: 'How many faces does a sphere have?' },
        { name: 'cylinder', faces: 3, question: 'How many faces does a cylinder have?' },
        { name: 'pyramid', faces: 5, question: 'How many faces does a square-based pyramid have?' },
        { name: 'cone', faces: 2, question: 'How many faces does a cone have?' }
    ];
    // 2D shape questions
    let i = 0;
    while (i < 5) {
        const shape = shapes2D[Math.floor(Math.random() * shapes2D.length)];
        if (!usedQuestions.has(shape.question)) {
            questions.push({ question: shape.question, answer: shape.sides, type: 'input' });
            usedQuestions.add(shape.question);
            i++;
        }
    }
    // 3D shape questions (faces)
    let j = 0;
    while (j < 5) {
        const shape = shapes3D[Math.floor(Math.random() * shapes3D.length)];
        if (!usedQuestions.has(shape.question)) {
            questions.push({ question: shape.question, answer: shape.faces, type: 'input' });
            usedQuestions.add(shape.question);
            j++;
        }
    }
    // Multiple choice: pick the 3D shape with no flat faces
    const options = ['cube', 'sphere', 'cylinder', 'pyramid', 'cone'];
    const mcQuestion = 'Which of these is a 3D shape that has no flat faces?';
    if (!usedQuestions.has(mcQuestion)) {
        questions.push({ question: mcQuestion, options: shuffle(options), answer: 'sphere', type: 'multiple' });
        usedQuestions.add(mcQuestion);
    }
    return questions;
}

function generateStatisticsQuestions(level) {
    const questions = [];
    const numQuestions = 10;
    const usedQuestions = new Set();
    while (questions.length < numQuestions) {
        const fruits = ['Apples', 'Bananas', 'Oranges', 'Grapes'];
        const values = fruits.map(() => Math.floor(Math.random() * 20) + 5);
        const maxIndex = values.indexOf(Math.max(...values));
        const minIndex = values.indexOf(Math.min(...values));
        let questionText = '';
        let answer = null;
        let type = 'input';
        let options = null;
        if (Math.random() < 0.5) {
            questionText = `Look at this data: ${fruits.map((fruit, idx) => `${fruit}: ${values[idx]}`).join(', ')}. Which fruit has the most?`;
            answer = fruits[maxIndex];
            type = 'multiple';
            options = shuffle(fruits);
        } else {
            questionText = `Look at this data: ${fruits.map((fruit, idx) => `${fruit}: ${values[idx]}`).join(', ')}. How many ${fruits[maxIndex]} are there?`;
            answer = values[maxIndex];
            type = 'input';
        }
        if (!usedQuestions.has(questionText)) {
            if (type === 'multiple') {
                questions.push({ question: questionText, options, answer, type });
            } else {
                questions.push({ question: questionText, answer, type });
            }
            usedQuestions.add(questionText);
        }
    }
    return questions;
}

function generateNumberQuestions(level) {
    const questions = [];
    const numQuestions = 10;
    const usedQuestions = new Set();
    while (questions.length < numQuestions) {
        let questionText = '';
        let answer = null;
        let type = 'input';
        if (level === 1) {
            const num = Math.floor(Math.random() * 100) + 1;
            if (Math.random() < 0.5) {
                questionText = `What is 10 more than ${num}?`;
                answer = num + 10;
            } else {
                questionText = `What is 10 less than ${num}?`;
                answer = Math.max(0, num - 10);
            }
        } else if (level === 2) {
            const num = Math.floor(Math.random() * 500) + 100;
            if (Math.random() < 0.5) {
                questionText = `What is 100 more than ${num}?`;
                answer = num + 100;
            } else {
                questionText = `What is 100 less than ${num}?`;
                answer = Math.max(0, num - 100);
            }
        } else {
            const num = Math.floor(Math.random() * 1000) + 100;
            const numbers = [num - 50, num, num + 50, num + 100].filter(n => n > 0);
            const sorted = [...numbers].sort((a, b) => a - b);
            questionText = `Put these numbers in order from smallest to largest: ${shuffle(numbers).join(', ')}`;
            answer = sorted.join(',');
            type = 'text';
        }
        if (!usedQuestions.has(questionText)) {
            questions.push({ question: questionText, answer, type });
            usedQuestions.add(questionText);
        }
    }
    return questions;
}

// Question Handling
function nextQuestion() {
    // Hide previous wrong answer box for new question
    const prevWrongBox = document.getElementById('previousWrongBox');
    if (prevWrongBox) prevWrongBox.style.display = 'none';
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    gameMode = question.type;
    
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('questionProgress').style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    
    // Hide feedback
    document.getElementById('feedback').classList.add('hidden');
    
    // Show appropriate answer input
    if (question.type === 'multiple') {
        document.getElementById('multipleChoice').classList.remove('hidden');
        document.getElementById('directInput').classList.add('hidden');
        const buttons = document.querySelectorAll('.choice-btn');
        question.options.forEach((option, index) => {
            buttons[index].textContent = option;
            buttons[index].className = 'choice-btn';
        });
    } else {
        document.getElementById('directInput').classList.remove('hidden');
        document.getElementById('multipleChoice').classList.add('hidden');
        const answerInput = document.getElementById('answerInput');
        answerInput.value = '';
        // Show submit button for new question
        document.getElementById('submitBtn').style.display = '';
        // Render number pad
        const numberPad = document.getElementById('numberPad');
        numberPad.innerHTML = '';
        const padButtons = [
            '1','2','3','4','5','6','7','8','9','0',
            '+','−','×','÷','=','.', '/', ':','%','(',')','←'
        ];
        padButtons.forEach(val => {
            const btn = document.createElement('button');
            btn.textContent = val;
            btn.className = 'numberpad-btn';
            btn.style.minWidth = '56px';
            btn.style.minHeight = '56px';
            btn.style.margin = '4px';
            btn.style.fontSize = '1.5em';
            btn.style.background = '#fff';
            btn.style.color = '#333';
            btn.style.border = '3px solid #667eea';
            btn.style.borderRadius = '12px';
            btn.style.boxShadow = '0 2px 8px rgba(102,126,234,0.12)';
            btn.style.fontWeight = 'bold';
            btn.onclick = function() {
                if (val === '←') {
                    answerInput.value = answerInput.value.slice(0, -1);
                } else {
                    answerInput.value += val;
                }
            };
            numberPad.appendChild(btn);
        });
    }
}

function handleMultipleChoice(choiceIndex) {
    const question = questions[currentQuestionIndex];
    const selectedAnswer = question.options[choiceIndex];
    const isCorrect = selectedAnswer === question.answer;
    
    // Update button states
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn, index) => {
        if (index === choiceIndex) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        btn.disabled = true;
    });
    
    showFeedback(isCorrect);
}

function handleDirectAnswer() {
    const question = questions[currentQuestionIndex];
    const answerInput = document.getElementById('answerInput');
    const userAnswer = answerInput.value.trim();
    const submitBtn = document.getElementById('submitBtn');
    const prevWrongBox = document.getElementById('previousWrongBox');
    const prevWrongText = document.getElementById('previousWrongText');
    // Prevent empty answer
    if (userAnswer === '') {
        alert('Please type your answer before checking!');
        answerInput.focus();
        return;
    }
    // Hide submit button after pressed
    submitBtn.style.display = 'none';
    let isCorrect = false;
    if (question.type === 'input') {
        isCorrect = parseInt(userAnswer) === question.answer;
    } else if (question.type === 'text') {
        isCorrect = userAnswer.toLowerCase() === question.answer.toLowerCase();
    }
    if (!secondChanceActive && !isCorrect) {
        // First wrong attempt, show second chance modal
        document.getElementById('secondChanceModal').classList.remove('hidden');
        document.getElementById('directInput').classList.add('hidden');
        secondChanceActive = true;
        lastAttemptCorrect = false;
        lastWrongAnswer = userAnswer;
        return;
    }
    // If second chance is active, this is the second attempt
    lastAttemptCorrect = isCorrect;
    showFeedback(isCorrect);
    // ...existing code...
    document.getElementById('tryAgainBtn').addEventListener('click', function() {
        document.getElementById('secondChanceModal').classList.add('hidden');
        // Re-show input for another try
        document.getElementById('directInput').classList.remove('hidden');
        document.getElementById('submitBtn').style.display = '';
        document.getElementById('answerInput').value = '';
        document.getElementById('answerInput').focus();
        // Show previous wrong answer in styled box
        const prevWrongBox = document.getElementById('previousWrongBox');
        const prevWrongText = document.getElementById('previousWrongText');
        prevWrongText.textContent = lastWrongAnswer;
        prevWrongBox.style.display = 'flex';
    });
    document.getElementById('closeWrongAnswerBtn').addEventListener('click', function() {
        document.getElementById('wrongAnswerModal').classList.add('hidden');
        // After closing, continue to next question
        // Hide previous wrong answer display for next question
        const prevWrongBox = document.getElementById('previousWrongBox');
        prevWrongBox.style.display = 'none';
        nextQuestion();
    });
}

function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    const feedbackText = document.querySelector('.feedback-text');
    const wrongModal = document.getElementById('wrongAnswerModal');
    const wrongAnswerText = document.getElementById('wrongAnswerText');
    const question = questions[currentQuestionIndex];
    if (isCorrect) {
        // Award score for correct first or second attempt
        currentScore += 10;
        document.getElementById('currentScore').textContent = currentScore;
        feedback.className = 'feedback correct';
        feedbackText.textContent = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        feedback.classList.remove('hidden');
        currentQuestionIndex++;
        document.getElementById('nextBtn').classList.add('hidden');
        setTimeout(() => {
            feedback.classList.add('hidden');
            secondChanceActive = false;
            nextQuestion();
        }, 2000);
    } else {
        if (secondChanceActive) {
            // Second wrong attempt, show correct answer modal
            let correctMsg = '';
            if (question.type === 'multiple') {
                // Highlight correct button
                const buttons = document.querySelectorAll('.choice-btn');
                question.options.forEach((option, idx) => {
                    if (option === question.answer) {
                        buttons[idx].classList.add('correct');
                    }
                });
                correctMsg = `The correct answer was: <b>${question.answer}</b>`;
            } else {
                correctMsg = `The correct answer was: <b>${question.answer}</b>`;
            }
            wrongAnswerText.innerHTML = tryAgainMessages[Math.floor(Math.random() * tryAgainMessages.length)] + '<br><br>' + correctMsg;
            wrongModal.classList.remove('hidden');
            feedback.classList.add('hidden');
            currentQuestionIndex++;
            secondChanceActive = false;
        } else {
            // Should not reach here, as first wrong attempt is handled in handleDirectAnswer
        }
    }
}

function endGame() {
    // Update user progress
    const correctAnswers = currentScore / 10;
    const progressGain = correctAnswers / questions.length;
    
    userProgress[currentTopic] = (userProgress[currentTopic] || 0) + progressGain;
    currentUser.progress = userProgress;
    
    // Award points and stars
    currentUser.points += currentScore;
    let starsEarned = 0;
    if (correctAnswers >= 8) {
        currentUser.stars += 3;
        starsEarned = 3;
    } else if (correctAnswers >= 6) {
        currentUser.stars += 2;
        starsEarned = 2;
    } else if (correctAnswers >= 4) {
        currentUser.stars += 1;
        starsEarned = 1;
    }
    
    // Save progress
    const userData = getUserData();
    const userKey = `${currentUser.username}_${currentUser.password}`;
    userData[userKey] = currentUser;
    saveUserData(userData);
    
    // Show results modal
    showResultsModal(correctAnswers, questions.length, currentScore, starsEarned);
}

// Utility Functions
function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getUserData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

function saveUserData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadUserData() {
    // Initialize with empty data if needed
    const userData = getUserData();
    if (Object.keys(userData).length === 0) {
        saveUserData({});
    }
}

// Results Modal Functions
function showResultsModal(correctAnswers, totalQuestions, pointsEarned, starsEarned) {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const isGoodPerformance = percentage >= 70;
    
    // Update modal content
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('totalAnswers').textContent = totalQuestions;
    document.getElementById('percentageScore').textContent = percentage;
    document.getElementById('pointsEarned').textContent = pointsEarned;
    
    // Update stars display
    const starsElement = document.getElementById('starsEarned');
    if (starsEarned > 0) {
        const starText = '⭐'.repeat(starsEarned);
        starsElement.textContent = `You earned ${starsEarned} star${starsEarned > 1 ? 's' : ''}! ${starText}`;
    } else {
        starsElement.textContent = 'Keep practicing to earn stars next time! 💪';
    }
    
    // Update performance message
    const messageElement = document.getElementById('performanceMessage');
    const resultsMessage = document.getElementById('resultsMessage');
    
    if (isGoodPerformance) {
        resultsMessage.className = 'results-message good';
        document.getElementById('resultsIcon').textContent = '🎉';
        if (percentage >= 90) {
            messageElement.textContent = "Outstanding work! You're a maths superstar! 🌟";
        } else if (percentage >= 80) {
            messageElement.textContent = "Excellent job! You really know your maths! 👏";
        } else {
            messageElement.textContent = "Great work! You're doing really well! 🎯";
        }
    } else {
        resultsMessage.className = 'results-message needs-practice';
        document.getElementById('resultsIcon').textContent = '💪';
        messageElement.textContent = "Good effort! Try this level again to improve your score! 🌈";
    }
    
    // Show modal
    document.getElementById('resultsModal').classList.remove('hidden');
}

function hideResultsModal() {
    document.getElementById('resultsModal').classList.add('hidden');
    showDashboard();
}
