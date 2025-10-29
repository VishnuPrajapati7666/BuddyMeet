import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import "../App.css"
function LandingPage() {
  const router=useNavigate();
  return (
     <div className='landingPageContainer'>
      <nav>
        <div>
          <h1>BuddyMeet</h1>
        </div>
        <div className='navlist'>
           <p onClick={()=>{
            router("/Guest")
           }}>join as guest</p>
           <p onClick={()=>{
            router("/auth")
           }}>register</p>
           <div onClick={()=>{
            router("/auth")
           }} role='button'>
              <p>Login</p>
           </div>
        </div>
      </nav>
    
   <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones</h1>

                    <p>Cover a distance by Apna Video Call</p>
                    <div role='button'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>

                    {/* <img src="/mobile.png" alt="" /> */}

                </div>
            </div>
    </div>
  )
}

export default LandingPage