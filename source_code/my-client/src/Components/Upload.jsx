import React, {useState, useEffect} from 'react';
import axios from 'axios';


const Upload = (props) => {

  const [authed, setAuthed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [resMsg, setResMsg] = useState("")
  const [fail, setFail] = useState(false)
  const [updateStatusChecked, setUpdateStatusChecked] = useState(false); // Default value false: If true, deletes motd status

  // Auth user when accessing page
  // Look into why it runs twice
  useEffect(() => {
    if (loading)
    {
      axios.post(`${props.host}/authAdmin`, {id: localStorage.getItem('id')})
      .then((res) => {
        // Success
        setAuthed(true)
        setLoading(false)

      })
      .catch((res) => {
        // Unauthorized, probably
        setAuthed(false)
        setLoading(false)
      })

    }
    

  }, [props.host, loading])



  const sendOTP = () => {
    // When accessed, send otp (if its my id)
    axios.post(`${props.host}/sendOTP`, {id: localStorage.getItem('id')})
    
  }

  


  const handleUpload = async (event) => {
    try {

        event.preventDefault();

        // Access form fields using event.target.elements
        const otp = event.target.elements.otp.value;
        const file = event.target.elements.file.files[0]; 
        const msg = event.target.elements.msg.value;
        const status = updateStatusChecked


        const formData = new FormData();
        formData.append('file', file); // What did they upload
        formData.append('msg', msg); // What did they upload
        formData.append('otp', otp); // What did they upload
        formData.append('id', localStorage.getItem('id')) // Who uploaded
        formData.append('status', status); // What did they upload

        await axios.post(`${props.host}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => {
          setSuccess(true)
          setFail(false)
          setResMsg(res.data)
          
  

        })
        .catch((res) => {
          setFail(true)
          setSuccess(false)
          setResMsg(res.response.data)
          

        })

        
      
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const formStyle = {
    textAlign: 'center',
    maxWidth: '400px',
    padding: '10px',
    border: '1px solid gray',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    margin: '0 auto', 
  };

  const labelStyle = {
    display: 'block',
    margin: '10px 0',
    color: 'gray',
  };

  const inputStyle = {
    padding: '8px',
    margin: '5px 0 15px',
    color: 'gray',
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px 20px',
    margin: '10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1em',
  };

  const checkboxStyle = {
    marginLeft: '5px',
  };

  if (loading)
  {

  }
  else
  {
    // Update response sent and recieved.
    if (fail || success)
    {
      console.log(fail, success, resMsg)
      return (
        <div style = {{
          display: 'flex', 
          padding: '10%', 
          alignItems: 'center',
          flexDirection: 'column',}}>
  
          <h1 style = {{color: 'rgb(92, 119, 226)'}}>{fail? "Oh no!": "Success!"}</h1>
          <p style = {{ color: 'gray'}}>{resMsg}</p>
        </div>
        )
    }
    

    else if (authed)
    {
      return (
        <div>
        <form onSubmit={handleUpload} style={formStyle}>
          <h1 style={{ color: 'rgb(92, 119, 226)' }}>Admin Portal</h1>
          <label htmlFor="file" style={labelStyle}>
            Upload Binaries:
          </label>
          <input  type="file" name="file" id="file" style={inputStyle} />
          <br />
        

        
        <label htmlFor="updateStatus" style={labelStyle}>
          Status:
        </label>
        <input type="text" name="msg" id="msg" style={inputStyle} />

        <label htmlFor="clearStatus" style={{ color: 'gray', marginLeft: '5px' }}>
            Clear Status:
          </label>
          <input
          type="checkbox"
          name="clearStatus"
          id="clearStatus"
          defaultChecked={updateStatusChecked}
          style={checkboxStyle}
          onChange={() => setUpdateStatusChecked(!updateStatusChecked)}
        />

          <br />
          <label htmlFor="otp" style={labelStyle}>
            OTP:
          </label>
          <input type="text" name="otp" id="otp" required style={inputStyle} />
          <br />
          <button onClick= {sendOTP} style={buttonStyle}>
            Send OTP
          </button>

          <button type="submit" style={buttonStyle}>
            Upload
          </button>
          
        </form>

        </div>
      );

    }
    else
    {
      return (<>Unauthorized</>)
    }
  
  }
};

export default Upload;
