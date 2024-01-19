import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';

import axios from 'axios';

export default function Login(props) {
    const host = props.host
    const redir = props.redir
    
    const AUTH_LOGIN = "Login"
    const AUTH_SIGNUP = "Sign up"

    const [authMode, setAuthMode] = useState(AUTH_LOGIN)
    const navigate = useNavigate();
    

    // auth mode change should verify data again

    function updatePassword()
    {
        validateData()
    }

    function updateUsername()
    {
        validateData()
        
    }


    function login()
    {
        // Fetch the data from frontend
        let username = document.getElementById("usernameInput").value
        let password = document.getElementById("passwordInput").value
        let data = {'username': username, 'password': password}

        axios.post(`${host}/login`, data)
          .then(function (response) {
            // check if valid
            console.log(response.data)
            if (response.data.authenticated)
            {
                error("success!")
                props.setToken(response.data.username, response.data.id)
                localStorage.setItem('admin', response.data.admin);
                if (redir)
                {
                    window.location.reload()
                    navigate(redir);

                }
                else{
                    navigate('/');
                    window.location.reload()
                }
                
            }
            else{
                error("Invalid password!")
            }
            return response.data._id; //return the id to store as a token on the site?
          })
          .catch(function (response) {
            //handle error
            error("Wrong password")
            console.log(response);
          });

    }

    // Add these credentials to the databse.
    async function signup()
    {
        // Fetch the data from frontend
        let username = document.getElementById("usernameInput").value
        let password = document.getElementById("passwordInput").value

        let data = {'username': username, 'password': password}

        await axios.post(`${host}/signup`, data)
          .then(function (response) {
            props.setToken(response.data.username, response.data.id)
            // After signing up we log in (set the token) and navigate back to the home page
            navigate('/');
            window.location.reload()
          })
          .catch(function (response) {
            //handle error
            console.log(response);
          });
    }

    // display this error
    function error(err)
    {
        document.getElementById("errorMsg").style.display = "flex"
        document.getElementById("errorMsg").innerHTML = err
    }

    // Return true if this username is taken
    function validateData()

    {
        let valid = true
        // return false if no password is present
        if (! document.getElementById("passwordInput").value || ! document.getElementById("usernameInput").value)
            valid = false

        if (valid) // entries are syntactically good...
        {
            // Now, we must check and make sure the username is available
            let username = document.getElementById("usernameInput").value
            let data = {'username': username}
            // we need to check the database for this username
            axios.post(`${host}/getUser`, data)
            .then(function (response) {
                
                if (!response.data["exists"]) // Username available! Good to go.
                {
                    document.getElementById('login-btn').disabled = authMode === AUTH_SIGNUP ? false : true;
                    if (authMode === AUTH_LOGIN)
                    {
                        error("no account found!")
                    }
                    else
                    {
                        document.getElementById("errorMsg").style.display = "none"
                    }
                      
                }
                else
                {
                    document.getElementById('login-btn').disabled = authMode === AUTH_LOGIN ? false : true;
                    if (authMode === AUTH_SIGNUP)
                    {
                        error("username taken!")
                    }
                    else{
                        document.getElementById("errorMsg").style.display = "none"
                    }
                }

                
            })
        }
        else // Syntax is bad, user or pass is empty
        {
            document.getElementById("errorMsg").style.display = "none"
            document.getElementById('login-btn').disabled = true;
        }
        
    }

    // Click to toggle between login and sign up.
    function toggleLoginSignup()
    {
        setAuthMode((authMode === AUTH_LOGIN)? AUTH_SIGNUP : AUTH_LOGIN)
        document.getElementById("usernameInput").value = ""
        document.getElementById("passwordInput").value = ""
        validateData()
        
    }
    
    
  return(
        <div class = "login">
            <p style={{ fontSize:'30px', fontWeight:'100', color: 'rgb(92, 119, 226)'}}>{authMode.toUpperCase()}</p>
                <form style = {{with: '100%'}}>
                    <div className="form-group">
                        <input type="text" style = {{margin:'5px'}} className="form-control" id="usernameInput" onInput={updateUsername} placeholder="Username"></input>
                    </div>

                    <div className="form-group">
                        <input type="password" style = {{margin:'5px'}} className="form-control" id="passwordInput" onInput={updatePassword} placeholder="Password"></input>
                    </div>

                    <p id = "errorMsg">Error msg</p>

                    <div style = {{margin:'5px', marginTop:'15px'}}>
                        <button type="button" className="oval-button" id = "login-btn" onClick = {authMode === AUTH_LOGIN ? login : signup}>{authMode}</button>
                        <div id = "toggle-authmode" style = {{color: 'rgb(92, 119, 226)'}}>
                            <span>Or</span>
                            <button type="button" id = "toggle-authmode-btn" onClick = {toggleLoginSignup} style = {{ color: 'gray'}}>{(authMode === AUTH_LOGIN ? AUTH_SIGNUP: AUTH_LOGIN).toLowerCase()}</button>
                            <span>instead</span>
                        </div>
                        
                    </div>

                    <div>
                        <p style = {{ color: 'gray', paddingTop: '40px', textAlign: 'center'}}>{props.msg}</p>
                    </div>
                </form>
            </div>


   
  )
}