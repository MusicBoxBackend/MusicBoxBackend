import React, {useState} from 'react';
import axios from 'axios';


const Upload = (props) => {

  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fail, setFail] = useState(false)

  // When accessed, send otp (if its my id)
  axios.post(`${props.host}/uploadEntry`, {id: sessionStorage.getItem('id')})
  .then((res) => {
    // Success
    setLoading(false)
    setAuthed(true)

  })
  .catch((res) => {
    // Unauthorized, probably
    setLoading(false)
    setAuthed(false)
  })


  const handleUpload = async (event) => {
    try {

        event.preventDefault();

        // Access form fields using event.target.elements
        const otp = event.target.elements.otp.value;
        const file = event.target.elements.file.files[0];


        const formData = new FormData();
        formData.append('file', file); // What did they upload
        formData.append('otp', otp); // What did they upload
        formData.append('id', sessionStorage.getItem('id')) // Who uploaded

        await axios.post(`${props.host}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => {
          setSuccess(true)

        })
        .catch((res) => {
          setFail(true)

        })

        
      
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const formStyle = {
    textAlign: 'center',
    maxWidth: '400px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    margin: '0 auto', 
  };

  const labelStyle = {
    display: 'block',
    margin: '10px 0',
    color: '#555',
  };

  const inputStyle = {
    padding: '8px',
    margin: '5px 0 15px',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1em',
  };

  if (loading)
  {
    //reurn nothing
  }
  else
  {
    if (success)
    {
      return ("succces")
    }
    else if (fail)
    {
      return ("fail")
    }

    else if (authed)
    {
      return (
        <form onSubmit={handleUpload} style={formStyle}>
          <h1 style={{ color: '#333' }}>Binary Upload</h1>
          <label htmlFor="file" style={labelStyle}>
            Choose a file:
          </label>
          <input type="file" name="file" id="file" required style={inputStyle} />
          <br />
          <label htmlFor="otp" style={labelStyle}>
            OTP:
          </label>
          <input type="text" name="otp" id="otp" required style={inputStyle} />
          <br />
          <button type="submit" style={buttonStyle}>
            Upload File
          </button>
        </form>
      );

    }
    else
    {
      return (<>Unauthorized</>)
    }
  }
  
};

export default Upload;
