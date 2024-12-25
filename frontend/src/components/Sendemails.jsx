import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import classes from './Sendemails.module.css';

function Sendemails() {
  const location = useLocation();
  const { headers } = location.state || {}; // Access headers from state
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Post subject and template to backend
    fetch('http://localhost:3000/sendmailtemplate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send cookies for authentication
      body: JSON.stringify({ subject, template }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error); // Show validation error
        } else {
          alert('Emails sent successfully!');
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className={classes.container}>
      <h2 className={classes.title}>Customize Your Email Template</h2>
      {headers ? (
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
  );
}

export default Sendemails;
