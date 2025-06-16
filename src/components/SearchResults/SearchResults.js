import React from "react";
import styles from "./SearchResults.module.css";
import TrackList from "../TrackList/TrackList";

const SearchResults = () => {
  // Dummy data for demonstration
  const tracks = [
    { id: 1, title: "eight", artist: "IU | eight" },
    { id: 2, title: "Good day", artist: "IU | REAL" },
    { id: 3, title: "LILAC", artist: "IU | 5th Album 'LILAC'" },
  ];

  return (
    <div className={styles.resultsContainer}>
      <h2>Results</h2>
      <TrackList tracks={tracks} isRemoval={false} />
    </div>
  );
};

export default SearchResults;
