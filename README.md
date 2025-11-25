# toDo

A stylish and professional web application for creating, editing, and managing tasks.

![toDo App](https://img.shields.io/badge/version-1.0.0-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Features

- **Create Tasks**: Add tasks with title, description, priority, category, and due date
- **Edit Tasks**: Modify existing tasks via an intuitive modal interface
- **Delete Tasks**: Remove individual tasks or bulk delete completed/all tasks
- **Mark Complete**: Toggle task completion status with visual feedback
- **Search & Filter**: Search tasks and filter by status (All, Active, Completed)
- **Sort Options**: Sort tasks by creation date, due date, priority, or alphabetically
- **Task Statistics**: View real-time stats for total, active, completed, and overdue tasks
- **Persistent Storage**: Tasks are saved in localStorage and persist across sessions
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **No Dependencies**: Built with vanilla HTML, CSS, and JavaScript

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adamf9898/toDo.git
   ```

2. Open `index.html` in your web browser

That's it! No build process or server required.

### Usage

1. **Adding a Task**: Enter a task title in the main input field, optionally set priority, due date, category, and description, then click "Add Task"
2. **Completing a Task**: Click the checkbox next to any task to mark it as complete
3. **Editing a Task**: Click the pencil icon (✏️) on any task to open the edit modal
4. **Deleting a Task**: Click the trash icon (🗑️) on any task to delete it
5. **Filtering Tasks**: Use the filter buttons (All, Active, Completed) to view specific tasks
6. **Searching Tasks**: Type in the search box to find tasks by title, description, or category
7. **Sorting Tasks**: Use the sort dropdown to organize tasks by date, priority, or name

## File Structure

```
toDo/
├── index.html      # Main HTML structure
├── styles.css      # Styles and responsive design
├── app.js          # JavaScript application logic
└── README.md       # Documentation
```

## Data Storage

Tasks are stored in the browser's localStorage as JSON. Each task includes:

- `id`: Unique identifier
- `title`: Task title
- `description`: Optional description
- `priority`: low, medium, or high
- `category`: personal, work, shopping, health, or other
- `dueDate`: Optional due date
- `completed`: Boolean completion status
- `createdAt`: Timestamp of creation
- `completedAt`: Timestamp of completion (if completed)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is open source and available for personal and commercial use.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.
