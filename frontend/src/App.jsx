import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import InputPage from "./pages/InputPage";
import TimetablePage from "./pages/TimetablePage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT ROUTE → Dashboard */}
        <Route
          path="/"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* AUTH ROUTES */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login />}
        />

        <Route
          path="/signup"
          element={token ? <Navigate to="/" /> : <Signup />}
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/create"
          element={token ? <InputPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/timetable"
          element={token ? <TimetablePage /> : <Navigate to="/login" />}
        />

        <Route path="/logout" element={<Logout />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
