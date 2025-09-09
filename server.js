const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'users.json');

// Safely read users from JSON file
function readUsers() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }

    const data = fs.readFileSync(DATA_FILE, 'utf-8').trim();

    if (!data) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }

    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read users.json, resetting file...', err.message);
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

// Utility: Safely write users to JSON file
function writeUsers(users) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Failed to write users.json:', err.message);
  }
}

// POST: Add or update a user
app.post('/users', (req, res) => {
  const { firstName, lastName, section, status } = req.body;

  if (!firstName || !lastName || !section || !status) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  let users = readUsers();

  const userIndex = users.findIndex(
    user =>
      user.firstName.toLowerCase() === firstName.toLowerCase() &&
      user.lastName.toLowerCase() === lastName.toLowerCase()
  );

  if (userIndex !== -1) {
    users[userIndex].status = status;
    writeUsers(users);
    console.log(`Updated: ${lastName}, ${firstName} → ${status}`);
    return res.status(200).json({
      message: `Attendance for ${lastName}, ${firstName} updated to ${status}`
    });
  }

  const newUser = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    firstName,
    lastName,
    section,
    status
  };

  users.push(newUser);
  writeUsers(users);
  console.log(`Added: ${lastName}, ${firstName} → ${status}`);

  res.status(201).json({
    message: `New student ${lastName}, ${firstName} added with status: ${status}`
  });
});

//GET: All users
app.get('/users', (req, res) => {
  const users = readUsers();
  res.status(200).json(users);
});

// GET: Root
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

app.listen(PORT, () => {
  console.log(` Server is running at http://localhost:${PORT}`);
});

module.exports = app;
