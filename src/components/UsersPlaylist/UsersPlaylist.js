import React, { useState } from "react";
import Spotify from "../../utils/spotify";
import styles from "../SearchResults/SearchResults.module.css";

const UsersPlaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userPlaylists = await Spotify.getUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (err) {
      setError(err.message || "Could not load playlists");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.resultsContainer}>
      <h2>Your Playlists</h2>
      <button onClick={handleGetPlaylists} disabled={isLoading}>
        {isLoading ? "Loading..." : "Show My Playlists"}
      </button>

      {error && <div className="error">Error: {error}</div>}

      {playlists.length > 0 && (
        <ul>
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              {playlist.name} ({playlist.tracks.total} tracks)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default UsersPlaylist;
