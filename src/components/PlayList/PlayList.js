import React, { useState } from "react";
import styles from "./PlayList.module.css";
import TrackList from "../TrackList/TrackList";
import Button from "../Button/Button";

const Playlist = ({ tracks, onRemove, onSave, title, setTitle }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    console.log("hit save");
    if (!title.trim()) return;

    setIsEditing(false);
    setLoading(true);

    try {
      await onSave(title);
      alert("Playlist saved to your Spotify!");
    } catch (err) {
      console.error("Save failed", err);
      alert("There was an error saving your playlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  return (
    <div className={styles.playlistContainer}>
      <div>
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Playlist Name"
            className={styles.playlistInput}
          />
        ) : (
          <h2 onClick={handleEdit} className={styles.playlistTitle}>
            {title}
          </h2>
        )}
        <TrackList tracks={tracks} isRemoval={true} onAction={onRemove} />
      </div>
      {loading ? (
        <Button text="Saving..." disabled />
      ) : (
        <Button text="Save to Spotify" onClick={handleSave} />
      )}
    </div>
  );
};

export default Playlist;
