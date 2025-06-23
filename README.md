# Jammming React App

A React web application that lets users search for music, build a playlist, and save it directly to their Spotify account.

## Features

- Spotify search integration
- Add/remove tracks from a custom playlist
- Edit playlist name
- Save playlist to user's Spotify account
- Responsive layout for mobile and desktop
- Access token management with redirect support

## Tech Stack

- React
- Spotify Web API
- CSS Modules
- LocalStorage for persistence

## Getting Started

### Prerequisites

- Node.js and npm installed
- A Spotify Developer Account

### Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Set your Redirect URI to: `http://localhost:3000/`
4. Copy your **Client ID**

### Environment Setup

Create a `.env` file in the root of your project:

```
REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
REACT_APP_REDIRECT_URI=http://localhost:3000/
REACT_APP_SPOTIFY_SCOPES=playlist-modify-public playlist-modify-private
```

### Installation

```bash
npm install
npm start
```

The app will run on `http://localhost:3000`

## Folder Structure

```
/src
  /components
    Header/
    SearchBar/
    SearchResults/
    Playlist/
    TrackList/
    Track/
    Button/
  /utils
    Spotify.js
  App.js
  index.js
```

## Scripts

- `npm start` – Runs the app in development mode
- `npm run build` – Builds the app for production

## Design Docs

Design documents for features can be found in the `/docs` folder:

- [Save Playlist Feature Design](./docs/save-playlist-feature-design.md)

## License

MIT

## Author

Golden Dennar Tanimowo
