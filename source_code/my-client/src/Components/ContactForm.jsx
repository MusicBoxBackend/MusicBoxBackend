import React, { useState } from 'react';
import axios from 'axios';

const ContactForm = (props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [fail, setFail] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
        name: name,
        email: email,
        message: message,
      };
    axios.post(`${props.host}/send-email`, formData)
    .then(function (response) {
      // Success

    })
    .catch(function (response) {
    //handle error
    console.log(response);
    setFail(true)
    });

    setDone(true)
  };

  if (done)
  {
    if (fail)
    {
      return (
        <div style = {{
          display: 'flex', 
          padding: '20%', 
          alignItems: 'center',
          flexDirection: 'column',}}>
  
          <h1 style = {{color: 'rgb(92, 119, 226)'}}>Oh no!</h1>
          <p style = {{ color: 'gray'}}>There was an error sending your message. Please try again later.</p>
        </div>
        )
    }
    else
    {
      // Success
      return (
      <div style = {{
        display: 'flex', 
        padding: '20%', 
        alignItems: 'center',
        flexDirection: 'column',}}>

        <h1 style = {{color: 'rgb(92, 119, 226)'}}>Success!</h1>
        <p style = {{ color: 'gray'}}>Your message has been sent</p>
      </div>
      )
    }
  }

  // Message not yet sent: Show form

  return (
    <div style = {{margin:'20px', display: 'flex',
    
    alignItems: 'center',
    flexDirection: 'column',
    }}>
        <img src = 'email.png' alt="email icon" width= "100px"></img>
        <p style={{ fontSize:'30px', fontWeight:'100', color: 'rgb(92, 119, 226)', textAlign: 'center'}}>LET'S GET IN TOUCH.</p>
        <div >
            <form onSubmit={handleSubmit} >
              <input style = {{margin:'5px', backgroundColor: 'gray', border: '1px solid black'}}type="text" class='form-control  'value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
              <input style = {{margin:'5px',backgroundColor: 'gray', border: '1px solid black'}}type="email" class='form-control  'value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"/>
              <textarea style = {{margin:'5px',backgroundColor: 'gray', border: '1px solid black', height: '200px'}}class='form-control  'value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message" required />
              <button type="submit" class="oval-button" >Send Message</button>
            </form>
        </div>
    </div>
  );
};

export default ContactForm;
