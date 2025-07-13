import { Home } from './components/Home'
import {BrowserRouter as Router, Routes, Route,Navigate} from 'react-router-dom';
import { Welcome } from './components/welcome';
import { Analytics } from '@vercel/analytics/react';
 import { UseMobile } from './components/mobile';
import InstallButton from './InstallButton';
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
{location.pathname === '/' && <InstallButton />}
<Analytics />
    </>
  )
}

export default App
