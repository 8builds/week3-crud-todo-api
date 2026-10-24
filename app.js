
const express = require('express');
const app = express();

app.use(express.json());

// Temporary todo storage
let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// GET all todos
app.get('/todos', (req, res) => {
  res.status(200).json(todos);
});

// GET a single todo by ID
app.get('/todos/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.status(200).json(todo);
});

// CREATE a todo
app.post('/todos', (req, res) => {
  const { task, completed } = req.body;

  if (typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({
      error: 'Task is required and must be a non-empty string',
    });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      error: 'Completed must be true or false',
    });
  }

  const newId = todos.length
    ? Math.max(...todos.map((t) => t.id)) + 1
    : 1;

  const newTodo = {
    id: newId,
    task: task.trim(),
    completed: completed ?? false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// UPDATE a todo
app.patch('/todos/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const fields = Object.keys(req.body);
  const allowedFields = ['task', 'completed'];

  if (
    fields.length === 0 ||
    fields.some((field) => !allowedFields.includes(field))
  ) {
    return res.status(400).json({
      error: 'Provide valid task or completed fields',
    });
  }

  if (
    req.body.task !== undefined &&
    (typeof req.body.task !== 'string' ||
      req.body.task.trim() === '')
  ) {
    return res.status(400).json({
      error: 'Task must be a non-empty string',
    });
  }

  if (
    req.body.completed !== undefined &&
    typeof req.body.completed !== 'boolean'
  ) {
    return res.status(400).json({
      error: 'Completed must be true or false',
    });
  }

  if (req.body.task !== undefined) {
    todo.task = req.body.task.trim();
  }

  if (req.body.completed !== undefined) {
    todo.completed = req.body.completed;
  }

  res.status(200).json(todo);
});

// DELETE a todo
app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(index, 1);
  res.status(204).send();
});

// GET completed todos
app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((t) => t.completed);
  res.status(200).json(completed);
});

// Handle invalid JSON and server errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  res.status(500).json({ error: 'Server error' });
});

// Start server
const PORT = 3002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

