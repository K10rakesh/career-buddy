import {Link, useNavigate} from 'react-router-dom'
import {useState} from "react";
import useAuth from "../context/useAuth"

function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const {login} = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    setError("");

    try{
      await login(email, password);
      navigate("/dashboard");
    }
    catch(err){
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit = {handleSubmit}>
        <input type = "email" value = {email} placeholder = "Please enter your email" onChange = {(e) => setEmail(e.target.value)} />
        <input type = "password" value = {password} placeholder = "Please enter your password" onChange = {(e) => setPassword(e.target.value)} />
        {error && <p>{error}</p>}
        <button type = "submit">LOGIN</button>
      </form>
      <p>Don't have an account?<Link to = "/register">Register</Link></p>
    </div>
  );
}

export default Login;