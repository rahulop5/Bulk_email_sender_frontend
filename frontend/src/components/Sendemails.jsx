import { useLocation } from 'react-router-dom';

function Sendemails() {
  const location = useLocation();
  const { headers } = location.state || {}; // Access headers from state

  return (
    <div>
      <h2>Customize Your Email Template</h2>
      {headers ? (
        <div>
          <h3>Available CSV Fields:</h3>
          <ul>
            {headers.map((header, index) => (
              <li key={index}>{header}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No headers available.</p>
      )}
    </div>
  );
}

export default Sendemails;
