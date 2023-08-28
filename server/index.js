const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 4001;
const connectDB = require('./db/connect');
require('dotenv').config();
var jwt = require("jsonwebtoken");
const JWT_SECRET = "secret";
const { } = require("./middleware");
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

const generateNewId = async () => {
    const highestIdTask = await taskModel.findOne().sort({id:-1}) 
    if (highestIdTask) {
      return highestIdTask.id+1;
    } else {
      return 1; // If no tasks exist yet, start with ID 1
    }
};
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
