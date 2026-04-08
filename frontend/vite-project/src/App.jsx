import Home from "./components/home"
import Indetailed from "./components/indetailed";
import {BrowserRouter,Routes,Route} from 'react-router-dom'
const App=()=>{
  return(
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>}/>    
      <Route path="/details/:id" element={<Indetailed />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;