import { useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import classes from './Sendemails.module.css';
import EmailssentModal from './EmailssentModal';
import 'dialog-polyfill/dialog-polyfill.css';
import dialogPolyfill from 'dialog-polyfill';
import Header from './Header';

function Sendemails() {
  const location = useLocation();
  const { headers } = location.state || {}; // Access headers from state
  const [subject, setSubject] = useState('');
  const [emailField, setEmailField] = useState(''); // Capture email field
  const [template, setTemplate] = useState('');
  const [cc, setCc] = useState(''); // Capture CC field
  const [bcc, setBcc] = useState(''); // Capture BCC field
  const [emailsSent, setEmailsSent] = useState(null); // New state for number of emails sent
  const dialog = useRef();

  useEffect(() => {
    if (dialog.current) {
      if (!dialog.current.showModal) {
        dialogPolyfill.registerDialog(dialog.current);
      }
    }
  }, []); // Ensure polyfill is applied after the component is mounted

  const handleSubmit = (e) => {
    e.preventDefault();

    // Post subject, template, emailField, cc, and bcc to backend
    fetch('http://localhost:3000/sendmailtemplate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies for authentication
      body: JSON.stringify({ subject, template, emailField, cc, bcc }), // Send cc and bcc fields as well
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error sending emails');
        }
        return res.json();
      })
      .then((data) => {
        setEmailsSent(data.emailsSent); // Store the number of emails sent
        if (dialog.current) {
          dialog.current.showModal();
        }
        // Clear form fields after successful submission
        setSubject('');
        setEmailField('');
        setTemplate('');
        setCc(''); // Clear CC field
        setBcc(''); // Clear BCC field
      })
      .catch((err) => {
        alert(err.message); // Error message
      });
  };

  return (
    <>
      <Header ishomepage={false} />
      <EmailssentModal ref={dialog} noofemails={emailsSent} /> {/* Pass emailsSent to modal */}
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
