// A set of default tasks.
const defaultTasks = [
  { id: 1, text: "Wake Up between 5:30-6:00", done: false },
  { id: 2, text: "GYM - 1 hour", done: false },
  { id: 3, text: "Drink Water", done: false },
  { id: 4, text: "Study for at least 4 hours", done: false },
  { id: 5, text: "Solve at least 25 questions", done: false },
  { id: 6, text: "Journal before sleep", done: false },
  { id: 7, text: "Sleep 8 hours", done: false },
  { id: 8, text: "Meditate for 10 minutes", done: false },
  { id: 9, text: "Read for 30 minutes", done: false },
  { id: 10, text: "Plan your day", done: false },
  { id: 11, text: "Organize your workspace", done: false },
  { id: 12, text: "Eat a healthy meal", done: false }
];

const DATA_KEY = 'todoData';
const CALENDAR_KEY = 'calendarData';

let data = {
  date: getToday(),
  tasks: JSON.parse(JSON.stringify(defaultTasks)),
  streak: 0,
  lastCompletedDate: ""
};

let calendarData = {}; // will store completion status keyed by date

// Utility to get today's date in YYYY-MM-DD
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Save data to localStorage
function saveData() {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

// Save calendarData to localStorage
function saveCalendarData() {
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendarData));
}

// Load data from localStorage and refresh if it's a new day
function loadData() {
  const storedData = localStorage.getItem(DATA_KEY);
  if (storedData) {
    const parsed = JSON.parse(storedData);
    if (parsed.date !== getToday()) {
      // Record previous day's completion status in calendarData
      const prevDay = parsed.date;
      calendarData[prevDay] = parsed.tasks.every(task => task.done);
      // Reset tasks for new day
      parsed.date = getToday();
      parsed.tasks = JSON.parse(JSON.stringify(defaultTasks));
      // As per spec, reset streak to 1 for a new day
      parsed.streak = 1;
      parsed.lastCompletedDate = "";
      data = parsed;
      saveCalendarData();
    } else {
      data = parsed;
    }
  }
}

// Load calendarData from localStorage
function loadCalendarData() {
  const storedCal = localStorage.getItem(CALENDAR_KEY);
  if (storedCal) {
    calendarData = JSON.parse(storedCal);
  }
}

// Render tasks list in tasks view
function renderTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  
  data.tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task';
    
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    const label = document.createElement('span');
    label.textContent = task.text;
    
    li.appendChild(checkbox);
    li.appendChild(label);
    taskList.appendChild(li);
  });
}

// Toggle task status and update progress/streak
function toggleTask(taskId) {
  data.tasks = data.tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, done: !task.done };
    }
    return task;
  });
  saveData();
  updateProgress();
  checkDailyCompletion();
}

// Update progress bar and text
function updateProgress() {
  const total = data.tasks.length;
  const completed = data.tasks.filter(task => task.done).length;
  const progressPercent = Math.round((completed / total) * 100);
  
  const progressEl = document.getElementById('progress');
  progressEl.style.width = progressPercent + "%";
  
  const progressText = document.getElementById('progressText');
  progressText.textContent = `${progressPercent}% Completed`;
}

// Check if all tasks are completed today and update streak accordingly
function checkDailyCompletion() {
  const allCompleted = data.tasks.every(task => task.done);
  const today = getToday();
  if (allCompleted && data.lastCompletedDate !== today) {
    // For simplicity, on completion we set streak to 1 if new day.
    data.streak = 1;
    data.lastCompletedDate = today;
    // Also update calendarData
    calendarData[today] = true;
    updateStreakText();
    saveData();
    saveCalendarData();
  } else if (!allCompleted && data.lastCompletedDate !== today) {
    // Mark today as not completed in calendarData if not all tasks are done.
    calendarData[today] = false;
    saveCalendarData();
  }
}

// Update streak text display
function updateStreakText() {
  const streakEl = document.getElementById('streakText');
  streakEl.textContent = `Current Streak: ${data.streak} day${data.streak !== 1 ? "s" : ""}`;
}

// Render calendar for the past 180 days
function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';
  const today = new Date(getToday());
  
  for (let i = 179; i >= 0; i--) {
    const cellDate = new Date(today);
    cellDate.setDate(today.getDate() - i);
    const dateStr = cellDate.toISOString().split('T')[0];
    
    const cell = document.createElement('div');
    cell.classList.add('calendar-cell');
    if (dateStr === getToday()) {
      cell.classList.add('cell-today');
      // Make today's cell clickable to switch to tasks view.
      cell.addEventListener('click', () => switchView("tasks"));
    }
    
    const cellInner = document.createElement('div');
    cellInner.classList.add('calendar-cell-inner');
    cellInner.textContent = cellDate.getDate();
    
    // Color the cell if we have record in calendarData
    if (calendarData.hasOwnProperty(dateStr)) {
      if (calendarData[dateStr]) {
        cell.classList.add('cell-completed');
      } else {
        cell.classList.add('cell-missed');
      }
    }
    
    cell.appendChild(cellInner);
    grid.appendChild(cell);
  }
}

// Event listener for resetting streak
document.getElementById('resetStreak').addEventListener('click', () => {
  if (confirm("Are you sure you want to reset your streak?")) {
    data.streak = 0;
    data.lastCompletedDate = "";
    updateStreakText();
    saveData();
  }
});

// View switching
function switchView(view) {
  const tasksView = document.getElementById('tasksView');
  const calendarView = document.getElementById('calendarView');
  
  if (view === "tasks") {
    tasksView.classList.remove('hidden');
    calendarView.classList.add('hidden');
  } else if (view === "calendar") {
    tasksView.classList.add('hidden');
    calendarView.classList.remove('hidden');
    renderCalendar();
  }
}

// Set event listeners for view buttons
document.getElementById('showTasksBtn').addEventListener('click', () => switchView("tasks"));
document.getElementById('showCalendarBtn').addEventListener('click', () => switchView("calendar"));

// Initialize app
function init() {
  loadCalendarData();
  loadData();
  renderTasks();
  updateProgress();
  updateStreakText();
}

init();
