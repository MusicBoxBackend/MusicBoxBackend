var express = require('express');
const https = require('https');
var router = express.Router();
const multer = require("multer");
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const axios = require('axios')
const cron = require('node-cron');
// const { Dropbox } = require('dropbox');

// let fetch; // Placeholder for fetch
// let dbxToken
// let dbx

// for dropbox 
// (async () => {
//   fetch = (await import('node-fetch')).default; // Dynamically import node-fetch
// })();



//Backend routes (endpoints)
const host = process.env.BASE_URL
router.use(express.static(path.join(__dirname, '../public')));


let latest;
  
const urlToPing = process.env.PING_URL;
 
const pingUrl = () => {
  axios.get(urlToPing)
    .then((res) => {
      latest = res.data
      console.log(latest)
      
    })
    .catch((error) => {
      setTimeout(pingUrl, 2000); // Retry after 2 seconds
    });
};

cron.schedule('*/4 * * * *', pingUrl);
pingUrl();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Ensure alive
router.get('/ping', async(req, res) => {
  res.json(Date.now())
})



var mongoose = require('mongoose');
const uri = process.env.MONGO_URI //atlas
var content_db
//const uri = 'mongodb://mongo:27017' //local (docker service)

async function connect(){
  try {
    await mongoose.connect(uri)
    content_db = mongoose.connection.collection('content');
    console.log("Connected to mongoDB")
    

  }
  catch(error){
    console.log(error)
  }
}


connect();

// Set up DB!
// User schema for DB
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true, // Enforces uniqueness
    required: true // Makes the field mandatory
  },
  password: {
    type: String,
    required: true
  },
  refresh_token: String,
  admin: Boolean
});
// Compile schema to a Model
const User = mongoose.model('User', userSchema);

//API endpoints

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: './uploads',
  filename: function (req, file, cb) {
    const fileName = 'firmware.bin'; // Set a fixed file name (to overwrite binaries)
    cb(null, fileName);
  }
});

// Image reception handling
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public');
  },
  filename: (req, file, cb) => {
    cb(null, 'resume_temp.pdf'); 
  },
});

const uploadResume = multer({ storage: resumeStorage });

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "png" || file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Please upload an image"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const binaryupload = multer({
  storage: storage
});

// NODE MAILER
// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

// Unlink a user's spotify and musicbox account
router.post('/unlink', async(req,res) => {
  const id = req.body.id
  const user = await User.findOne({'_id': id});
  if (user)
  {
    user.refresh_token = ""
    await user.save()
    res.send("Unlinked!")

  }
  else
  {
    //404 user not found
    res.status(404).send("User not found")
  }
})

// Get whether or not a user has linked their spotify given uid
router.post('/isLinked', async(req, res) => {
  const id = req.body.id
  const user = await User.findOne({'_id': id});
  if (user)
  {
    res.send(user.refresh_token? true : false)

  }
  else
  {
    //404 user not found
    res.status(404).send("User not found")
  }
})

// From ESP, get the certificate so we can serve OTA updates
router.post('/certificate', (req, res) => {
  // Where are our downloads hosted?
  // let src = "https://musicbox-backend-178z.onrender.com/"
  // let src = "https://www.dropbox.com/scl/fi"

  let src = req.body.link // get certificate of provided source



  // Make a GET request to the website
  const reqHttps = https.get(src, (response) => {
    // Extract the certificate from the response
    try
    {
      const certificate = response.socket.getPeerCertificate(true).issuerCertificate.issuerCertificate;
      const cert = certificate.raw.toString('base64');
      let pem = "-----BEGIN CERTIFICATE-----\n";
      
      for (let i = 0; i < cert.length; i += 64) {
          pem += cert.slice(i, i + 64) + '\n';
      }
      pem += "-----END CERTIFICATE-----\n";

      // Write PEM string to cert.txt, overriding if it exists, creating it if it doesn't
      fs.writeFileSync('cert.txt', pem);
      
      // Send PEM string as response
      res.set('Content-Type', 'text/plain');
      res.send(pem);
    }
    catch
    {
      // If certificate is not valid, load the contents of cert.txt to PEM string
      const pem = fs.readFileSync('cert.txt', 'utf8');
      
      // Send PEM string from file as response
      res.set('Content-Type', 'text/plain');
      res.send(pem);
    }
    
});

  reqHttps.on('error', (err) => {
      console.error(`Error: ${err.message}`);
      res.status(500).send('Internal Server Error');
  });
});

// From ESP, get the refresh token from DB 
router.post('/authorize_musicbox', async(req,res) => {
  const username = req.body.username;
  const pass = req.body.pass

  // bcrypt compare
  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (user) {
      // Compare the provided password with the stored hashed password
      bcrypt.compare(pass, user.password).then((resl) => {
        if (resl) {
          // Insure the authenticated user has linked their spotify
          if (user.refresh_token)
          {
            // Passwords match, return the refresh_token
            res.send(user.refresh_token)
          }
          else
          {
            // User has not yet linked spotify
            res.status(202).send("User has not linked Spotify!")
          }
          
        } else {
          // Passwords don't match
          res.status(401).send("Unauthorized")
        }

      })

      
    } else {
      // User not found
      res.status(404).send("User not found")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send("500 Server error")
  }
})

// Login with spotify
router.get('/auth-callback', async(req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  if (!state)
  {
    res.status(400).send("Bad Request")
  }
  const split = state.indexOf('uid')

  const redir = state.substring(0, split)
  const uid = state.substring(split + 3, state.length)
  
    if (code && state) {
      const response = await axios.post('https://accounts.spotify.com/api/token', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: process.env.SPOTIFY_CLIENT,
          redirect_uri: `${host}/auth-callback`
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: process.env.SPOTIFY_CLIENT,
          password: process.env.SPOTIFY_SECRET, // Replace with your actual client secret
        },
      });
      // We don't need to store the access token, because it only lasts an hour
      const refreshToken = response.data.refresh_token;
      User.findOneAndUpdate({'_id': uid}, {'refresh_token': refreshToken})
      .then((user) => {
        console.log (user)
      })

      res.redirect(redir+"?state=success")

      // Store the access token (e.g., in state or a context)
      // Redirect or perform other actions as needed
    } else {
      res.redirect(redir+"?state=fail")
    }
      
})

// Download resume
router.get('/download/resume', (req, res) => {
  const filePath = path.join(__dirname, '../public/resume_peter_buonaiuto.pdf');
  res.download(filePath);
});

// Find project by url
router.get('/findProject/:id', (req, res) => {

  Project.findOne({ searchtitle: { $regex: new RegExp(req.params.id.toLowerCase(), 'i') } })
  .then((foundDocument) => {
    res.json(foundDocument)
  })
  .catch((error) => {
    console.error(error);
  });

})

// Get data to display on webpage
router.get('/getMotd', (req, res) => {
  

  // Query the database to find relevant items
  content_db.find({}).toArray()
  .then(data => {
    res.status(200)
    res.json(data[0])
  })
  .catch(error => {
    console.error(error);
    
    res.status(500)
    res.json("Error loading content")
  });


})

// to refresh dbx access tokens
// used when getting a 401 error
// const getNewAccessToken = async () => {
//   try {
//     const response = await axios.post('https://api.dropbox.com/oauth2/token', null, {
//       params: {
//         grant_type: 'refresh_token',
//         refresh_token: process.env.DROPBOX_REFRESH_TOKEN,
//         client_id: process.env.DROPBOX_CLIENT_ID,
//         client_secret: process.env.DROPBOX_CLIENT_SECRET
//       },
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });

//     dbxToken = response.data.access_token;
//     dbx = new Dropbox({
//       accessToken: dbxToken,
//       fetch: fetch,
//     });

//   } catch (error) {
//     console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
//     throw error;
//   }
// };

// (async () => {
//   await getNewAccessToken() // generate the first token
// })();


// DEPRECATED: not using dropbox. Don't need this link because github link is persistent
// const createSharedLink = async (filePath) => {
//   const url = 'https://api.dropboxapi.com/2/sharing/create_shared_link';

//   const headers = {
//     'Authorization': `Bearer ${dbxToken}`,
//     'Content-Type': 'application/json',
//   };

//   const data = {
//     path: filePath
//   };

//   try {
//     const response = await axios.post(url, data, { headers });

//     // Extract the URL from the response
//     const sharedLink = response.data.url;
//     // Modify the link to ensure it's a direct download link
//     const directDownloadLink = sharedLink.replace('dl=0', 'dl=1');

//     return directDownloadLink
//   } catch (error) {
//     //console.error('Error creating shared link:', error.response ? error.response.data : error.message);
//   }
// };


// Read the current version
router.get('/version', async (req,res) => {

  // Using FS ... * deprecated because FS was not persistant on Render

  //const version_str = fs.readFileSync('version.txt', 'utf-8');
  //res.send(version_str)


  // Using DB (currently more reliable for persistance)

  // DEPRECATED: Using github instead of dropbox. Link is persistent.

  // Get the download link for the latest version

  // let link = await createSharedLink("/latest.bin");
  // if (!link)
  // {
  //   // need to refresh access token, try again
  //   await getNewAccessToken()
  //   link = await createSharedLink("/latest.bin");
  // }


    content_db.find({}).toArray()
    .then(data => {
      const v = String(data[0].version)
      res.send({'version': v, 'link': process.env.FIRMWARE_URL}) // Res must send a string or object
    })
  
})

// Generate OTP when page is accessed
router.post('/sendOTP', (req, res) => {
  const id = req.body.id
  if (id == process.env.SECRET)
  {
    // Generate 2fa code and send to me
  const code = generateRandomPassword(50)
  fs.writeFileSync('2fa.txt', code)

  // Email
  const mailOptions = {
      from: process.env.MAILER_USER,
      to: process.env.MAILER_DEST,
      subject: 'MUSICBOX Binary Upload',
      text: `Code: ${code}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
      console.log('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send the email' });
      } else {
      res.status(200).json({ message: 'Email sent successfully' });
      }
  });

  res.status(200).send("Success");

  }
  else{
    // Unauthorized
    res.status(401).send("Unauthorized")
  }
      
  
  
});

// Check if the current user is an admin
router.post('/authAdmin', (req, res) => {
  const id = req.body.id
  if (id == process.env.SECRET)
  {
  res.status(200).send("Authenticated");

  }
  else{
    // Unauthorized
    res.status(401).send("Unauthorized")
  }
      
  
  
});

function generateRandomPassword(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}



// Handle file upload with password
router.post('/upload', binaryupload.single('file'), async (req, res) => {
  const { file, msg, otp, id, status } = req.body;
  let OTP_stored = "";
  let response = "";
  const filePath = path.join(__dirname, '../uploads/firmware.bin');

  async function updateDatabaseVersion() {
    return new Promise((resolve, reject) => {
      // Increase the version using the database
      content_db.findOneAndUpdate(
        {},
        { $inc: { version: 1 } },
        { new: true }, // Return the updated document
        (err, updatedDoc) => {
          if (err) {
            console.error('Error updating version:', err);
            reject(err);
          } else {
            console.log('Uploaded version', updatedDoc.value.version + 1);
            response += `uploaded version ${updatedDoc.value.version + 1}\n`;
            resolve();
          }
        }
      );
    });
  }

  try {
    OTP_stored = fs.readFileSync('2fa.txt', 'utf-8');
  } catch {
    // OTP error
    return res.status(401).send("401 OTP not generated");
  }

  fs.unlink('2fa.txt', (err) => {
    if (err) {
      console.error('Error deleting 2fa.txt:', err);
    }
  });

  // Check 2fa and user id
  if (id == process.env.SECRET && OTP_stored == otp) {
    try {
      if (file !== 'undefined') {
        const owner = 'MusicBoxApplication';
        const repo = 'firmware';
        const branch = 'main';
        const token = process.env.FIRMWARE_PAT;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${'firmware.bin'}`;
        let sha

        // Read the file content
        const content = fs.readFileSync(filePath, 'base64');

        // Get the sha of the previous binary
        // note this will fail if the github does not have a binary, but it always should.
        await content_db.find({}).toArray()
        .then(data => {
          sha = String(data[0].sha)
        })

        // Create the API request payload
        const data = {
          message: 'Upload file via API',
          content: content,
          branch: branch,
          sha: sha
        };

        // Send the API request
        axios.put(apiUrl, data, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        .then(async response => {
          //console.log('File uploaded successfully:', response.data);

          // store the SHA 
          await content_db.updateOne({}, { $set: { sha: response.data.content.sha} });
          
        })
        .catch(error => {
          console.error('Error uploading file:', error.response ? error.response.data : error.message);
          return res.status(500).send(error.response ? error.response.data : error.message);
        });

        // Old method: dropbox: encryption was too strong!

        // const contents = fs.readFileSync(filePath);

        // try {
        //   await dbx.filesUpload({
        //     path: '/latest.bin',
        //     contents: contents,
        //     mode: 'overwrite',
        //   });
        // } catch (error) {
        //   console.error('Error uploading to Dropbox:', error);
        //   await getNewAccessToken();
        //   await dbx.filesUpload({
        //     path: '/latest.bin',
        //     contents: contents,
        //     mode: 'overwrite',
        //   });
        // }

        await updateDatabaseVersion();
      }

      // Updating motd
      if (status === "true") {
        await content_db.updateOne({}, { $set: { motd: "" } });
        response += "MOTD cleared.\n";
      }

      if (msg) {
        await content_db.updateOne({}, { $set: { motd: msg } });
        response += `Successfully set motd to ${msg}\n`;
      }
      res.status(200).send(response);

    } catch (err) {
      console.error('Error processing request:', err);
      res.status(500).send('Internal Server Error');
    }

  } else {
    // Credentials incorrect, reject the upload
    return res.status(401).send('401 Unauthorized');
  }

  // Remove the temporary upload. It lives in Dropbox or has been rejected now.
  // Delete the file from the local filesystem
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting local file:', err);
  });
});

// Serve files
router.use('/uploads', express.static('uploads'));

// Route to handle email sending
router.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  // Email message options
  const mailOptions = {
    from: process.env.MAILER_USER,
    to: process.env.MAILER_DEST,
    subject: 'New Message from Contact Form',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send the email' });
    } else {
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});

router.post('/login', login);

function login(req, res)
{
  User.find({'username': req.body.username})
  .then(function(value) {
    if (value.length === 1)
    {
      bcrypt.compare(req.body.password, value[0].password, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          res.status(500)
          res.json({'authenticated': false})
        } else if (result) {
          res.json({'authenticated': true, 'username': value[0].username, 'admin': value[0].admin, 'id': value[0]._id})
        } else {
          res.status(401)
          res.json({'authenticated': false})
        }
      });
      
    }
    else
    {
    res.json({'authenticated': false})
  }
    
    
  }) 
  
}

router.post('/signup', signup);

function signup(req, res)
{
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) {
      res.status(500)
      res.json("Could not hash password")
    } else {

      const newUser = new User({'username': req.body.username, 'password': hashedPassword, 'admin': false})
      newUser.save().then(function(value) 
      {
        // THIS IS THE RESPONSE THE CLIENT WILL GET!
        res.json({username: value.username, id: value._id}) 
      })
      
    }
  });
  
}

router.post('/update-account', updateAccount);

// Update this account username and password
function updateAccount(req, res)
{ // Authorize the user
  User.findOne({_id: req.body.id})
  .then(async (user) => {
    // Check the password against the hashed
    const authed = await bcrypt.compare(req.body.password, user.password);
    if (authed)
    {
      // Correct password

      // Check if we want to change to a new password (non empty new password fields)
      if (req.body.newpass1.length * req.body.newpass2.length)
      {
        // Check if theyre the same
        if (req.body.newpass1 === req.body.newpass2)
        {
          // Hash the new password
          bcrypt.hash(req.body.newpass1, 10, (err, hashedPassword) => {
            if (err) {

              // Error hashing password
              res.status(500).send("Could not hash password")
            }
            else // Password hash succeeded
            {

              // Apply the password change
              User.findOneAndUpdate({'_id': req.body.id}, {'password': hashedPassword})
              .then(function(value) 
              {
                if (!value)
                {
                  console.log("Penis 2")
                  res.status(400).send("Bad request")
                }
              })
              .catch(function(err) {
                console.error("Error during findOneAndUpdate:", err);
                res.status(500).send("Server error: " + err)
              });


            }
          })
          

        }
        else
        {
          // Passwords do not match
          res.status(400).send("Passwords do not match")
        }
      }

      // Check if we wanna change the username
      if (req.body.username && (req.body.username !== req.body.oldUsername))
      {
        
        // Apply the name change
        User.findOneAndUpdate({'_id': req.body.id}, {'username': req.body.username})
        .then(function(value) 
        {
          if (!value)
          {
            console.log("Penis 1")
            res.status(400).send("Bad request")
          }
        })
        .catch(function(err) {
          console.error("Error during findOneAndUpdate:", err);
          res.status(500).send("Server error: " + err)
        });
      }
    }
    else{
      // Incorrect password
      res.status(401).send("Incorrect Password")

    }
  })
  .catch((e) => {
    res.status(500).send("Server error: "+e)

  })
      

    
  
}


// given id get name
router.post('/get-name', getName)
async function getName(req, res)
{
  await User.findById(req.body.id)
  .then(function(value) {
    res.json({'username': value?.username})
  })
  .catch((result) => {
    // No id provided, usually when a user is logged out!
    res.json({'username': "ANONYMOUS"})
  })
}

router.post('/getUser', getUser)
function getUser(req, res)
{
  User.find({'username': req.body.username})
  .then(function(value) {
    let exists = (value.length === 1)
    res.json({'exists': exists})
  }) 
}



module.exports = router;
