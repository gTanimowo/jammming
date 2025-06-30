const axios = require("axios");

exports.handler = async (event) => {
  try {
    const { code, verifier, redirect_uri } = JSON.parse(event.body);

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      code_verifier: verifier,
    });

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Full error:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });

    return {
      statusCode: error.response?.status || 400,
      body: JSON.stringify({
        error: "Token exchange failed",
        details: error.response?.data || error.message,
      }),
    };
  }
};
