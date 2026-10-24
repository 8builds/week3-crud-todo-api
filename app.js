const express = require('express');

const app = express();

app.use(express.json());

// Initial todo data
let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build a Todo API', completed: true }
];

// GET all todos
app.get('/todos', (req, res) => {
  res.status(200).json(todos);
});

// BONUS: GET active (incomplete) todos
app.get('/todos/active', (req, res) => {
  const active = todos.filter((todo) => todo.completed === false);
  res.status(200).json(active);
});

// BONUS: GET completed todos
app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((todo) => todo.completed === true);
  res.status(200).json(completed);
});

// GET one todo by ID
app.get('/todos/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  const todo = todos.find((item) => item.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.status(200).json(todo);
});

// POST a new todo
app.post('/todos', (req, res) => {
  const { task, completed } = req.body;

  if (typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({
      error: 'Task is required and must be a non-empty string'
    });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      error: 'Completed must be true or false'
    });
  }

  const newId = todos.length > 0
    ? Math.max(...todos.map((todo) => todo.id)) + 1
    : 1;

  const newTodo = {
    id: newId,
    task: task.trim(),
    completed: completed ?? false
  };

  todos.push(newTodo);

  res.status(201).json(newTodo);
});

// PATCH (update) a todo
app.patch('/todos/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid todo ID' });
  }

  const todo = todos.find((item) => item.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const updates = Object.keys(req.body);
  const allowedFields = ['task', 'completed'];

  if (updates.length === 0) {
    return res.status(400).json({
      error: 'Request body cannot be empty'
    });
  }

  const invalidFields = updates.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: 'Only task and completed fields can be updated'
    });
  }

  if (
    req.body.task !== undefined &&
    (typeof req.body.task !== 'string' || req.body.task.trim() === '')
  ) {
    return res.status(400).json({
      error: 'Task must be a non-empty string'
    });
  }

  if (
    req.body.completed !== undefined &&
    typeof req.body.completed !== 'boolean'
  ) {
    return res.status(400).json({
      error: 'Completed must be true or false'
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

  const index = todos.findIndex((todo) => todo.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  todos.splice(index, 1);

  res.status(204).send();
});

// Handle errors, including malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
