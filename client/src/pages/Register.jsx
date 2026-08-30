import {Link, useNavigate} from 'react-router-dom'
import {register as registerApi} from "../api/authApi";
import {useState} from "react";

function Register(){
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e){
    e.preventDefault();
    setError("");

    try{
      await registerApi(name, email, password);
      navigate("/login");
    }
    catch(err){
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit = {handleSubmit}>
        <input type = "text" value = {name} placeholder = "Please enter your name" onChange = {(e) => setName(e.target.value)} />
        <input type = "email" value = {email} placeholder = "Please enter your email" onChange = {(e) => setEmail(e.target.value)} />
        <input type = "password" value = {password} placeholder = "Please enter your password" onChange = {(e) => setPassword(e.target.value)} />
        {error && <p>{error}</p>}
        <button type = "submit">REGISTER</button>
      </form>
      <p>Already have an account?<Link to = "/login">Login</Link></p>
    </div>
  );
}

export default Register;