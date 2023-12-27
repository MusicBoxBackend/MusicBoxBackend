import React, { useState } from 'react';
import axios from 'axios';

const ContactForm = (props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
        name: name,
        email: email,
        message: message,
      };
    axios.post(`${props.host}/send-email`, formData)
    .then(function (response) {
    
        setName('');
        setEmail('');
        setMessage('');

    })
    .catch(function (response) {
    //handle error
    console.log(response);
    });

  };

  return (
    <div style = {{margin:'20px', display: 'flex',
    
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
    }}>
        <img src = 'email.png' alt="email icon" width= "100px"></img>
        <p style={{ fontSize:'30px', fontWeight:'100'}}>LET'S GET IN TOUCH.</p>
        <div >
            <form onSubmit={handleSubmit}>
            <input style = {{margin:'5px'}}type="text" class='form-control  'value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
            <input style = {{margin:'5px'}}type="email" class='form-control  'value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"/>
            <textarea style = {{margin:'5px', height: '200px'}}class='form-control  'value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message" required />
            <button type="submit" class="btn btn-light">Send Message</button>
            </form>
        </div>
    </div>
  );
};

export default ContactForm;
