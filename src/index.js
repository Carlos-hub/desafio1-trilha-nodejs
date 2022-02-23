const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();
const users = []
app.use(cors());
app.use(express.json());

// const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const {username} = request.headers

  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(400).json({error: "User not found!"})
  }
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  // Complete aqui
  const {name,username} = request.body

  const userAlreadyExists = users.some(
    (user) =>user.username === username)
    if(userAlreadyExists){
      return response.status(400).json({error:"User already exists!"})
    }
  users.push({
    id: uuidv4(), // precisa ser um uuid
    name, 
    username, 
    todos: []
  })
  
  return response.status(201).json(users)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title,deadline} = request.body

  const addToDo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  }

  user.todos.push(addToDo)
  return response.status(201).json(user.todos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title,deadline} = request.body
  const {id} = request.params

  const todo = user.todos.find(todo => todo.id ===id)

  if(!todo){
    return response.status(404).send({error:"ToDo no exists"})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todo = user.todos.find(todo => todo.id ===id)
  if(!todo){
    return response.status(404).json({error:"The ToDo no exists"})
  }
  todo.done = true

  return response.json(todo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(!todoIndex === -1){
    return response.status(404).json({error:"To Do Not found"})
  }

  user.todos.splice(todoIndex,1)

  return response.status(204)
});

module.exports = app;