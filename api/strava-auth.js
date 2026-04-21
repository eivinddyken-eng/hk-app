export default function handler(req, res) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = "https://hk-app-sable.vercel.app/api/strava-callback";
  const scope = "activity:read_all";
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
  res.redirect(authUrl);
}
