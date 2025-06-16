import React from "react";
import styles from "./Button.module.css";

const Button = (props) => {
  return (
    <div className={styles.buttonContainer}>
      <button type="submit" className={styles.button}>
        {props.text}
      </button>
    </div>
  );
};

export default Button;
