import React, { useEffect, useState } from "react";
import Spotify from "../../utils/spotify";
import styles from "../SearchResults/SearchResults.module.css";

const UsersPlaylist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const userPlaylists = await Spotify.getUserPlaylists();
        setPlaylists(userPlaylists);
        console.log("User Playlists:", userPlaylists);
      } catch (err) {
        setError(err.message || "Could not load playlists");
      }
    };

    fetchPlaylists();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!playlists.length) return <div>Loading your playlists...</div>;

  return (
    <div className={styles.resultsContainer}>
      <h2>Your Playlists</h2>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.id}>
            {playlist.name} ({playlist.tracks.total} tracks)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPlaylist;
