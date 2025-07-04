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

const STORAGE_KEY = 'todoData';
let data = {
  date: getToday(),
  tasks: defaultTasks,
  streak: 0,
  lastCompletedDate: ""
};

// Utility to get today's date in YYYY-MM-DD
function getToday() {
  return new Date().toISOString().split('T')[0];
}

// Load data from localStorage if date is same
function loadData() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    const parsed = JSON.parse(storedData);
    // If it's a new day, reset tasks to default (all false)
    if (parsed.date !== getToday()) {
      parsed.date = getToday();
      parsed.tasks = defaultTasks.map(task => ({ ...task, done: false }));
    }
    return parsed;
  }
  return data;
}

// Save to localStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Render tasks list
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
  if (allCompleted) {
    const today = getToday();
    
    // Only update streak if not already updated for today
    if (data.lastCompletedDate !== today) {
      // Determine yesterday's date
      const yesterday = new Date();
      yesterday.setDate(new Date().getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if the last completed day was yesterday to continue streak
      if (data.lastCompletedDate === yesterdayStr) {
        data.streak += 1;
      } else {
        // If streak was broken or it's the first day of completion
        data.streak = 1;
      }
      
      data.lastCompletedDate = today;
      updateStreakText();
      saveData();
    }
  }
}

// Update streak text display
function updateStreakText() {
  const streakEl = document.getElementById('streakText');
  streakEl.textContent = `Current Streak: ${data.streak} day${data.streak !== 1 ? 's' : ''}`;
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

// Initialize app
function init() {
  data = loadData();
  renderTasks();
  updateProgress();
  updateStreakText();
}

init();
