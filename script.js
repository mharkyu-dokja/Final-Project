const form = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const subjectInput = document.getElementById("subject");
const deadlineInput = document.getElementById("deadline");
const taskList = document.getElementById("taskList");
const summary = document.getElementById("summary");
const message = document.getElementById("message");

let tasks = [];

try {
    tasks = JSON.parse(
        localStorage.getItem("studentTasks") || "[]"
    );

    if (!Array.isArray(tasks)) tasks = [];
} catch {
    tasks = [];
}

let currentFilter = "all";

function saveTasks() {
    try {
        localStorage.setItem("studentTasks", JSON.stringify(tasks));
    } catch {
        message.textContent = "Could not save tasks in this browser.";
    }
}

function renderTasks() {
    taskList.replaceChildren();

    const filtered = tasks.filter(task => {
        if (currentFilter === "pending") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    summary.textContent =
        `${tasks.length} total | ` +
        `${tasks.filter(t => !t.completed).length} pending | ` +
        `${tasks.filter(t => t.completed).length} completed`;

    if (filtered.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "No tasks to display.";
        taskList.appendChild(empty);
        return;
    }

    filtered.forEach(task => {
        const item = document.createElement("li");
        item.className = "task" + (task.completed ? " completed" : "");

        const heading = document.createElement("strong");
        heading.className = "task-title";
        heading.textContent = task.title;

        const details = document.createElement("p");
        details.textContent =
            `${task.subject} | Deadline: ${task.deadline}`;

        const status = document.createElement("p");
        status.textContent = task.completed ? "Completed" :
            (task.deadline < new Date().toLocaleDateString("en-CA")
                ? "Overdue" : "Pending");

        const toggle = document.createElement("button");
        toggle.textContent = task.completed
            ? "Mark Pending" : "Complete";

        toggle.addEventListener("click", () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        const remove = document.createElement("button");
        remove.textContent = "Delete";
        remove.className = "delete";

        remove.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
            message.textContent = "Task deleted.";
        });

        item.append(heading, details, status, toggle, remove);
        taskList.appendChild(item);
    });
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const subject = subjectInput.value.trim();
    const deadline = deadlineInput.value;

    if (!title || !subject || !deadline) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    if (title.length > 100 || subject.length > 50) {
        message.textContent = "The task title or subject is too long.";
        return;
    }

    tasks.push({
        id: crypto.randomUUID(),
        title,
        subject,
        deadline,
        completed: false
    });

    saveTasks();
    renderTasks();
    form.reset();
    message.textContent = "Task added successfully.";
});

document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

renderTasks();