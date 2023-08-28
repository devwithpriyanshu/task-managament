import React,{useState} from 'react'
import { backendUrl } from '../constants/backendUrl';
import { useNavigate } from 'react-router-dom';
import {Link} from 'react-router-dom';

/**
 * The Login function is a React component that handles user login by sending a POST request to a
 * backend server with the user's email and password, and then storing the received token in local
 * storage if the login is successful.
 */
export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e){

    e.preventDefault();
    try{
    const response = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await response.json();
    console.log(json)
    if(json.token){
      localStorage.setItem("token", json.token)
      alert('Login Successful');
      navigate('/dashboard')
    }else{
      alert('login failed');
    }
    
  }
  catch (error) {
    console.error('Error during login:', error);
    alert('Login failed. Please try again later.');
  } 
      
  }

  return (
    <div className='login'>
        <h3>Login</h3>
        <form onSubmit={handleSubmit}>
            <label htmlFor="">Email</label><br />
            <input type="email" name="email" placeholder='Email' onChange={(e)=>setEmail(e.target.value)}/><br />
            <label htmlFor="">Password</label><br />
            <input type="password" name="password" placeholder='Password' onChange={(e)=>setPassword(e.target.value)}/><br />
            <input type="submit" />
        </form>
        <p>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
    </div>
  )
}
