// Select the HTML elements we need to interact with
const dateInput = document.querySelector("#date");
const selectedDate = document.querySelector("#selected-date");
const message = document.querySelector("#message");
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");

// watches for the submit button to be clicked to add a new task to the list
if (taskForm && taskInput && taskList) {
    const taskStorageKey = "sat-study-planner-tasks";
    let tasks = JSON.parse(localStorage.getItem(taskStorageKey) || "[]");

    function saveTasks() {
        localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
    }
// displays the tasks on the page
    function showTasks() {
        taskList.replaceChildren();
        tasks.forEach(function (task, index) {
            const item = document.createElement("li");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.done;
            const taskText = document.createElement("span");
            taskText.textContent = task.text;

            checkbox.addEventListener("change", function () {
                if (checkbox.checked) {
                    tasks.splice(index, 1);
                }
                saveTasks();
                showTasks();
            });

            item.append(checkbox, taskText);
            taskList.appendChild(item);
        });
    }
// adds a new task to the list and saves it to local storage
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;

        tasks.push({ text: text, done: false });
        saveTasks();
        showTasks();
        taskInput.value = "";
        taskInput.focus();
    });

    showTasks();
}

const countdownButton = document.querySelector("#start-countdown");
if (dateInput && selectedDate && message && countdownButton) {
let testDate;
const savedDate = localStorage.getItem("sat-countdown-date");
if (savedDate && /^\d{4}-\d{2}-\d{2}$/.test(savedDate)) {
    dateInput.value = savedDate;
    testDate = new Date(savedDate + "T08:00:00");
}

countdownButton.addEventListener("click", function () {
    if (!dateInput.value) {
        message.textContent = "Please choose a date first.";
        return;
    }

    testDate = new Date(dateInput.value + "T08:00:00");
    localStorage.setItem("sat-countdown-date", dateInput.value);
    updateCountdown();
});

function updateCountdown() {
    if (!testDate) {
        selectedDate.textContent = "Choose a date to start";
        message.textContent = "Your countdown will appear here.";
        ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
            document.querySelector("#" + unit).textContent = "0";
        });
        return;
    }

    selectedDate.textContent = "Test date: " + testDate.toLocaleDateString();

    const timeLeft = testDate.getTime() - Date.now();
    if (timeLeft <= 0) {
        ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
            document.querySelector("#" + unit).textContent = "0";
        });
        message.textContent = "It's test day! Good luck!";
        return;
    }

    // Converts the remaining time from milliseconds into seconds
    const secondsLeft = Math.floor(timeLeft / 1000);
    document.querySelector("#days").textContent = Math.floor(secondsLeft / 86400);
    document.querySelector("#hours").textContent = Math.floor(secondsLeft % 86400 / 3600);
    document.querySelector("#minutes").textContent = Math.floor(secondsLeft % 3600 / 60);
    document.querySelector("#seconds").textContent = secondsLeft % 60;
    message.textContent = "Good luck on your test!";
}

updateCountdown();
// Updates the countdown once every second.
setInterval(updateCountdown, 1000);
}

const quizForm = document.querySelector("#quiz-form");
const quizSubject = document.body.dataset.quizSubject;
const quizModule = document.body.dataset.quizModule;

if (quizForm && quizSubject && quizModule) {
    quizForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let score = 0;
        const questions = quizForm.querySelectorAll(".question");

        questions.forEach(function (question) {
            const selectedAnswer = question.querySelector("input:checked");
            const correctAnswer = question.querySelector(
                'input[value="' + question.dataset.answer + '"]'
            );
            const correctLabel = correctAnswer.closest(".answer");
            const oldFeedback = question.querySelector(".feedback");
            const feedback = document.createElement("p");

            if (oldFeedback) oldFeedback.remove();
            question.classList.remove("correct", "incorrect");
            question.querySelectorAll(".answer").forEach(function (label) {
                label.classList.remove("is-correct", "is-wrong");
            });

            feedback.className = "feedback";
            correctLabel.classList.add("is-correct");

            if (selectedAnswer && selectedAnswer.value === question.dataset.answer) {
                score++;
                question.classList.add("correct");
                feedback.textContent = "Correct!";
            } else {
                question.classList.add("incorrect");
                if (selectedAnswer) {
                    selectedAnswer.closest(".answer").classList.add("is-wrong");
                }
                feedback.textContent = "Correct answer: " + correctLabel.textContent.trim();
            }

            question.appendChild(feedback);
        });

        document.querySelector("#result").textContent =
            "You got " + score + " out of " + questions.length + " correct.";

        const storageKey = "sat-" + quizSubject + "-module-" + quizModule + "-";
        const attempts = Number(localStorage.getItem(storageKey + "attempts")) || 0;
        localStorage.setItem(storageKey + "attempts", String(attempts + 1));
        localStorage.setItem(storageKey + "score", String(score));
        localStorage.setItem(storageKey + "total", String(questions.length));
    });
}

// how the review form works
const form = document.querySelector("#review-form");

if (form) {
    const input = document.querySelector("#review");
    const list = document.querySelector("#review-list");
    const reviewStorageKey = "sat-site-reviews";
    let reviews = JSON.parse(localStorage.getItem(reviewStorageKey) || "[]");

    function showReviews() {
        list.replaceChildren();
        reviews.forEach((review) => {
            const item = document.createElement("li");
            item.textContent = review;
            list.append(item);
        });
    }
// add review when thhe button is clicked and saves it
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const review = input.value.trim();
        if (!review) {
            input.focus();
            return;
        }

        reviews.push(review);
        localStorage.setItem(reviewStorageKey, JSON.stringify(reviews));
        showReviews();
        input.value = "";
    });

    showReviews();
}
// shows the analytics for each module and subject
function showAnalytics(subject, module, elementId) {
    const result = document.querySelector("#" + elementId);
    if (!result) return;

    const key = "sat-" + subject + "-module-" + module + "-";
    const score = localStorage.getItem(key + "score");
    const total = localStorage.getItem(key + "total");
    const attempts = Number(localStorage.getItem(key + "attempts")) || 0;

    if (score === null || total === null || attempts === 0) return;

    const percent = Math.round(Number(score) / Number(total) * 100);
    result.textContent = "Latest score: " + score + " / " + total +
        " (" + percent + "%) · Attempts: " + attempts;
}
// displays analytics on the page
showAnalytics("english", 1, "english-analytics");
showAnalytics("math", 1, "math-analytics");
showAnalytics("english", 2, "english-module-2-analytics");
showAnalytics("math", 2, "math-module-2-analytics");