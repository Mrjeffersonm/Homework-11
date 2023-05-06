const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

function loadDb() {
  const jsonString = fs.readFileSync("db/db.json");
  const notesDb = JSON.parse(jsonString);
  return notesDb
};

function saveDb(notesDb) {
  const jsonSave = JSON.stringify(notesDb)
  fs.writeFileSync('db/db.json', jsonSave)
};

function addNote(note) {
  const notesDb = loadDb()
  var nextId = notesDb.nextId || 1
  var notes = notesDb.notes
  note.id = nextId
  notes[`${nextId}`] = note
  notesDb.nextId = nextId + 1
  saveDb(notesDb)
  return nextId
};

function getNotes() {
  const notesDb = loadDb()
  const notes = notesDb.notes;
  var response = [];
  Object.keys(notes).forEach(noteId => {
    console.log(noteId)
    console.log(notes[noteId])
    response.push(notes[noteId]);
  })
  return JSON.stringify(response)
};

function deleteNote(noteId) {
  const notesDb = loadDb()
  const notes = notesDb.notes
  delete notes[noteId]
  saveDb(notesDb)
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/', (req, res) => res.send('Navigate to /send or /routes'));

app.get('/notes.html', (req, res) => {
  console.log("returning html")
  res.sendFile(path.join(__dirname, 'public/notes.html'))
});

app.get('/api/notes', (req, res) => {
  console.log("Returning notes.db");
  const notes = getNotes()
  console.log(notes)
  res.send(notes)
});

app.post('/api/notes', (req, res) => {
  const jsonString = fs.readFileSync("db/db.json");
  const notesDb = JSON.parse(jsonString);

  console.log(req.body)
  console.log(notesDb)
  const noteId = addNote(req.body)
  res.send(`[${noteId}]`)
});

app.delete('/api/notes/:id', (req, res) => {
  console.log(req.params.id)
  deleteNote(req.params.id)
  res.send(`[${req.params.id}]`)
});

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.listen(PORT, () =>
  console.log(`Example app listening at http://localhost:${PORT}`)
);
