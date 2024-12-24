import classes from './HomepageFooter.module.css';

function HomepageFooter() {
    return (
        <footer className={classes.footer}>
            <h2>And the best part is it's all Free</h2>
            <button className={classes.getStartedButton}>Get Started for Free</button>
        </footer>
    );
}

export default HomepageFooter;
