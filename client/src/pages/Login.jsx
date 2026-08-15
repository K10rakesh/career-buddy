import {Link} from 'react-router-dom'

function Login(){
  return (
    <div>
      <h1>Login</h1>
      <p>Don't have an account?<Link to = "/register">Register</Link></p>
    </div>
  );
}

export default Login;