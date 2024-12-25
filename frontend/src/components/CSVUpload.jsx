import { useRef, useState } from 'react';
import classes from "./CSVUpload.module.css";

function CSVUpload() {
  const fileholder = useRef();
  const [fileName, setFileName] = useState(''); // State to store the file name
  const [filePreview, setFilePreview] = useState(''); // State to store the CSV preview

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

  return (
    <div className={classes.container}>
      <h2>Upload Your CSV</h2>  
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
