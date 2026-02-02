import { BrowserRouter, Routes, Route } from "react-router-dom";
import InputPage from "./pages/InputPage";
import TimetablePage from "./pages/TimetablePage";
const token = localStorage.getItem("token");
import Login from "./pages/Login";
import Signup from "./pages/Signup";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/signup" element={<Signup />} />
               <Route path="/login" element={<Login />} />
        <Route path="/" element={token ? <InputPage /> : <Login />}/>
        
        <Route
          path="/timetable"
          element={token ? <TimetablePage /> : <Login />}
        />
      </Routes>b\
    </BrowserRouter>
  );
}

export default App;
