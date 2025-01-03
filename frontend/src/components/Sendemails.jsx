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
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [emailsSent, setEmailsSent] = useState(null);
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
    formData.append('cc', cc);
    formData.append('bcc', bcc);
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
        setCc('');
        setBcc('');
        setAttachments([]); // Clear attachments
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <>
      <Header ishomepage={false} />
      <EmailssentModal ref={dialog} noofemails={emailsSent} />
      <div className={classes.container}>
        <h2 className={classes.title}>Customize Your Email Template</h2>
        {headers && headers.length > 0 ? (
          <div>
            <h3 className={classes.subTitle}>Available CSV Fields:</h3>
            <ul className={classes.fieldsList}>
              {headers.map((header, index) => (
                <li key={index} className={classes.fieldItem}>
                  {`{{${header}}}`}
                </li>
              ))}
            </ul>

            <form className={classes.templateForm} onSubmit={handleSubmit}>
              <label className={classes.formLabel}>
                Email Subject (use {`{{field}}`} format):
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={classes.inputField}
                  required
                />
              </label>

              <label className={classes.formLabel}>
                Email header name (CSV field for email address):
                <input
                  type="text"
                  name="emailField"
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  className={classes.inputField}
                  required
                />
              </label>

              <label className={classes.formLabel}>
                Email CC (optional):
                <input
                  type="text"
                  name="cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className={classes.inputField}
                  placeholder="Separate multiple emails with commas"
                />
              </label>

              <label className={classes.formLabel}>
                Email BCC (optional):
                <input
                  type="text"
                  name="bcc"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className={classes.inputField}
                  placeholder="Separate multiple emails with commas"
                />
              </label>

              <label className={classes.formLabel}>
                Attachments (optional):
                <input
                  type="file"
                  name="attachments"
                  multiple
                  onChange={handleFileChange}
                />
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
                Email Template (use {`{{field}}`} format):
                <textarea
                  name="template"
                  rows="10"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className={classes.textareaField}
                  placeholder="Write your email template using the above fields, e.g., 'Hello {{name}}, you scored {{marks}} marks.'"
                  required
                />
              </label>

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
