const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Correct static files path

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server Error');
    }
    res.json(JSON.parse(data));
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4();

  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server Error');
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile('./db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server Error');
      }
      res.json(newNote);
    });
  });
});

app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;

  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server Error');
    }

    let notes = JSON.parse(data);
    notes = notes.filter(note => note.id !== id);

    fs.writeFile('./db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server Error');
      }
      res.status(204).end();
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
