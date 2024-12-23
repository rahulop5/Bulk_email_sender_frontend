import HomepageFeatures from "./components/HomepageFeatures";
import HomepageHero from "./components/HomepageHero";
import classes from "./App.module.css";

function App() {
  return (
    <>
      <div className={classes.homepage}>
        <HomepageHero />
      </div>
      <div className={classes.features}>
        <HomepageFeatures />
      </div>
    </>
  );
}

export default App;
