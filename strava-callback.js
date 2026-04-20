export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).json({ error: "Token exchange failed", details: tokenData });

    // Hent siste 20 aktiviteter
    const activitiesRes = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=20",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const activities = await activitiesRes.json();

    // Filtrer løpeaktiviteter og formater
    const runs = activities
      .filter(a => a.type === "Run" || a.sport_type === "Run")
      .map(a => ({
        date: a.start_date_local.split("T")[0],
        type: "Rolig",
        distance: `${(a.distance / 1000).toFixed(2)} km`,
        duration: `${Math.floor(a.moving_time / 60)} min`,
        pace: (() => {
          const paceSecPerKm = a.moving_time / (a.distance / 1000);
          const m = Math.floor(paceSecPerKm / 60);
          const s = Math.round(paceSecPerKm % 60);
          return `${m}:${s.toString().padStart(2, "0")}/km`;
        })(),
        status: "Fullført",
        note: a.name || "",
        share: false,
        fromStrava: true,
      }));

    // Send tilbake til appen med data
    const dataEncoded = encodeURIComponent(JSON.stringify(runs));
    res.redirect(`https://hk-app-sable.vercel.app/?strava=${dataEncoded}`);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}