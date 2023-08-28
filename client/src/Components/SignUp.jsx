import React,{useState} from 'react'
import { backendUrl } from '../constants/backendUrl';
import { useNavigate } from 'react-router-dom';

/**
 * The above function is a React component for a sign-up form that sends user data to a backend server
 * for registration.
 */
export default function SignUp() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e){

    e.preventDefault();
    await fetch(`${backendUrl}/signup`, {
      method: "POST",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
      });
      navigate('/')
      
  }

  return (
    <div className='signup'>
        <h3>SignUp</h3>
        <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label><br />
            <input type="name" name="name" placeholder='Name' onChange={(e)=>setName(e.target.value)}/><br />
            <label htmlFor="">Email</label><br />
            <input type="email" name="email" placeholder='Email'onChange={(e)=>setEmail(e.target.value)}/><br />
            <label htmlFor="">Password</label><br />
            <input type="password" name="password" placeholder='Password'onChange={(e)=>setPassword(e.target.value)}/><br />
            <input type="submit" />
        </form>
        
    </div>
  )
}
