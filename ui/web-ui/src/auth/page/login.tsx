import { useAuth } from '../access';

import React, { useEffect, useState } from "react";
import Image from "../../../assets/image.png";
import Logo from "../../../assets/logo.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";


export const LogIn = () => {

    const {email, setEmail, password, setPassword, handleLogin, error, success} = useAuth();
    const [ showPassword, setShowPassword ] = useState(false);

    return (
        <div className="login-main">
        <div className="login-left">
            <img src={Image} alt="" />
        </div>

        <div className="login-right">
            <div className="login-right-container">
        
            <div className="login-logo">
                <img src={Logo} alt="" />
            </div>
        
            <div className="login-center">
                <h2>Welcome back!</h2>
                <p>Please enter your details</p>
                <form>

                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                
                <div className="pass-input-div">
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" />
                    {showPassword ? <FaEyeSlash onClick={() => {setShowPassword(!showPassword)}} /> : <FaEye onClick={() => {setShowPassword(!showPassword)}} />}
                    
                </div>

                <div className="login-center-options">
                    <div className="remember-div">
                    <input type="checkbox" id="remember-checkbox" />
                    <label htmlFor="remember-checkbox">
                        Remember for 30 days
                    </label>
                    </div>
                    <a href="/forgot-password" className="forgot-pass-link">
                    Forgot password?
                    </a>
                </div>

                <div className="login-center-buttons">
                    <button type="button" onClick={handleLogin}>Log In</button>
                </div>
                {error && <p style={{color: 'red'}}>{error}</p>}
                {success && <p style={{color: 'green'}}>{success}</p>}
                </form>
            </div>

            <p className="login-bottom-p">
                Don't have an account? <a href="/signup">Sign Up</a>
            </p>
            </div>
        </div>
        </div>
    );
};

export default LogIn;



