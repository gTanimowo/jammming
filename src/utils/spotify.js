// src/utils/spotify.js
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
        window.history.replaceState({}, "", "/"); // Clean URL
        return access_token;
      } catch (error) {
        console.error("Token exchange error:", error);
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
      return false;
    }
  },
};

// const Spotify = {
//   getAccessToken() {
//     // 1. Check existing token
//     const storedToken = localStorage.getItem("access_token");
//     console.log(storedToken);
//     const expiresAt = localStorage.getItem("expires_at");

//     if (storedToken && expiresAt && Date.now() < Number(expiresAt)) {
//       return storedToken;
//     }

//     // 2. Check URL hash for new token
//     const hash = window.location.hash.substring(1);
//     const params = new URLSearchParams(hash);

//     if (params.has("access_token")) {
//       const accessToken = params.get("access_token");
//       const expiresIn = params.get("expires_in") || 3600;

//       localStorage.setItem("access_token", accessToken);
//       localStorage.setItem("expires_at", Date.now() + expiresIn * 1000);
//       window.history.replaceState({}, "", window.location.pathname);
//       return accessToken;
//     }

//     // 3. Initiate auth flow
//     const authParams = new URLSearchParams({
//       client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
//       response_type: "token",
//       redirect_uri: process.env.REACT_APP_REDIRECT_URI,
//       scope: "playlist-modify-private playlist-modify-public",
//       show_dialog: true, // Forces login prompt every time for debugging
//     });
//     // Add this right before redirect to debug

//     // Add this before auth redirect
//     const authUrl = `https://accounts.spotify.com/authorize?${authParams.toString()}`;
//     console.log("Final Auth URL:", authUrl);
//     const proceed = alert(`Proceed to:\n${authUrl}`);
//     if (proceed) window.location.href = authUrl;
//     console.log("Redirecting to:", authUrl);
//     alert(authUrl);
//     debugger;
//     window.location.assign(authUrl);
//     return null;
//   },

//   async search(term) {
//     const token = this.getAccessToken();
//     const response = await fetch(
//       `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
//         term
//       )}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const jsonResponse = await response.json();
//     if (!jsonResponse.tracks) return [];

//     return jsonResponse.tracks.items.map((track) => ({
//       id: track.id,
//       name: track.name,
//       artist: track.artists[0].name,
//       album: track.album.name,
//       uri: track.uri,
//       preview: track.preview_url,
//     }));
//   },

//   async savePlaylist(name, trackUris) {
//     if (!name || !trackUris.length) return;

//     const token = this.getAccessToken();
//     const headers = { Authorization: `Bearer ${token}` };

//     // Get user ID
//     const userResponse = await fetch("https://api.spotify.com/v1/me", {
//       headers,
//     });
//     const userData = await userResponse.json();
//     const userId = userData.id;

//     // Create playlist
//     const playlistResponse = await fetch(
//       `https://api.spotify.com/v1/users/${userId}/playlists`,
//       {
//         method: "POST",
//         headers: {
//           ...headers,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: name,
//           description: "Created via Jammming",
//           public: false,
//         }),
//       }
//     );
//     const playlistData = await playlistResponse.json();
//     const playlistId = playlistData.id;

//     // Add tracks
//     await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
//       method: "POST",
//       headers: {
//         ...headers,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ uris: trackUris }),
//     });
//   },
// };

// const Spotify = {
//   async getAccessToken() {
//     const token = localStorage.getItem("access_token");
//     const expiresAt = localStorage.getItem("expires_at");

//     if (token && expiresAt && Date.now() < Number(expiresAt)) {
//       return token;
//     }

//     // If no valid token, initiate PKCE flow
//     this.initiatePKCEFlow();
//     return null;
//   },

//   async initiatePKCEFlow() {
//     const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
//     const redirectUri =
//       process.env.REACT_APP_REDIRECT_URI || "http://127.0.0.1:3000";
//     const scope = "playlist-modify-public playlist-modify-private";

//     localStorage.removeItem("access_token");
//     localStorage.removeItem("expires_at");
//     localStorage.removeItem("pkce_verifier");

//     // Generate PKCE verifier and challenge
//     const verifier = this.generateRandomString(64);
//     localStorage.setItem("pkce_verifier", verifier);

//     const challenge = await this.generatePKCEChallenge(verifier);

//     const authUrl = new URL("https://accounts.spotify.com/authorize");
//     authUrl.searchParams.append("client_id", clientId);
//     authUrl.searchParams.append("response_type", "code");
//     authUrl.searchParams.append("redirect_uri", redirectUri);
//     authUrl.searchParams.append("scope", scope);
//     authUrl.searchParams.append("code_challenge_method", "S256");
//     authUrl.searchParams.append("code_challenge", challenge);

//     window.location = authUrl.toString();
//   },

//   generateRandomString(length) {
//     const possible =
//       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     const values = crypto.getRandomValues(new Uint8Array(length));
//     return values.reduce((acc, x) => acc + possible[x % possible.length], "");
//   },

//   async generatePKCEChallenge(verifier) {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(verifier);
//     const digest = await crypto.subtle.digest("SHA-256", data);
//     return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
//       .replace(/\+/g, "-")
//       .replace(/\//g, "_")
//       .replace(/=+$/, "");
//   },

//   async search(term) {
//     const token = Spotify.getAccessToken();
//     const endpoint = `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
//       term
//     )}`;

//     const response = await fetch(endpoint, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const jsonResponse = await response.json();
//     if (!jsonResponse.tracks) return [];

//     return jsonResponse.tracks.items.map((track) => ({
//       id: track.id,
//       name: track.name,
//       artist: track.artists[0].name,
//       album: track.album.name,
//       uri: track.uri,
//       preview: track.preview_url,
//     }));
//   },

//   async getCurrentUserId() {
//     const token = Spotify.getAccessToken();
//     const response = await fetch("https://api.spotify.com/v1/me", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) throw new Error("Could not get user profile");
//     const data = await response.json();
//     return data.id;
//   },

//   async createPlaylist(userId, name) {
//     const token = Spotify.getAccessToken();
//     const response = await fetch(
//       `https://api.spotify.com/v1/users/${userId}/playlists`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: name,
//           description: "Custom playlist from Jammming",
//           public: true,
//         }),
//       }
//     );

//     if (!response.ok) throw new Error("Could not create playlist");
//     const data = await response.json();
//     return data.id;
//   },

//   async addTracksToPlaylist(playlistId, trackUris) {
//     const token = Spotify.getAccessToken();
//     const response = await fetch(
//       `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ uris: trackUris }),
//       }
//     );

//     if (!response.ok) throw new Error("Could not add tracks to playlist");
//   },

//   async savePlaylist(name, trackUris) {
//     if (!name || !trackUris.length) return;

//     try {
//       const userId = await Spotify.getCurrentUserId();
//       const playlistId = await Spotify.createPlaylist(userId, name);
//       await Spotify.addTracksToPlaylist(playlistId, trackUris);
//     } catch (error) {
//       console.error("Failed to save playlist:", error);
//       throw error;
//     }
//   },
// };

// const Spotify = {
//   getAccessToken() {
//     const token = localStorage.getItem("access_token");
//     const expiresAt = localStorage.getItem("expires_at");

//     if (token && expiresAt && Date.now() < Number(expiresAt)) {
//       return token;
//     }

//     // Try to get token from URL hash after redirect
//     const hash = window.location.hash;
//     if (hash) {
//       const params = new URLSearchParams(hash.substring(1)); // remove '#'
//       const accessToken = params.get("access_token");
//       const expiresIn = params.get("expires_in");

//       if (accessToken && expiresIn) {
//         localStorage.setItem("access_token", accessToken);
//         localStorage.setItem(
//           "expires_at",
//           Date.now() + Number(expiresIn) * 1000
//         );

//         // Clean the URL so token is not visible
//         window.history.replaceState(null, null, window.location.pathname);

//         return accessToken;
//       }
//     }

//     // Redirect to Spotify for login if no valid token
//     const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
//     const redirectUri = process.env.REACT_APP_REDIRECT_URI;
//     const scope = "playlist-modify-public playlist-modify-private";

//     const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=${encodeURIComponent(
//       scope
//     )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

//     window.location = authUrl;

//     return null; // Will likely never reach here due to redirect
//   },

// };
export default Spotify;
