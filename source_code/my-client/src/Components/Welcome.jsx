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
        paddingTop: '60px',
        textAlign: 'center',
        fontFamily: 'Comic Sans MS', // Use a nice font
      };
    
      const titleStyle = {
        fontSize: '3rem',
        marginBottom: '10px',
        color: 'rgb(92, 119, 226)'
      };
    
      const sloganStyle = {
        fontSize: '20px',
        color: 'gray',
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
          <div style = {{position: 'relative', left: '0px', paddingTop: '120px'}}>
            <img src = "icon.png" width = "150px" alt = "product"></img>
          </div>
          
        </div>
      );
    
}


export default Welcome;