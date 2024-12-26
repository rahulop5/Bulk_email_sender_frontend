import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./EmailssentModal.module.css";

const EmailssentModal = forwardRef((_, ref) => {
  const navigate = useNavigate();

  const handleClose = () => {
    // Call the backend to log out the user
    fetch("http://localhost:3000/auth/google/logout", {
      method: "GET",
      credentials: "include", // Ensure cookies are sent for session handling
    })
      .then((response) => {
        if (response.ok) {
          // After successful logout, redirect to home page
          navigate("/");
        } else {
          throw new Error("Failed to log out.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Error during logout.");
      });
  };

  return (
    <dialog ref={ref} className={classes.resultModal}>
      <h2>Emails Successfully Sent!!</h2>
      <form method="dialog">
        <button type="button" onClick={handleClose}>
          Close and Return
        </button>
      </form>
    </dialog>
  );
});

export default EmailssentModal;