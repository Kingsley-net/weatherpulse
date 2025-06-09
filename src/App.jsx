import { Home } from './components/Home'
import {BrowserRouter as Router, Routes, Route,Navigate} from 'react-router-dom';
import { Welcome } from './components/welcome';

import { UseMobile } from './components/mobile';
function App() {
  const isMobile = UseMobile()
  return (
    <>
<Router>
  <Routes>
    <Route path='/' element={ <Welcome/>}></Route>
   
    <Route path='/Home'  element={<Home />}></Route>
  </Routes>

</Router>

    </>
  )
}

export default App
