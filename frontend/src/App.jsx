import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomepageFeatures from "./components/HomepageFeatures";
import HomepageHero from "./components/HomepageHero";
import HomepageHIW from "./components/HomepageHIW";
import HomepageFooter from "./components/HomepageFooter";
import CSVUpload from "./components/CSVUpload"; // Import the CSV upload component
import classes from "./App.module.css";

function App() {
  return (
    <Router>
      <Routes>
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
        <Route path="/upload-csv" element={<CSVUpload />} />
      </Routes>
    </Router>
  );
}

export default App;
