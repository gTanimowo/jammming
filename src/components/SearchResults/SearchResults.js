import React from "react";
import styles from "./SearchResults.module.css";
import TrackList from "../TrackList/TrackList";

const SearchResults = ({ tracks, onAdd }) => {
  return (
    <div className={styles.resultsContainer}>
      <h2>Results</h2>
      <TrackList tracks={tracks} isRemoval={false} onAction={onAdd} />
    </div>
  );
};

export default SearchResults;
