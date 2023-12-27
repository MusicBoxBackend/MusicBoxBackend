import 'bootstrap/dist/css/bootstrap.css';
import './styles.css';
import React from 'react';
import { BrowserRouter } from "react-router-dom";

import Welcome from './Components/Welcome.jsx'
import Upload from './Components/Upload.jsx';
import Login from "./Components/Login.jsx";
import Account from './Components/Account.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import './styles.css';
import { Routes, Route} from "react-router-dom";
import Nav from './Components/Nav.jsx';
import ContactForm from './Components/ContactForm.jsx';
import Link from './Components/Link.jsx'


const Main = () => {
  const host = "http://localhost:3001"
  

  // store username and id locally.. username for display, id for auth
  function setToken(username, id) {
    // Store the username as a token to display and allow logged-in-features
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('id', id);
  }
  
  // Get token: Returns the username token (not the id)
  function getToken() {
    return sessionStorage.getItem('username');
  }


   
  if (host)
    return (
      <>
    
    <BrowserRouter>
    {/* Global background color */}
    <div style={{ backgroundColor: '#f0f0f0', height: '100vh' }} >
    <Nav token = {getToken}></Nav>
      <Routes>
          <Route index element={<Welcome token = {getToken} host = {host}/>} />

          <Route path="login" element={<Login setToken = {setToken} token = {getToken} host = {host}/>} />
          <Route path="account" element={<Account setToken = {setToken} token = {getToken} host = {host}/>} />
          <Route path="contact" element={<ContactForm host = {host}/>} />
          <Route path="link" element={<Link host = {host} token = {getToken} setToken = {setToken}/>} />
          <Route path = "upload" element = {(sessionStorage.getItem('admin') === "false")? (<Welcome token = {getToken} host = {host}/>): <Upload host = {host}/>}/>
      </Routes>
      </div>
    </BrowserRouter>
    
    </>
  

    )

}

export default Main;