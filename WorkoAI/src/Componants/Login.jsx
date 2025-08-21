import  { useState } from 'react'

function Login({onLogin}) {
  const [email, setEmail]=useState('');
  const [password, setPassword]=useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };
  return (
    <div style={{margin:"0px",padding:"0px",background:"#48474c",border:"2px solid"}}>
      <div>
        <div>
          <h2 style={{alignItems:"center",justifyContent:"center",color:"white",textAlign:"center"}}>Login Form for Work.AI</h2>
          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",width:"300px",alignItems:"center",justifyContent:"center",textAlign:"center",marginLeft:"600px"}}>
            <label >Enter Your Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
            <label >Enter Your password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>setPassword(e.target.value)}
              required
            />
            <button style={{width:"100px",height:"30px",borderRadius:"10px",border:"none",marginTop:"10px",background:"pink",cursor:"pointer"}} type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login