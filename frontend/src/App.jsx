import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomepageFeatures from "./components/HomepageFeatures";
import HomepageHero from "./components/HomepageHero";
import HomepageHIW from "./components/HomepageHIW";
import HomepageFooter from "./components/HomepageFooter";
import CSVUpload from "./components/CSVUpload";
import Sendemails from './components/Sendemails'; // Import Sendemails component
import classes from "./App.module.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage Route */}
        <Route
          path="/"
          element={
            <>
              <div className={classes.homepage}>
                <HomepageHero />
              </div>
              <div className={classes.features}>
                <HomepageFeatures />
              </div>
              <HomepageHIW />
              <HomepageFooter />
            </>
          }
        />
        
        {/* CSV Upload Route */}
        <Route path="/upload-csv" element={<CSVUpload />} />
        
        {/* Send Emails Route */}
        <Route path="/send-emails" element={<Sendemails />} />
      </Routes>
    </Router>
  );
}

export default App;
