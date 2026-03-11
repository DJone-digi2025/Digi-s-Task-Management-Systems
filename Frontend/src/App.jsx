import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Team from "./pages/Team"
import Manager from "./pages/Manager"
import Instructor from "./pages/Instructor"
import Developer from "./pages/Developer"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/team/:name" element={<Team />} />
        <Route path="/manager" element={<Manager />} />
        <Route path="/instructor" element={<Instructor/>}/>
        <Route path="/dev" element={<Developer/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App