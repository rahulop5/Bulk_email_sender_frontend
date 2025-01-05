import classes from "./Header.module.css"

function Header({ishomepage}){
    return (
        <nav className={`${classes.navbar} ${ishomepage?undefined:classes.nothomepage}`}>
            <div className={classes.logo}><img src="./src/assets/Logo.png" alt="Logo" /></div>
            <div className={classes.navLinks}>
                <a href="#features">Features</a>
                <a href="#how-it-works">How it Works</a>
                <a href="mailto:venkatrahul.v23@iiits.in">Contact</a>
            </div>
        </nav>
    );
}

export default Header;