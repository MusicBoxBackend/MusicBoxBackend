import axios from 'axios';
import React, { useState} from "react";

const Welcome = (props) => {

    const [motd, setMotd] = useState("");

    // Load motd
    axios.get(`${props.host}/getMotd`)
    .then((res) => {
        let content = res.data
        setMotd(content)
    })
    .catch((e) => {
        console.log(e)
    })
    

    
    const containerStyle = {
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'Comic Sans MS', // Use a nice font
        height: '100vh'
      };
    
      const titleStyle = {
        fontSize: '80px',
        marginBottom: '10px',
        color: 'rgb(92, 119, 226)'
      };
    
      const sloganStyle = {
        fontSize: '20px',
        color: '#666', // A subdued color for the slogan
        marginBottom: '20px',
      };
    
      const messageOfTheDayStyle = {
        fontSize: '18px',
        fontStyle: 'italic',
        padding: '10px',
        border: '1px solid #ccc', // Border style
        backgroundColor: '#f8f3b3', // Background color
        bottom: '0'
        
      };
    
    
      return (
        <div style={containerStyle}>
            {motd && (
            <div style={messageOfTheDayStyle}>
            {motd}
            </div>
        )}
          <div style={titleStyle}>MUSIC BOX</div>
          <div style={sloganStyle}>Playlists made easier than ever.</div>
          
        </div>
      );
    
}


export default Welcome;