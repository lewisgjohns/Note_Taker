//these are the variables that are required to run the server
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

//this is the express function that is used to run the server
const app = express();
const PORT = process.env.PORT || 8080;

//this is the middleware that is used to parse the data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

//this is the get request that is used to get the notes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'));
});

//returns a server error if the file read fails
app.get('/api/notes', (req, res) => {
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server Error');
    }
    res.json(JSON.parse(data));
  });
});

//this is the get request that is used to access the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

//this is the post request that is used to post the notes
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4();

  //this is the read file function that is used to read the file
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server Error');
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    //writes the updated notes array to the db.json file in a formatted JSON string
    fs.writeFile('./db.json', JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server Error');
      }
      res.json(newNote);
    });
  });
});

//this is the delete request that is used to delete the notes
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

//this is the listen function that is used to listen to the port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
