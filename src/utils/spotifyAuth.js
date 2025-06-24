import { generateCodeVerifier, generateCodeChallenge } from "../utils/pkce";

const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const redirectUri = "https://jammming-app-gd.netlify.app";
const scope = "playlist-modify-public playlist-modify-private";

export async function startLogin() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("pkce_verifier", verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}
