import React from "react";
import styles from "./Button.module.css";

const Button = (props) => {
  return (
    <div className={styles.buttonContainer}>
      <button
        type={props.type || "button"}
        className={styles.button}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.text}
      </button>
    </div>
  );
};

export default Button;
