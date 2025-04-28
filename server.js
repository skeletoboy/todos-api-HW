// server.js
// A simple Express.js backend for a Todo list API

const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
// const fs = require('fs');

// Import sqlite3
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("todos.db", (err) => {
  if(err) {
    return console.error("Error opening database", err.message);
  }
  console.log("Connected to todos database")
})

// Create todos list
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    priority TEXT NOT NULL,
    isComplete INTEGER,
    isFun INTEGER
  )
`, (err) => {
  if (err) {
    return console.error("Error creating table:", err.message);
  }
  console.log("Todos table created.");
});





// Middleware to parse JSON requests
app.use(express.json());

// TODO ➡️  Middleware to inlcude static content from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));


// In-memory array to store todo items
let todos = [];
let nextId = 1;

// TODO ➡️ serve index.html from 'public' at the '/' path
app.get('/', (req,res) => {
    res.sendFile('index.html');
});


// TODO ➡️ GET all todo items at the '/todos' path
app.get('/todos', (req,res) => {
  db.all("SELECT * FROM todos", [], (err,rows) => {
    if(err){
      return res.status(404).json({message: "Can't get todos", error: err.message});
    }
    res.json(rows);
  })
})


// GET a specific todo item by ID
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  db.get("SELECT * FROM todos", [id], (err,rows) => {
    if(err){
      return res.status(404).json({message: `Error getting todo`});
    }
    if(!id){
      return res.status(404).json({message: `Todo item not found`});
    }
    
    res.json(rows);
  });
});

  // const id = parseInt(req.params.id);
  // const todo = todos.find(item => item.id === id);
  // if (todo) {
  //   res.json(todo);
  // } else {
  //   // TODO ➡️ handle 404 status with a message of { message: 'Todo item not found' }
  //   res.status(404).json({message: `Todo item not found`})

// POST a new todo item
app.post('/todos', (req, res) => {
  const { name, priority = 'low', isFun } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  //Populate table
  const insertQuary = `
    INSERT INTO todos (name, priority, isComplete, isFun)
    VALUES (?, ?, 0, ?)
  `;
  db.run(insertQuary, [name, priority, isFun], function(err) {
    if(err){
      return console.error(`Error inserting ${name}:`, err.message);
    }
      console.log(`A row has been inserted with rowid ${this.lastID}`);
      const newTodo = {
        id: this.lastID,
        name,
        priority,
        isComplete: false,
        isFun
      };
      res.status(201).json(newTodo);
  });

  // const newTodo = {
  //   id: this.lastID,
  //   name,
  //   priority,
  //   isComplete: false,
  //   isFun
  // };
  
  // // todos.push(newTodo);
  // // TODO ➡️ Log every incoming TODO item in a 'todo.log' file @ the root of the project
  // // In your HW, you'd INSERT a row in your db table instead of writing to file or push to array!
  // // fs.writeFileSync('todo.log', JSON.stringify(newTodo), {flag: 'a'});

  // res.status(201).json(newTodo);
});

// DELETE a todo item by ID
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(item => item.id === id);

  db.run("DELETE FROM todos WHERE ID = ?", [id], function(err) {
    if(err) {
      return res.status(500).json({message: "Error deleting todo", error: err.message});
    }
    if(!id){
      return res.status(404).json({message: "Todo not found"});
    }
    res.json({message: `Todo ${id} was deleted`});

  });

  // if (index !== -1) {
  //   todos.splice(index, 1);
  //   res.json({ message: `Todo item ${id} deleted.` });
  // } else {
  //   res.status(404).json({ message: 'Todo item not found' });
  // }
});

// Start the server
// TODO ➡️ Start the server by listening on the specified PORT
app.listen(PORT, () => {
    console.log(`Listening in port ${PORT}`);
})