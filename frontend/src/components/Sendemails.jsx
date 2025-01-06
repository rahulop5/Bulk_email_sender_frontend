import { useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import classes from './Sendemails.module.css';
import EmailssentModal from './EmailssentModal';
import 'dialog-polyfill/dialog-polyfill.css';
import dialogPolyfill from 'dialog-polyfill';
import Header from './Header';

function Sendemails() {
  const location = useLocation();
  const { headers } = location.state || {};
  const [subject, setSubject] = useState('');
  const [emailField, setEmailField] = useState('');
  const [template, setTemplate] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [emailsSent, setEmailsSent] = useState(null);
  const fileInputRef = useRef(null);
  const dialog = useRef();

  useEffect(() => {
    if (dialog.current) {
      if (!dialog.current.showModal) {
        dialogPolyfill.registerDialog(dialog.current);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files)); // Store selected files
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('template', template);
    formData.append('emailField', emailField);
    attachments.forEach((file) => formData.append('attachments', file)); // Add files to FormData

    fetch('http://localhost:3000/sendmailtemplate', {
      method: 'POST',
      credentials: 'include',
      body: formData, // Send as multipart/form-data
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error sending emails');
        }
        return res.json();
      })
      .then((data) => {
        setEmailsSent(data.emailsSent);
        if (dialog.current) {
          dialog.current.showModal();
        }
        setSubject('');
        setEmailField('');
        setTemplate('');
        setAttachments([]); // Clear attachments
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  function handleFieldButtonPress(event) {
    const field = event.target.innerText; // Get the field from the button (e.g., {{name}})
    
    // Get the current position of the cursor in the textarea
    const textarea = document.querySelector('textarea[name="template"]');
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
  
    // Insert the field at the cursor position
    const newTemplate =
      template.substring(0, startPos) + field + template.substring(endPos);
  
    // Update the template state with the new value
    setTemplate(newTemplate);
  
    // Move the cursor to the end of the inserted field
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + field.length;
      textarea.focus(); // Focus back on the textarea
    }, 0);
  }
  

  return (
    <>
      <Header ishomepage={false} />
      <EmailssentModal ref={dialog} noofemails={emailsSent} />
      <div className={classes.container}>
        <h2 className={classes.title}>Customize Your Email</h2>
        {headers && headers.length > 0 ? (
          <div>
            <h3 className={classes.subTitle}>Available CSV Fields:</h3>
            <ul className={classes.fieldsList}>
              {headers.map((header, index) => (
                <li key={index}>
                  <button className={classes.fieldItem} onClick={handleFieldButtonPress}>{`{{${header}}}`}</button>
                </li>
              ))}
            </ul>

            <form className={classes.templateForm} onSubmit={handleSubmit}>
              <label className={classes.formLabel}>
                Email Subject (use {`{{field}}`} format):
              </label>
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={classes.inputField}
                  required
                />

              <label className={classes.formLabel}>
                Email header name (CSV field for email address):
              </label>
                <input
                  type="text"
                  name="emailField"
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  className={classes.inputField}
                  required
                />

              <label className={classes.formLabel}>
                Attachments (optional):
                <input
                  type="file"
                  name="attachments"
                  multiple
                  onChange={handleFileChange}
                  ref={(input) => (fileInputRef.current = input)} // Reference to the hidden input
                  style={{ display: 'none' }} // Hide the input
                  />
                <button
                  type="button"
                  className={classes.fileButton}
                  onClick={() => fileInputRef.current.click()} // Trigger file input when clicked
                  >
                  Select Attachments
                </button>
              </label>

              {attachments.length > 0 && (
                <div className={classes.fileNames}>
                  <h4>Selected Attachments:</h4>
                  <ul>
                    {attachments.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <label className={classes.formLabel}>
                Email Body (use {`{{field}}`} format):
              </label>
                <textarea
                  name="template"
                  rows="10"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className={classes.textareaField}
                  placeholder="Write your email template using the above fields, e.g., 'Hello {{name}}, you scored {{marks}} marks.'"
                  required
                />

              <button type="submit" className={classes.submitButton}>
                Send Emails
              </button>
            </form>
          </div>
        ) : (
          <p>No headers available. Please upload a valid CSV file.</p>
        )}
      </div>
    </>
  );
}

export default Sendemails;
