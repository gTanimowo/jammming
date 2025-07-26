const Spotify = {
  // Generate random string for PKCE verifier
  _generateRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((byte) => chars[byte % chars.length])
      .join("");
  },

  // Generate PKCE code challenge
  async _generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  },

  // Main authentication method
  async getAccessToken() {
    // Check for existing valid token
    const storedToken = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");
    if (storedToken && expiresAt && Date.now() < Number(expiresAt)) {
      return storedToken;
    }

    // Handle PKCE callback after Spotify redirect
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const verifier = localStorage.getItem("pkce_verifier");

    if (code && verifier) {
      try {
        const response = await fetch("/.netlify/functions/spotify-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            verifier,
            redirect_uri: window.location.origin,
          }),
        });

        if (!response.ok) throw new Error("Token exchange failed");

        const { access_token, expires_in } = await response.json();
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("expires_at", Date.now() + expires_in * 1000);
        window.history.replaceState({}, "", "/");
        return access_token;
      } catch (error) {
        console.error("Token exchange error:", error);
        alert("Oops, something went wrong!");
        return null;
      }
    }

    // Initiate PKCE flow if no token exists
    const newVerifier = this._generateRandomString(64);
    const challenge = await this._generateCodeChallenge(newVerifier);
    localStorage.setItem("pkce_verifier", newVerifier);

    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams(
      {
        response_type: "code",
        client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
        redirect_uri: window.location.origin,
        scope: "playlist-modify-private playlist-modify-public",
        code_challenge_method: "S256",
        code_challenge: challenge,
      }
    )}`;

    window.location.href = authUrl; // Redirect to Spotify
    return null; // Will redirect before reaching here
  },

  // Clear authentication data
  _clearAuthData() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("pkce_verifier");
  },

  // Search for tracks
  async search(query) {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
          query
        )}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Search failed");

      const { tracks } = await response.json();
      return tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri,
        preview_url: track.preview_url,
      }));
    } catch (error) {
      console.error("Search error:", error);
      alert("Oops, something went wrong!");
      return [];
    }
  },

  // Save playlist to Spotify
  async savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) return false;

    try {
      const token = await this.getAccessToken();

      // 1. Get user ID
      const userResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { id: userId } = await userResponse.json();

      // 2. Create playlist
      const playlistResponse = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description: "Created with Jammming",
            public: false,
          }),
        }
      );
      const { id: playlistId } = await playlistResponse.json();

      // 3. Add tracks
      await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: trackUris }),
      });

      return true;
    } catch (error) {
      console.error("Save playlist error:", error);
      alert("Oops, something went wrong!");
      return false;
    }
  },
};

export default Spotify;
