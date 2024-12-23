import classes from "./HomepageFeatures.module.css";

function HomepageFeatures() {
  return (
    <section className={classes.featuresSection}>
      {/* Section Heading */}
      <h2 className={classes.heading}>Unlock the Full Potential of Email Marketing</h2>

      {/* Feature Items */}
      <div className={classes.features}>
        <div className={classes.featureItem}>
          <img src="./src/assets/emails.png" alt="Personalized Templates" />
          <h3>Personalized Email Templates</h3>
          <p>Customize emails with ease using your CSV data. No more manual work!</p>
        </div>
        <div className={classes.featureItem}>
          <img src="./src/assets/gmaillogo.png" alt="Seamless Gmail Integration" />
          <h3>Seamless Gmail Integration</h3>
          <p>Connect your Gmail account securely and send emails directly.</p>
        </div>
        <div className={classes.featureItem}>
          <img src="./src/assets/realtimeanalytics.png" alt="Real-Time Analytics" />
          <h3>Real-Time Analytics</h3>
          <p>Track email delivery and open rates with our detailed reporting. (Coming Soon..)</p>
        </div>
        <div className={classes.featureItem}>
          <img src="./src/assets/Odometer.png" alt="Efficient and Reliable" />
          <h3>Efficient and Reliable</h3>
          <p>Send thousands of emails quickly and reliably, with zero hassle.</p>
        </div>
        <div className={classes.featureItem}>
          <img src="./src/assets/lock.png" alt="Advanced Security" />
          <h3>Advanced Security</h3>
          <p>Ensure the safety of your emails and data with top-notch security features.</p>
        </div>
        <div className={classes.featureItem}>
          <img src="./src/assets/clock.png" alt="Scheduled Email Campaigns" />
          <h3>Scheduled Email Campaigns</h3>
          <p>Plan and schedule your email campaigns in advance to reach recipients at the perfect time.</p>
        </div>

      </div>
    </section>
  );
}

export default HomepageFeatures;
