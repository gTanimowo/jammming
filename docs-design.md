## Design Document: Save Playlist to Spotify Feature

**Date:** June 23, 2025

---

### OBJECTIVE

Allow users to save their custom playlist created in the Jammming app directly to their Spotify account with a custom title.

---

### BACKGROUND

Jammming enables users to search for songs using the Spotify API and build a personalized playlist by adding or removing tracks. Initially, the playlist only exists within the app's state. However, a key feature of the app is giving users the ability to permanently save their curated playlist to their own Spotify account.

Spotify provides an API endpoint to create a new playlist and add tracks to it. Implementing this feature improves user experience and aligns the app with its intended purpose of being a full-featured playlist builder.

**Essential functionality:**

- Save the current playlist to a user's Spotify account.
- Allow users to input a playlist name.
- Display loading feedback while saving.
- Prevent saving empty playlists.
- Persist playlist title using localStorage.

---

### TECHNICAL DESIGN

**New Functionality:**

- `Spotify.savePlaylist(name, uris)` method:

  - Use access token to get user ID via `https://api.spotify.com/v1/me`
  - Create a playlist with `POST /v1/users/{user_id}/playlists`
  - Add tracks with `POST /v1/playlists/{playlist_id}/tracks`

**Component Updates:**

- `Playlist.js`

  - Accepts `title`, `setTitle`, `onSave` as props
  - Local `loading` state to disable button and show progress
  - Calls `onSave(title)` and resets playlist if successful

- `App.js`

  - Holds `playlistTitle` in state and localStorage
  - `getPlaylistURIs(title)` handles save logic

**Access Token Handling:**

- Store token and expiration in localStorage
- Automatically refresh from URL if expired
- Persist search term across redirect

**Responsive Layout:**

- `.mainContent` stacks vertically on screens <768px
- Containers (`.playlistContainer`, `.resultsContainer`) center themselves on mobile with full width

**Edge Cases:**

- Playlist name is empty → show warning or block save
- Spotify API fails → show error message and allow retry

---

### CAVEATS

**Alternatives Considered:**

- Saving playlists only in localStorage — not persistent or useful across devices
- Using a backend to proxy Spotify requests — adds complexity and may violate Spotify terms if storing tokens

**Drawbacks:**

- Relying entirely on the frontend exposes the access token in browser memory (standard for Spotify client apps but not ideal for sensitive scopes)
- Token expiration logic must be carefully handled to prevent silent failures

**Future Considerations:**

- Allow saving to private playlists
- Support editing or deleting saved playlists
- Implement Spotify login with refresh tokens via backend for better security
