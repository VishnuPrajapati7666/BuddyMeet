import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route,BrowserRouter as Router, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Authentication from './pages/AuthenticationPage'
import { AuthProvider } from './contexts/AuthContext'
import VideoMeetComponent from './pages/VideoMeet'
import Home from './pages/Home'
import History from './pages/History'
function App() {
  

  return (
    <>
     <div className="App">
   <Router>
    <AuthProvider>

    <Routes>
      <Route path='/' element={<LandingPage/>}></Route>
       <Route path='/auth'
            element={<Authentication/>}>
            </Route>
        <Route path='/:url' element={<VideoMeetComponent/>}>
        </Route>
        <Route path='/home' element={<Home/>}></Route>
        <Route path='/history' element={<History/>}></Route>
        
        
    </Routes>
    </AuthProvider>
   </Router>
   </div>
    </>
  )
}

export default App
