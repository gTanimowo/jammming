import React from "react";
import styles from "./Track.module.css";

const Track = ({ track, isRemoval }) => {
  const handleClick = () => {
    alert(`${isRemoval ? "Remove" : "Add"}: ${track.title}`);
  };

  return (
    <div className={styles.track}>
      <div className={styles.trackInfo}>
        <p className={styles.trackTitle}>{track.title}</p>
        <p className={styles.trackArtist}>{track.artist}</p>
      </div>
      <button onClick={handleClick} className={styles.trackButton}>
        {isRemoval ? "−" : "+"}
      </button>
    </div>
  );
};

export default Track;
