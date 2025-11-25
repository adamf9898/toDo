/**
 * toDo App - A stylish and professional task management application
 * Uses localStorage for data persistence
 */

// Task Manager Class
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSort = 'created';
        this.searchQuery = '';
        this.editingTaskId = null;
        this.deletedTask = null;
        this.undoTimeout = null;
        
        this.initializeElements();
        this.initializeTheme();
        this.bindEvents();
        this.render();
    }

    // Initialize DOM elements
    initializeElements() {
        // Form elements
        this.taskForm = document.getElementById('task-form');
        this.taskTitleInput = document.getElementById('task-title');
        this.taskPrioritySelect = document.getElementById('task-priority');
        this.taskDueDateInput = document.getElementById('task-due-date');
        this.taskCategorySelect = document.getElementById('task-category');
        this.taskDescriptionInput = document.getElementById('task-description');

        // Filter and search elements
        this.searchInput = document.getElementById('search-input');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sort-select');

        // Task list and stats
        this.taskList = document.getElementById('task-list');
        this.emptyState = document.getElementById('empty-state');
        this.totalTasksEl = document.getElementById('total-tasks');
        this.activeTasksEl = document.getElementById('active-tasks');
        this.completedTasksEl = document.getElementById('completed-tasks');
        this.overdueTasksEl = document.getElementById('overdue-tasks');

        // Bulk action buttons
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.clearAllBtn = document.getElementById('clear-all');

        // Modal elements
        this.editModal = document.getElementById('edit-modal');
        this.editForm = document.getElementById('edit-form');
        this.editTaskIdInput = document.getElementById('edit-task-id');
        this.editTitleInput = document.getElementById('edit-title');
        this.editPrioritySelect = document.getElementById('edit-priority');
        this.editDueDateInput = document.getElementById('edit-due-date');
        this.editCategorySelect = document.getElementById('edit-category');
        this.editDescriptionInput = document.getElementById('edit-description');
        this.modalCloseBtn = document.getElementById('modal-close');
        this.cancelEditBtn = document.getElementById('cancel-edit');

        // Theme toggle
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle ? this.themeToggle.querySelector('.theme-icon') : null;

        // Progress elements
        this.progressFill = document.getElementById('progress-fill');
        this.progressPercentage = document.getElementById('progress-percentage');

        // Undo elements
        this.undoToast = document.getElementById('undo-toast');
        this.undoMessage = document.getElementById('undo-message');
        this.undoBtn = document.getElementById('undo-btn');
    }

    // Initialize theme based on saved preference or system preference
    initializeTheme() {
        const savedTheme = localStorage.getItem('todo-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            this.updateThemeIcon(savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.updateThemeIcon('dark');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('todo-theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                this.updateThemeIcon(newTheme);
            }
        });
    }

    // Update theme icon based on current theme
    updateThemeIcon(theme) {
        if (this.themeIcon) {
            this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('todo-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    // Bind event listeners
    bindEvents() {
        // Form submission
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));

        // Search input
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Sort select
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });

        // Bulk actions
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        // Modal events
        this.editForm.addEventListener('submit', (e) => this.handleEditTask(e));
        this.modalCloseBtn.addEventListener('click', () => this.closeModal());
        this.cancelEditBtn.addEventListener('click', () => this.closeModal());
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeModal();
        });

        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Undo button
        this.undoBtn.addEventListener('click', () => this.undoDelete());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modal
            if (e.key === 'Escape' && this.editModal.classList.contains('show')) {
                this.closeModal();
            }
            
            // 'n' to focus on task input (when not in an input field)
            if (e.key === 'n' && !this.isInputFocused()) {
                e.preventDefault();
                this.taskTitleInput.focus();
            }
        });

        // Task list event delegation
        this.taskList.addEventListener('click', (e) => this.handleTaskListClick(e));
        this.taskList.addEventListener('change', (e) => this.handleTaskCheckbox(e));
    }

    // Check if user is currently focused on an input element
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' || 
               activeElement.tagName === 'TEXTAREA' || 
               activeElement.tagName === 'SELECT' ||
               activeElement.isContentEditable;
    }

    // Load tasks from localStorage
    loadTasks() {
        try {
            const tasksJson = localStorage.getItem('todo-tasks');
            return tasksJson ? JSON.parse(tasksJson) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem('todo-tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    // Handle adding a new task
    handleAddTask(e) {
        e.preventDefault();

        const title = this.taskTitleInput.value.trim();
        if (!title) return;

        const newTask = {
            id: this.generateId(),
            title: title,
            description: this.taskDescriptionInput.value.trim(),
            priority: this.taskPrioritySelect.value,
            category: this.taskCategorySelect.value,
            dueDate: this.taskDueDateInput.value || null,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.render();

        // Reset form
        this.taskForm.reset();
        this.taskTitleInput.focus();
    }

    // Handle task checkbox toggle
    handleTaskCheckbox(e) {
        if (!e.target.classList.contains('task-checkbox-input')) return;

        const taskId = e.target.dataset.taskId;
        const task = this.tasks.find(t => t.id === taskId);
        
        if (task) {
            task.completed = e.target.checked;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
        }
    }

    // Handle clicks on task list (edit, delete buttons)
    handleTaskListClick(e) {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (editBtn) {
            const taskId = editBtn.dataset.taskId;
            this.openEditModal(taskId);
        }

        if (deleteBtn) {
            const taskId = deleteBtn.dataset.taskId;
            this.deleteTask(taskId);
        }
    }

    // Open edit modal
    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.editingTaskId = taskId;
        this.editTaskIdInput.value = taskId;
        this.editTitleInput.value = task.title;
        this.editPrioritySelect.value = task.priority;
        this.editDueDateInput.value = task.dueDate || '';
        this.editCategorySelect.value = task.category;
        this.editDescriptionInput.value = task.description || '';

        this.editModal.classList.add('show');
        this.editTitleInput.focus();
    }

    // Close edit modal
    closeModal() {
        this.editModal.classList.remove('show');
        this.editingTaskId = null;
    }

    // Handle edit form submission
    handleEditTask(e) {
        e.preventDefault();

        const taskId = this.editTaskIdInput.value;
        const task = this.tasks.find(t => t.id === taskId);
        
        if (!task) return;

        task.title = this.editTitleInput.value.trim();
        task.priority = this.editPrioritySelect.value;
        task.dueDate = this.editDueDateInput.value || null;
        task.category = this.editCategorySelect.value;
        task.description = this.editDescriptionInput.value.trim();

        this.saveTasks();
        this.closeModal();
        this.render();
    }

    // Delete a task with undo support
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        // Store the deleted task for potential undo
        this.deletedTask = {
            task: this.tasks[taskIndex],
            index: taskIndex
        };
        
        // Remove the task
        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
        this.render();
        
        // Show undo toast
        this.showUndoToast('Task deleted');
    }

    // Show undo toast
    showUndoToast(message) {
        // Clear any existing timeout
        if (this.undoTimeout) {
            clearTimeout(this.undoTimeout);
        }
        
        this.undoMessage.textContent = message;
        this.undoToast.classList.add('show');
        
        // Hide after 5 seconds
        this.undoTimeout = setTimeout(() => {
            this.hideUndoToast();
        }, 5000);
    }

    // Hide undo toast
    hideUndoToast() {
        this.undoToast.classList.remove('show');
        this.deletedTask = null;
    }

    // Undo the last delete action
    undoDelete() {
        if (!this.deletedTask) return;
        
        // Restore the task at its original position
        this.tasks.splice(this.deletedTask.index, 0, this.deletedTask.task);
        this.saveTasks();
        this.render();
        
        // Hide the undo toast
        if (this.undoTimeout) {
            clearTimeout(this.undoTimeout);
        }
        this.hideUndoToast();
        
        this.showNotification('Task restored');
    }

    // Clear completed tasks
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear.');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) return;

        this.tasks = this.tasks.filter(t => !t.completed);
        this.saveTasks();
        this.render();
    }

    // Clear all tasks
    clearAll() {
        if (this.tasks.length === 0) {
            this.showNotification('No tasks to clear.');
            return;
        }

        if (!confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) return;

        this.tasks = [];
        this.saveTasks();
        this.render();
    }

    // Show toast notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'toast-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Filter tasks based on current filter
    filterTasks(tasks) {
        switch (this.currentFilter) {
            case 'active':
                return tasks.filter(t => !t.completed);
            case 'completed':
                return tasks.filter(t => t.completed);
            default:
                return tasks;
        }
    }

    // Search tasks
    searchTasks(tasks) {
        if (!this.searchQuery) return tasks;

        return tasks.filter(task => 
            task.title.toLowerCase().includes(this.searchQuery) ||
            (task.description && task.description.toLowerCase().includes(this.searchQuery)) ||
            task.category.toLowerCase().includes(this.searchQuery)
        );
    }

    // Sort tasks
    sortTasks(tasks) {
        const sortedTasks = [...tasks];

        switch (this.currentSort) {
            case 'due':
                return sortedTasks.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            case 'alphabetical':
                return sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
            case 'created':
            default:
                return sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    }

    // Check if a task is overdue
    isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        return dueDate < today;
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        if (date.getTime() === today.getTime()) return 'Today';
        if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }

    // Update statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        const overdue = this.tasks.filter(t => this.isOverdue(t)).length;

        this.totalTasksEl.textContent = total;
        this.activeTasksEl.textContent = active;
        this.completedTasksEl.textContent = completed;
        this.overdueTasksEl.textContent = overdue;

        // Update progress bar
        this.updateProgressBar(total, completed);
    }

    // Update progress bar
    updateProgressBar(total, completed) {
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        this.progressFill.style.width = `${percentage}%`;
        this.progressPercentage.textContent = `${percentage}%`;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Create task HTML
    createTaskHtml(task) {
        const isOverdue = this.isOverdue(task);
        const escapedTitle = this.escapeHtml(task.title);
        const escapedDescription = this.escapeHtml(task.description || '');

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <label class="task-checkbox">
                    <input 
                        type="checkbox" 
                        class="task-checkbox-input" 
                        data-task-id="${task.id}"
                        ${task.completed ? 'checked' : ''}
                    >
                    <span class="checkbox-custom"></span>
                </label>
                <div class="task-content">
                    <div class="task-header">
                        <span class="task-title">${escapedTitle}</span>
                        <span class="task-badge priority-${task.priority}">${task.priority}</span>
                        <span class="task-badge category-badge">${task.category}</span>
                    </div>
                    ${escapedDescription ? `<p class="task-description">${escapedDescription}</p>` : ''}
                    <div class="task-meta">
                        ${task.dueDate ? `
                            <span class="due-date ${isOverdue ? 'overdue' : ''}">
                                📅 ${this.formatDate(task.dueDate)}${isOverdue ? ' (Overdue)' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" data-task-id="${task.id}" title="Edit task">
                        ✏️
                    </button>
                    <button class="action-btn delete-btn" data-task-id="${task.id}" title="Delete task">
                        🗑️
                    </button>
                </div>
            </li>
        `;
    }

    // Main render function
    render() {
        // Apply filters, search, and sort
        let displayTasks = this.filterTasks(this.tasks);
        displayTasks = this.searchTasks(displayTasks);
        displayTasks = this.sortTasks(displayTasks);

        // Update task list
        if (displayTasks.length === 0) {
            this.taskList.innerHTML = '';
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
            this.taskList.innerHTML = displayTasks.map(task => this.createTaskHtml(task)).join('');
        }

        // Update statistics
        this.updateStats();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});
