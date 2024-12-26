import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import classes from "./CSVUpload.module.css";
import Header from './Header';

function CSVUpload() {
  const fileholder = useRef();
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [user, setUser] = useState({name: "name", email: "email"});
  const navigate = useNavigate(); // Use navigate for routing

  // Fetch user info on component mount
  useEffect(() => {
    fetch("http://localhost:3000/user-info", {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
      })
      .catch(err => console.error(err));
  }, []);

  function filehandler(event) {
    event.preventDefault();
    fileholder.current.click();
  }

  function fileSelectedHandler(event) {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        setFilePreview(content);
      };
      reader.readAsText(file);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    
    const file = fileholder.current.files[0];
    if (!file) return; // If no file, do nothing

    const formData = new FormData();
    formData.append('file', file); // Append the file to formData

    // Send the file to the backend /sendmail route
    fetch("http://localhost:3000/sendmail", {
      method: "POST",
      body: formData,
      credentials: 'include' // Ensure cookies are sent
    })
    .then(res => res.json())
    .then(data => {
      // After successful response, navigate to Sendemails component with headers
      navigate('/send-emails', { state: { headers: data.headers } });
    })
    .catch(err => console.error(err));
  }

  function handleLogout() {
    fetch("http://localhost:3000/auth/google/logout", {
      credentials: 'include',
    })
      .then(() => {
        window.location.href = "/";
      })
      .catch(err => console.error(err));
  }

  return (
    <>
      <Header ishomepage={false}/>
      <div className={classes.container}>
        <h2>Upload Your CSV</h2>
        
        {user && (
          <div className={classes.userInfo}>
            <p>Welcome, {user.name} ({user.email})</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <input 
            ref={fileholder} 
            type="file" 
            accept=".csv" 
            onChange={fileSelectedHandler} 
            />
          <button onClick={filehandler}>Choose File</button>
          <br /><br />
          {fileName && <p className={classes.fileName}>Selected File: {fileName}</p>}
          <button type="submit">Upload</button>
        </form>
        
        {filePreview && (
          <div className={classes.preview}>
            <h3>CSV Preview:</h3>
            <pre>{filePreview}</pre>
          </div>
        )}
      </div>
    </>
  );
}

export default CSVUpload;
