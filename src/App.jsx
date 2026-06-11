import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import Chatboot from "./pages/Chatboot";
import UserDashboard from "./pages/Userdashboard";
import UserSignal from "./pages/UserSignal";
import UserNotification from "./pages/UserNotification"
import UserSpeedTest from "./pages/UserSpeedTest";
import UserProfile from "./pages/UserProfile"; 
import UserParametre from "./pages/UserParametre"



import AdminDashboard from "./Admin/AdminDashboard";
import AdminLogin from "./Admin/AdminLogin";
import AdminSignUp from "./Admin/AdminSignUp";
import Ticket from "./Admin/Ticket";
import Technicien from "./Admin/Technicien";
import Panne from "./Admin/Panne";
import Infrastructure from "./Admin/Infrastructure";
import Rapport from "./Admin/Rapport";
import AdminParametre from "./Admin/AdminParametre";
import AdminSign from "./Admin/AdminSign";





import "./App.css";  

const App = () => {  

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard/assistant" element={<Chatboot />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/dashboard/signalements" element={<UserSignal />} />
          <Route path="/dashboard/notifications" element={<UserNotification />} />
          <Route path="/dashboard/speedtests" element={<UserSpeedTest />} />
          <Route path="/dashboard/profile" element={<UserProfile />} />
          <Route path="/dashboard/settings" element={<UserParametre />} />


          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignUp />} />
          <Route path="/admin/tickets" element={<Ticket />} />
          <Route path="/admin/techniciens" element={<Technicien />} />
          <Route path="/admin/pannes" element={<Panne />} />
          <Route path="/admin/infrastructure" element={<Infrastructure />} />
          <Route path="/admin/rapports" element={<Rapport />} />
          <Route path="/admin/Parametres" element={<AdminParametre />} />
          <Route path="/admin/signals" element={<AdminSign />} />






          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;