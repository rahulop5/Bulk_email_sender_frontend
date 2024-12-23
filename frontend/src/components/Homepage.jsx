import classes from "./Homepage.module.css";

function Homepage() {
    return (
        <div className={classes.homepage}>
            {/* Navbar */}
            <nav className={classes.navbar}>
                <div className={classes.logo}><img src="./src/assets/Logo.png" alt="Logo" /></div>
                <div className={classes.navLinks}>
                    <a href="#products">Home</a>
                    <a href="#pricing">About</a>
                    <a href="#resources">Contact</a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={classes.hero}>
                <div className={classes.heroText}>
                    <h1>Send Unlimited Emails in Seconds with InstaMail</h1>
                    <p>Easily send bulk emails that matter – tailored and on time.</p>
                    <button className={classes.signUpButton}><strong>Get Started for Free</strong></button>
                </div>
                <div className={classes.heroImage}>
                    <img src="./src/assets/hero-img-removebg.png" alt="Email Campaign Screenshot" />
                </div>
            </section>
        </div>
    );
}

export default Homepage;
