/* The code is importing necessary modules and variables from external sources. */
import React, {useState, useEffect} from 'react';
import {  useNavigate } from 'react-router-dom';
import { backendUrl } from '../constants/backendUrl';


export default function Dashboard() {

  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  // const [task, setTask] = useState({});
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null); // Track the task being edited
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');




/**
 * The below code defines a set of functions for handling the editing of a task in a React application,
 * including opening and closing a modal, submitting the edited task to the backend server, and
 * updating the tasks array with the edited task.
 */

    
  const handleEditModalOpen = (task) => {
    setEditingTask(task);
    setEditedTitle(task.title);
    setEditedDescription(task.description);
  };

  const handleEditModalClose = () => {
    setEditingTask(null);
    setEditedTitle('');
    setEditedDescription(''); 
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "authorization": localStorage.getItem("token")
        },
        body: JSON.stringify({
          title: editedTitle,
          description: editedDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update the tasks array with the edited task
      setTasks((prevTasks) =>
        prevTasks[editingTask.id-1] = { title: editedTitle, description: editedDescription }
        )

      // Close the edit modal
      handleEditModalClose();
    } catch (error) {
      console.error('Error updating task:', error);
      // Handle error if needed
    }
  }

  /**
   * The handleSubmit function is an asynchronous function that handles form submission by sending a
   * POST request to the backend server with the title and description of a task, and then updates the
   * tasks state with the newly added task.
   */
  async function handleSubmit (e){
    e.preventDefault();
      if(title.trim().length === 0){
          alert('title required');
          return;
      }else{
       const response = await fetch(`${backendUrl}/addtask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "authorization": localStorage.getItem("token")
          },
          body: JSON.stringify({
            title: title,
            description: description
          })
        });
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const json = await response.json();
        const newTask = json.document;
        setTasks([...tasks,{
          title:newTask.title, 
          description:newTask.description
        }]);
        setTitle('');
        setDescription('')
      }
  }

  
  /**
   * The handleDelete function is an asynchronous function that handles task deletion by sending a
   * DELETE request to the backend server with the id of a task, and then filters the
   * tasks state accordingly.
   */
  async function handleDelete(id){
    await fetch(`${backendUrl}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "authorization": localStorage.getItem("token")
      },
    });
    // Remove the deleted task from the tasks state
    setTasks(tasks.filter(task => task.id !== id));
    
  }
 
  /**
   * The `init` function is an asynchronous function that checks if a token exists in the local
   * storage, if it does, it makes a GET request to fetch tasks from the backend using the token
   * for authorization and if it doesn't, it navigates us back to login route .
   */
  const init = async () => {
    
    if(!localStorage.getItem('token')){
      navigate('/')
    }
    try{
      const response = await fetch(`${backendUrl}/tasks`, {
      method: "GET",
      "authorization": localStorage.getItem("token")
    });

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const json = await response.json();
    const taskData = json.tasks;
    setTasks(taskData);
  }catch (error) {
    console.error("Error fetching tasks:", error);
  }
}

useEffect(() => {
  init();
  // eslint-disable-next-line
}, [])

  return (
    <>
    <div className='dashboard'>
      
      {/* The code is rendering a navbar component with a "Log Out" button. When the button is
      clicked, it removes the "token" key from the localStorage and navigates the user to the "/"
  route. This allows the user to log out of the application. */}
      <div className='navbar'> 
        <button onClick={()=>{localStorage.removeItem('token'); navigate('/')}}>Log Out</button>
      </div>

        {/* The code is rendering a form for inputting a new task. */}
        <div className='task-input'>
          <form onSubmit={handleSubmit}>
              <label htmlFor="title">Title</label><br />
              <input type="text" name="title" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder='Enter Title'/><br />
              <label htmlFor="description">Description</label><br />
              <textarea name='description' value={description} onChange={(e)=> setDescription(e.target.value)} placeholder='Enter Description'/><br />
              <input type="submit" />
          </form>
        </div>
        
        
        {/* Task List */}
        {/* The code block is a conditional rendering statement in
        JSX. It checks if the `tasks` array has any elements. If it does, it renders a `<div>`
        element with the class name "task-list" and maps over each task in the `tasks` array to
        render the title, description, and buttons for editing and deleting the task. If the `tasks`
        array is empty, it renders a `<p>` element with the text "No Tasks Available". */}
        
        {tasks.length>0 ?( 
        <div className="task-list">Task List
          {tasks.map((task,index)=>(
            <div key={index}>
                <p><strong>Title: {task.title}</strong></p>
                <p>Description: {task.description}</p>
                <button onClick={()=> handleEditModalOpen(task)}>Edit</button>
                <button  onClick={()=>handleDelete(task.id)}> Delete</button>
                
            </div>

          ))}
        </div>
        ):(
          <p>No Tasks Available</p>
        )
        }

        {/* Edit Task Modal */}
      {/* The code block is a conditional rendering statement in JSX. It checks
      if the `editingTask` variable is truthy (i.e., not null or undefined). If `editingTask` is
      truthy, it renders the following JSX code: */}
      {editingTask && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <form onSubmit={handleEditSubmit}>
              <label htmlFor="editedTitle">Title</label>
              <input
                type="text"
                id="editedTitle"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <label htmlFor="editedDescription">Description</label>
              <textarea
                id="editedDescription"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
              <button type="submit">Save</button>
              <button onClick={handleEditModalClose}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
