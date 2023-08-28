const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 4001;
const connectDB = require('./db/connect');
require('dotenv').config();
var jwt = require("jsonwebtoken");
const JWT_SECRET = "secret";
const bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require("cors");
app.use(cors());
const taskModel = require('./models/task'); 
const userModel = require('./models/user'); 
const mongoose = require('mongoose');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })
  
const startServer = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await connectDB(uri);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};
  
startServer();

app.get('/',(req,res) =>{
    res.json({
        msg:"this is task manager api"
    })
})

/**
 * The function generates a new ID for a task by finding the highest existing ID and incrementing it by
 * 1, or starting with ID 1 if no tasks exist yet.
 */
const generateNewId = async () => {
    const highestIdTask = await taskModel.findOne().sort({id:-1}) 
    if (highestIdTask) {
      return highestIdTask.id+1;
    } else {
      return 1; // If no tasks exist yet, start with ID 1
    }
};


/* The code `app.post('/signup', async(req,res)=>{...})` is defining a route for user signup. When a
POST request is made to "/signup", the code checks if the email provided in the request body already
exists in the database by using the `userModel.findOne` method. If an existing user is found, it
throws an error with the message "Email already exists". */
app.post('/signup', async(req,res)=>{
  try{
    const existingUser = await userModel.findOne({email:req.body.email});
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const userData = await userModel.create(req.body).then(result => {
      console.log(result);
    })

    res.json({
      msg: "User Added", userData
    });
    }catch(error){
      res.json({ status: 'error', error})
    }
})

/* The code `app.post('/login', async(req,res) => {...})` is defining a route for user login. When a
POST request is made to "/login", the code retrieves the email and password from the request body.
It then uses the `userModel` to find a user with the specified email in the database. */

app.post('/login', async(req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = await userModel.findOne({email:email});

  if (!user) {
    return res.status(403).json({ msg: "User not found" });
  }

  if (user.password !== password) {
    return res.status(403).json({ msg: "Incorrect password" });
  }
  
  const token = jwt.sign(
    {
      email: user.email,
    },
    JWT_SECRET
  );
  return res.json({ token: token });
});

/* The code `app.post("/addtask",async (req,res) => {...})` is defining a route for adding a new task
to the database. When a POST request is made to "/addtask", the code generates a new ID for the task
using the `generateNewId` function. It then creates a new task document using the `taskModel.create`
method, with the ID and other data from the request body. If the task is successfully created, it
sends a response with a status code of 201 and a JSON object containing a success message and the
created task document.  */

app.post("/addtask",async (req,res) => {
    try 
    {
  
      const newId = await generateNewId();
      
      const taskData = { id: newId, ...req.body };
      const document = await taskModel.create(taskData)
      res.status(201).json({ message: 'Document created', document });
    }
    catch(error) {
      res.status(500).json({ message:"error creating document", error: error.message});
    }
});


/* The code `app.get("/tasks", async (req, res) => {...})` is defining a route for retrieving all
tasks. When a GET request is made to "/tasks", the code uses the taskModel to find all tasks in the
database. */

app.get("/tasks", async (req, res) => {
    taskModel.find({})
    .then((tasks)=>{
          res.json({tasks})
        }
    )
    .catch((err) =>{
      console.log(err)
      res.status(500).send(err);
    })
    
  })



/* This code defines a route for retrieving a task with a specific ID. When a GET request is made to
'/tasks/:id', the code uses the taskModel to find a task with the specified ID in the request
parameters (req.params.id).*/


app.get('/tasks/:id', async (req,res) =>{

  taskModel.find({ id: req.params.id })
      .then((task) =>{
        res.json({
          task,
        });
      })
    .catch (err =>{
      console.error(err);
    })
  });



/* The code `app.put('/tasks/:id', async (req, res) => {...})` is defining a route for updating a task
with a specific ID. */

app.put('/tasks/:id', async (req, res) => {
  const taskId = req.params.id; // Get the task ID from the URL parameter
  const { title, description } = req.body; // Destructure title and description from the request body
  
  try {
    const updatedTask = await taskModel.findOneAndUpdate(
      {id: taskId},
      { title, description }, // Update the title and description fields
      { new: true } // Return the updated task in the response
    ).lean();

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task updated', task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});


/* The code `app.delete("/tasks/:id",(req,res) =>{...})` is defining a route for deleting a task with a
specific ID. */


app.delete("/tasks/:id",(req,res) =>{

  const taskId = req.params.id;
  
  taskModel.deleteOne({id:taskId})
  .then(() => {
    res.send(`Deleted task with ID: ${taskId}`);
  })
  .catch(error => {
    res.status(500).send(`Error deleting task: ${error.message}`);
  });
})
