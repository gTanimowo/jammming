import React from "react";
import styles from "./Track.module.css";

const Track = ({ track, isRemoval, onAction }) => {
  const handleClick = () => onAction(track.id);

  return (
    <div className={styles.track}>
      <div className={styles.trackInfo}>
        <p className={styles.trackTitle}>{track.name}</p>
        <p className={styles.trackAlbum}>{track.album}</p>
        <p className={styles.trackArtist}>{track.artist}</p>
      </div>
      {track.preview && (
        <audio controls src={track.preview} className={styles.previewAudio}>
          Your browser does not support the audio element.
        </audio>
      )}
      <button onClick={handleClick} className={styles.trackButton}>
        {isRemoval ? "−" : "+"}
      </button>
    </div>
  );
};

export default Track;
