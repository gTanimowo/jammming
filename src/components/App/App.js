import React, { useCallback, useEffect, useState } from "react";
import Header from "../Header/Header";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import styles from "./App.module.css";
import Playlist from "../PlayList/PlayList";
import Spotify from "../../utils/spotify";

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [error, setError] = useState(null);
  const [playlistTitle, setPlaylistTitle] = useState("iu playlist");
  console.log("hit 4");

  useEffect(() => {
    // Handle completion of auth flow
    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      const pendingSearch = localStorage.getItem("pending_search");
      if (pendingSearch) {
        localStorage.removeItem("pending_search");
        handleSearch(pendingSearch);
      }
    }
  }, [handleSearch]);

  const handleSearch = useCallback(
    async (query) => {
      try {
        const token = await Spotify.getAccessToken();
        if (!token) {
          // Store the search term for after auth completes
          localStorage.setItem("pending_search", query);
          return; // Redirect to Spotify will happen
        }

        // Proceed with search if we have a token
        const results = await Spotify.search(query);
        setSearchResults(
          results.filter((track) => !playlist.some((p) => p.id === track.id))
        );
      } catch (err) {
        setError("Search failed. Please try again.");
      }
    },
    [playlist]
  );

  useEffect(() => {
    const savedSearch = localStorage.getItem("last_search_term");
    if (savedSearch) {
      handleSearch(savedSearch);
      localStorage.removeItem("last_search_term");
    }
  }, [handleSearch]);

  useEffect(() => {
    localStorage.setItem("playlist", JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    const stored = localStorage.getItem("playlist");
    if (stored) setPlaylist(JSON.parse(stored));
  }, []);

  // Load from localStorage
  useEffect(() => {
    const savedTitle = localStorage.getItem("playlistTitle");
    if (savedTitle) setPlaylistTitle(savedTitle);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("playlistTitle", playlistTitle);
  }, [playlistTitle]);

  const addTrack = (id) => {
    const trackToAdd = searchResults.find((track) => track.id === id);
    if (trackToAdd && !playlist.find((t) => t.id === id)) {
      setPlaylist([...playlist, trackToAdd]);
      setSearchResults(searchResults.filter((track) => track.id !== id));
    }
  };

  const removeTrack = (id) => {
    const trackToRemove = playlist.find((track) => track.id === id);
    if (trackToRemove && !searchResults.find((t) => t.id === id)) {
      setSearchResults([...searchResults, trackToRemove]);
      setPlaylist(playlist.filter((track) => track.id !== id));
    }
  };

  const getPlaylistURIs = async () => {
    const uris = playlist.map((track) => track.uri);

    try {
      await Spotify.savePlaylist(playlistTitle, uris);
      setPlaylist([]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <SearchBar onSearch={handleSearch} />
      <div className={styles.mainContent}>
        <SearchResults tracks={searchResults} onAdd={addTrack} error={error} />
        <Playlist
          tracks={playlist}
          onRemove={removeTrack}
          onSave={getPlaylistURIs}
          title={playlistTitle}
          setTitle={setPlaylistTitle}
        />
      </div>
    </div>
  );
}

export default App;
