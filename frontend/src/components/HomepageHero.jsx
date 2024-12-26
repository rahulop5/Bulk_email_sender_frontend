import classes from "./HomepageHero.module.css";
import Header from "./Header";

function HomepageHero() {
    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:3000/auth/google"; // Redirect to the backend Google login route
    };

    return (
        <>
            <Header ishomepage={true}/>
            {/* Hero Section */}
            <section className={classes.hero}>
                <div className={classes.heroText}>
                    <h1>Send Unlimited Emails in Seconds with InstaMail</h1>
                    <p>Easily send bulk emails that matter – tailored and on time.</p>
                    <button className={classes.signUpButton} onClick={handleGoogleLogin}>
                        <strong>Get Started for Free</strong>
                    </button>
                </div>
                <div className={classes.heroImage}>
                    <img src="./src/assets/hero-img-removebg.png" alt="Email Campaign Screenshot" />
                </div>
            </section>
        </>
    );
}

export default HomepageHero;
