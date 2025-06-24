const Spotify = {
  getAccessToken() {
    const token = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");

    if (token && expiresAt && Date.now() < Number(expiresAt)) {
      return token;
    }

    // Try to get token from URL hash after redirect
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // remove '#'
      const accessToken = params.get("access_token");
      const expiresIn = params.get("expires_in");

      if (accessToken && expiresIn) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem(
          "expires_at",
          Date.now() + Number(expiresIn) * 1000
        );

        // Clean the URL so token is not visible
        window.history.replaceState(null, null, window.location.pathname);

        return accessToken;
      }
    }

    // Redirect to Spotify for login if no valid token
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;
    const scope = "playlist-modify-public playlist-modify-private";

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location = authUrl;

    return null; // Will likely never reach here due to redirect
  },

  async getCurrentUserId() {
    const token = await Spotify.getAccessToken();
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
    const token = await Spotify.getAccessToken();
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
    const token = await Spotify.getAccessToken();
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
