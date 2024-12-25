import classes from './HomepageFooter.module.css';

function HomepageFooter() {
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:3000/auth/google"; // Redirect to the backend Google login route
    };

    return (
        <footer className={classes.footer}>
            <h2>And the best part is it's all Free</h2>
            <button className={classes.getStartedButton} onClick={handleGoogleLogin}>
                Get Started for Free
            </button>
        </footer>
    );
}

export default HomepageFooter;
