import HomepageFeatures from "./components/HomepageFeatures";
import HomepageHero from "./components/HomepageHero";
import classes from "./App.module.css";
import HomepageHIW from "./components/HomepageHIW";
import HomepageFooter from "./components/HomepageFooter";

function App() {
  return (
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
  );
}

export default App;
