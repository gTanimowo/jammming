const Spotify = {
  getAccessToken() {
    return localStorage.getItem("access_token");
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
