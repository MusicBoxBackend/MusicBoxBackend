import axios from 'axios';
import React, { useState, useEffect } from "react";

const Welcome = (props) => {

    const [buyLink, setBuyLink] = useState("")
    const [videoLink, setVideoLink] = useState("")

    const [motd, setMotd] = useState("");
    const [loaded, setLoaded] = useState(false)
    const [info1body, setInfo1Body] = useState("");
    const [info1title, setInfo1Title] = useState("");

    const [info2body, setInfo2Body] = useState("");
    const [info2title, setInfo2Title] = useState("");

    const [info3body, setInfo3Body] = useState("");
    const [info3title, setInfo3Title] = useState("");
    

    useEffect(() => {
      if (!loaded) {
        // See if we have the info in session cookies
        let content = JSON.parse(sessionStorage.getItem('content'));

        // If the value has not been set, fetch it and store it
        if (content === null || content === undefined) {
          axios.get(`${props.host}/getMotd`)
              .then((res) => {
                  setLoaded(true);
                  content = res.data;

                  // Store the content in localStorage
                  sessionStorage.setItem('content', JSON.stringify(content))

                  // Store the content in state
                  
                  // Set motd
                  setMotd(content['motd']);

                  // Set info boxes
                  setInfo1Body(content['info_1'].substring(content['info_1'].indexOf("|") + 1, content['info_1'].length));
                  setInfo1Title(content['info_1'].substring(0, content['info_1'].indexOf("|")));

                  setInfo2Body(content['info_2'].substring(content['info_2'].indexOf("|") + 1, content['info_2'].length));
                  setInfo2Title(content['info_2'].substring(0, content['info_2'].indexOf("|")));

                  setInfo3Body(content['info_3'].substring(content['info_3'].indexOf("|") + 1, content['info_3'].length));
                  setInfo3Title(content['info_3'].substring(0, content['info_3'].indexOf("|")));

                  // Set the buy link
                  setBuyLink(content['buy_link'])

                  // Set the video link
                  setVideoLink(content['video_link'])
                  

              })
              .catch((e) => {
                  console.log(e);
                  return;
              });
        } // End fetch when not set

        else // I already had the content stored locally! So set the state
        {
          // Set motd
          setMotd(content['motd']);

          // Set info boxes
          setInfo1Body(content['info_1'].substring(content['info_1'].indexOf("|") + 1, content['info_1'].length));
          setInfo1Title(content['info_1'].substring(0, content['info_1'].indexOf("|")));

          setInfo2Body(content['info_2'].substring(content['info_2'].indexOf("|") + 1, content['info_2'].length));
          setInfo2Title(content['info_2'].substring(0, content['info_2'].indexOf("|")));

          setInfo3Body(content['info_3'].substring(content['info_3'].indexOf("|") + 1, content['info_3'].length));
          setInfo3Title(content['info_3'].substring(0, content['info_3'].indexOf("|")));

          // Set the buy link
          setBuyLink(content['buy_link'])

          setLoaded(true);
        }
        

        
      }
  }, [loaded, props.host]);
    
    

    
    const containerStyle = {
        paddingTop: '40px',
        textAlign: 'center',
        fontFamily: 'Comic Sans MS', // Use a nice font
      };
    
      
    
    
    
      const messageOfTheDayStyle = {
        fontSize: '18px',
        fontStyle: 'italic',
        padding: '10px',
        marginBottom: '20px',
        border: '1px solid #ccc', // Border style
        backgroundColor: '#f8f3b3', // Background color
        textAlign: 'center'
        
      };


      const boxTitleStyle = {
        color: 'rgb(92, 119, 226)',
        marginTop: '15%',
      }
    
      const borderStyle = {
        flex: 1,
        border: '1px solid gray',
        borderRadius: '10px',
        padding: '10px',
        height: '240px',
        color: '#bebebe',
        fontSize: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };

      const infoSectioStyle = {
        flex: 1,
        marginLeft: '20px',
        marginRight: '20px',
      };
    
    
      return (
        <div>
          {motd && <div style={messageOfTheDayStyle}>{motd}</div>}
    
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div>
              <img class = "box-icon" src="icon.png"  alt="product" />
            </div>
    
            <div style={containerStyle}>
              <div class = "titleStyle">MUSIC BOX</div>
              <div class="sloganStyle">Playlists made easier than ever.</div>
            </div>
          </div>

          <div class = "borderSectionStyle">
            <div style = {infoSectioStyle}>
              <p style = {boxTitleStyle}>{info1title}</p>
              <div style={borderStyle}>{info1body}</div>
            </div>
            
            <div style = {infoSectioStyle}>
              <p style = {boxTitleStyle}>{info2title}</p>
              <div style={borderStyle}>{info2body}</div>
            </div>

            <div style = {infoSectioStyle}>
              <p style = {boxTitleStyle}>{info3title}</p>
              <div style={borderStyle}>{info3body}</div>
            </div>
          </div>

        <div style = {{justifyContent: 'center', display: 'flex'}}>
          <button style = {{color: 'white', width: "120px", height: "40px", padding: 0, margin: '10px'}} type="button" className="oval-button" onClick = {() => {window.open(videoLink, '_blank')}}>Watch Demo</button>
          <button style = {{color: 'white', width: "120px", height: "40px", padding: 0, margin: '10px'}} type="button" className="oval-button" onClick = {() => {window.open(buyLink, '_blank')}}>Buy now!</button>
        </div>

        </div>
      );
    
}


export default Welcome;