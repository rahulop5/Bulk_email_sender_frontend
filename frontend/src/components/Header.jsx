import classes from "./Header.module.css"

function Header({ishomepage}){
    return (
        <nav className={`${classes.navbar} ${ishomepage?undefined:classes.nothomepage}`}>
            <div className={classes.logo}><img src="./src/assets/Logo.png" alt="Logo" /></div>
            <div className={classes.navLinks}>
                <a href="#products">Home</a>
                <a href="#pricing">About</a>
                <a href="#resources">Contact</a>
            </div>
        </nav>
    );
}

export default Header;