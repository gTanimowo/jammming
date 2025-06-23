let accessToken;
const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const scope = process.env.REACT_APP_SPOTIFY_SCOPE;

const Spotify = {
  getAccessToken() {
    if (accessToken) return accessToken;

    const storedToken = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");

    if (storedToken && expiresAt && new Date().getTime() < Number(expiresAt)) {
      accessToken = storedToken;
      return accessToken;
    }

    const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (tokenMatch && expiresInMatch) {
      accessToken = tokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      const now = new Date().getTime();
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("expires_at", now + expiresIn * 1000);

      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");
      return accessToken;
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const searchTerm = urlParams.get("search") || ""; // Or get from your app state

      if (searchTerm) {
        localStorage.setItem("last_search_term", searchTerm);
      }

      const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=${encodeURIComponent(
        scope
      )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

      window.location = authUrl;
    }
  },

  async search(term) {
    const token = Spotify.getAccessToken();
    const endpoint = `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
      term
    )}`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const jsonResponse = await response.json();
    if (!jsonResponse.tracks) return [];

    return jsonResponse.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      uri: track.uri,
      preview: track.preview_url,
    }));
  },

  async getCurrentUserId() {
    const token = Spotify.getAccessToken();
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Could not get user profile");
    const data = await response.json();
    return data.id;
  },

  async createPlaylist(userId, name) {
    const token = Spotify.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          description: "Custom playlist from Jammming",
          public: true,
        }),
      }
    );

    if (!response.ok) throw new Error("Could not create playlist");
    const data = await response.json();
    return data.id;
  },

  async addTracksToPlaylist(playlistId, trackUris) {
    const token = Spotify.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: trackUris }),
      }
    );

    if (!response.ok) throw new Error("Could not add tracks to playlist");
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return;

    try {
      const userId = await Spotify.getCurrentUserId();
      const playlistId = await Spotify.createPlaylist(userId, name);
      await Spotify.addTracksToPlaylist(playlistId, trackUris);
    } catch (error) {
      console.error("Failed to save playlist:", error);
      throw error;
    }
  },
};

export default Spotify;
