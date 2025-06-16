import React from "react";
import styles from "./PlayList.module.css";
import TrackList from "../TrackList/TrackList";
import Button from "../Button/Button";

const Playlist = () => {
  return (
    <div className={styles.playlistContainer}>
      <div>
        <h2>iu playlist</h2>
        <TrackList tracks={[]} isRemoval={true} />
      </div>
      <Button text="Save to Spotify" />
    </div>
  );
};

export default Playlist;
