import { useState } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from "./Componants/Login";
import Home from "./Componants/Home";



function App() {

  const [islogin ,setLogin]=useState(false);

  const handleLogin=(email,password)=>{
      if(email === "jay@123" && password === "123")
      {
        setLogin(true);
      }
      else
      {
        alert("provide valid email and password");
      }
  }

  return (
    <Router>
      <Routes>
          <Route path="/" element={islogin ? <Navigate to="/home"/>:<Login  onLogin={handleLogin} />}/>
          <Route path="Home" element={islogin ? <Home /> : <Navigate to="/" />}/>
      </Routes>
    </Router>
  )
}

export default App
