import { useRef, useState, useEffect } from 'react';
import classes from "./CSVUpload.module.css";

function CSVUpload() {
  const fileholder = useRef();
  const [fileName, setFileName] = useState(''); // State to store the file name
  const [filePreview, setFilePreview] = useState(''); // State to store the CSV preview
  const [user, setUser] = useState({name: "name", email: "email"}); // State to store user data (name and email)

  // Fetch user info on component mount
  useEffect(() => {
    fetch("http://localhost:3000/user-info", {
      credentials: 'include', // Ensure cookies are sent for session info
    })
      .then(res => res.json())
      .then(data => {
        setUser(data); // Set the user info (name and email)
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
      setFileName(file.name); // Set the file name in state

      // Create a FileReader object to read the CSV file
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        setFilePreview(content); // Set the preview content in state
      };
      reader.readAsText(file); // Read the file as a text string
    }
  }

  function handleLogout() {
    fetch("http://localhost:3000/auth/google/logout", {
      credentials: 'include',
    })
      .then(() => {
        window.location.href = "/"; // Redirect to the homepage after logout
      })
      .catch(err => console.error(err));
  }

  return (
    <div className={classes.container}>
      <h2>Upload Your CSV</h2>  
      
      {/* Show user info */}
      {user && (
        <div className={classes.userInfo}>
          <p>Welcome, {user.name} ({user.email})</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      <form>
        <input 
          ref={fileholder} 
          type="file" 
          accept=".csv" 
          onChange={fileSelectedHandler} 
        />
        <button onClick={filehandler}>Choose File</button>
        <br /><br />
        {fileName && <p className={classes.fileName}>Selected File: {fileName}</p>} {/* Display file name */}
        <button type="submit">Upload</button>
      </form>
      
      {/* Display a preview of the CSV contents */}
      {filePreview && (
        <div className={classes.preview}>
          <h3>CSV Preview:</h3>
          <pre>{filePreview}</pre> {/* Show the content in a <pre> tag */}
        </div>
      )}
    </div>
  );
}

export default CSVUpload;
