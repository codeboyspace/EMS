// App.js

import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import AppNavBar from './components/AppNavBar';
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminSignup";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import { useState } from "react";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="md:h-screen bg-purple-100">
      <BrowserRouter>
        <ToastContainer />
        
        <div>
          <Routes>
            <Route path="/" exact
              element={
                <Login
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  setName={setName}
                  setEmail={setEmail}
                />
              }
            />
            <Route path="register" exact
              element={
                <Register
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  setName={setName}
                  setEmail={setEmail}
                />
              }
            />

            <Route path="admin/register" exact
              element={
                <AdminRegister />
              }
            />
            <Route path="admin/dashboard" exact
              element={
                <AdminDashboard />
              }
            />
            <Route path="admin/login" exact
              element={
                <AdminLogin />
              }
            />
            <Route path="home" exact
              element={
                <Home />
              }
            />

            <Route path="login" exact
              element={
                <Login
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  setName={setName}
                  setEmail={setEmail}
                />
              }
            />
            <Route path="forgotPassword" exact
              element={<ForgotPassword isLoggedIn={isLoggedIn} />}
            />
            <Route path="resetPassword" 
              element={<ResetPassword isLoggedIn={isLoggedIn} />}
            />
            <Route path="profile" exact
              element={
                <Profile isLoggedIn={isLoggedIn} name={name} email={email} />
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
