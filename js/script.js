
// ----- DUMMY DATA (static) -----
let tasks = [
    {
        id: 1,
        title: 'Design new dashboard mockups',
        description: 'Figma handoff for the v2.0 release',
        due: getTodayStr(),
        priority: 'high',
        tag: 'work',
        completed: false,
    },
    {
        id: 2,
        title: 'Review pull requests',
        description: 'Check team PRs before merge',
        due: getTodayStr(),
        priority: 'medium',
        tag: 'work',
        completed: false,
    },
    {
        id: 3,
        title: 'Gym session',
        description: 'Leg day 💪',
        due: getTodayStr(),
        priority: 'low',
        tag: 'health',
        completed: false,
    },
    {
        id: 4,
        title: 'Weekly team sync',
        description: 'Standup meeting at 10am',
        due: getTomorrowStr(),
        priority: 'medium',
        tag: 'work',
        completed: false,
    },
    {
        id: 5,
        title: 'Read "Atomic Habits"',
        description: 'Chapters 4–6',
        due: getTomorrowStr(),
        priority: 'low',
        tag: 'study',
        completed: true,
    },
    {
        id: 6,
        title: 'Prepare presentation',
        description: 'Q3 board meeting slides',
        due: getFutureStr(3),
        priority: 'high',
        tag: 'work',
        completed: false,
    },
];

// ----- Helper Date Functions -----
function getTodayStr() {
    const d = new Date();
    return d.toISOString().split('T')[0];
}
function getTomorrowStr() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}
function getFutureStr(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

// ----- State (for UI only) -----
let currentFilter = 'all';
let searchTerm = '';

// ----- DOM Refs -----
const taskListEl = document.getElementById('taskList');
const emptyStateEl = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const inProgressTasksEl = document.getElementById('inProgressTasks');
const overdueTasksEl = document.getElementById('overdueTasks');
const taskCountEl = document.getElementById('taskCount');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// ----- Modal Form Refs -----
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDesc');
const taskDueInput = document.getElementById('taskDue');
const taskPriorityInput = document.getElementById('taskPriority');
const taskTagInput = document.getElementById('taskTag');

// ----- Render Function (pure display) -----
function renderTasks() {
    let filtered = [...tasks];
    const todayStr = getTodayStr();

    // Filter
    if (currentFilter === 'today') {
        filtered = filtered.filter(t => t.due === todayStr);
    } else if (currentFilter === 'upcoming') {
        filtered = filtered.filter(t => t.due > todayStr);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.completed === true);
    }

    // Search
    if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(term) ||
            t.description.toLowerCase().includes(term) ||
            t.tag.toLowerCase().includes(term)
        );
    }

    // Sort: incomplete first, then by due date
    filtered.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.due.localeCompare(b.due);
    });

    // Update stats
    updateStats();

    // Empty state
    if (filtered.length === 0) {
        taskListEl.innerHTML = '';
        emptyStateEl.style.display = 'flex';
        taskCountEl.textContent = '0 tasks';
        return;
    }
    emptyStateEl.style.display = 'none';
    taskCountEl.textContent = `${filtered.length} task${filtered.length > 1 ? 's' : ''}`;

    // Build HTML
    let html = '';
    filtered.forEach(task => {
        const dueDate = new Date(task.due + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dueLabel = '';
        if (task.due) {
            if (dueDate < today) dueLabel = '<i class="fas fa-clock"></i> Overdue';
            else if (dueDate.getTime() === today.getTime()) dueLabel = '<i class="fas fa-calendar-day"></i> Today';
            else dueLabel = `<i class="fas fa-calendar"></i> ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }

        const priorityClass = `priority-${task.priority}`;
        const checkedClass = task.completed ? 'done' : '';
        const titleClass = task.completed ? 'done-text' : '';

        html += `
            <div class="task-item" data-id="${task.id}">
                <button class="task-check ${checkedClass}" data-action="toggle">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </button>
                <div class="task-info">
                    <div class="task-title ${titleClass}">${task.title}</div>
                    <div class="task-meta">
                        <span>${dueLabel}</span>
                        <span class="task-priority ${priorityClass}">${task.priority}</span>
                        <span class="task-tag"><i class="fas fa-tag"></i> ${task.tag}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button style="opacity:0.3;cursor:default;" title="Edit (UI only)">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button style="opacity:0.3;cursor:default;" title="Delete (UI only)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    taskListEl.innerHTML = html;
}

// ----- Update Stats -----
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => !t.completed).length;
    const todayStr = getTodayStr();
    const overdue = tasks.filter(t => !t.completed && t.due < todayStr).length;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    inProgressTasksEl.textContent = inProgress;
    overdueTasksEl.textContent = overdue;
}

// ----- Toggle Completion (visual only) -----
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks(); // re-render
    }
}

// ----- Event Listeners -----

// Toggle task via click on check button
taskListEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.task-check');
    if (!btn) return;
    const item = btn.closest('.task-item');
    if (!item) return;
    const id = Number(item.dataset.id);
    toggleTask(id);
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Search
searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value;
    renderTasks();
});

// View buttons (UI only)
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Sidebar toggle (mobile)
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 820) {
        if (!sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// ============================================
// MODAL: PURE DESIGN – NO LOGIC
// Just open/close for visual demo
// ============================================
const modal = document.getElementById('taskModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const addTaskBtn = document.getElementById('addTaskBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');


function openModal() {
  
    taskForm.reset();
    taskDueInput.value = getTodayStr();  // default to today
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

addTaskBtn.addEventListener('click', openModal);
emptyAddBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});


// ----- Form submit: Add Task -----
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = taskTitleInput.value.trim();
    if (!title) {
        alert('Please enter a task title.');
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        description: taskDescInput.value.trim(),
        due: taskDueInput.value || getTodayStr(),
        priority: taskPriorityInput.value,
        tag: taskTagInput.value,
        completed: false,
    };

    tasks.push(newTask);
    renderTasks();
    closeModal();
    taskForm.reset();
});

// Escape key closes modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// ----- Initial Render -----
renderTasks();