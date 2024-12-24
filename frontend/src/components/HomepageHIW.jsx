import { useEffect, useRef } from "react";
import classes from "./HomepageHIW.module.css";

function HomepageHIW() {
  const stepRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(classes.visible);
          }
        });
      },
      { threshold: 0.1 } // Adjust threshold for when animation should trigger
    );

    stepRefs.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => {
      stepRefs.current.forEach((step) => {
        if (step) observer.unobserve(step);
      });
    };
  }, []);

  return (
    <section className={classes.hiwSection}>
      <h2 className={classes.heading}>How It Works</h2>

      <div
        className={`${classes.step} ${classes.leftStep} ${classes.step1}`}
        ref={(el) => (stepRefs.current[0] = el)}
      >
        <div className={classes.circleImage}>
          <img src="./src/assets/googlelogo.png" alt="Login with Google" />
        </div>
        <div className={classes.stepContent}>
          <h3>Login with Google</h3>
          <p>Securely log in with your Google account to access the full suite of email features. Our integration with Google ensures you never have to worry about managing additional passwords, keeping your email communication safe and efficient. Once logged in, you can access all your email tools and settings effortlessly.</p>
        </div>
      </div>

      <div
        className={`${classes.step} ${classes.rightStep} ${classes.step2}`}
        ref={(el) => (stepRefs.current[1] = el)}
      >
        <div className={classes.stepContent}>
          <h3>Upload CSV</h3>
            <p>
            Upload your CSV file to import recipient data in just a few clicks. Our system will automatically map the data, allowing you to customize emails based on the recipient's information. With support for multiple fields, you can personalize messages for each individual, improving engagement and effectiveness.
            </p>        
        </div>
        <div className={classes.circleImage}>
          <img src="./src/assets/csvupload.png" alt="Upload CSV" />
        </div>
      </div>

      <div
        className={`${classes.step} ${classes.leftStep} ${classes.step3}`}
        ref={(el) => (stepRefs.current[2] = el)}
      >
        <div className={classes.circleImage}>
          <img src="./src/assets/emailtemplate.png" alt="Choose Template" />
        </div>
        <div className={classes.stepContent}>
          <h3>Choose Template</h3>
            <p>
            Browse through a variety of email templates designed for different use cases. From simple notifications to beautifully crafted newsletters, select the one that best fits your needs. Customize the template with dynamic fields to include personalized details for each recipient, ensuring your emails feel tailored and professional.
            </p>
        </div>
      </div>

      <div
        className={`${classes.step} ${classes.rightStep} ${classes.step4}`}
        ref={(el) => (stepRefs.current[3] = el)}
      >
        <div className={classes.stepContent}>
          <h3>Send Emails</h3>
          <p>Once your recipients are loaded and your template is customized, it's time to send out your personalized emails with just one click. Our system ensures that each recipient gets a tailored message based on the data you provided. You can track the status of sent emails and rest easy knowing your communication is timely and targeted, reaching the right audience with minimal effort.</p>
        </div>
        <div className={classes.circleImage}>
          <img src="./src/assets/click.png" alt="Send Emails" />
        </div>
      </div>
    </section>
  );
}

export default HomepageHIW;
