// api/spot.js — Vercel Serverless Function (Node.js)
module.exports = async (req, res) => {
  try {
    const cur = (req.query.cur || 'USD').toUpperCase();
    const apiKey = process.env.METALS_API_KEY;
    if (!apiKey) { res.status(500).json({ error: 'Missing METALS_API_KEY env var' }); return; }
    const url = `https://metals-api.com/api/latest?access_key=${encodeURIComponent(apiKey)}&base=USD&symbols=XAU,${encodeURIComponent(cur)}`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data || data.success === false) { res.status(502).json({ error: data && data.error ? data.error : 'Bad response from Metals-API' }); return; }
    const rXAU = data.rates && data.rates.XAU; // XAU per 1 USD
    const rCUR = cur === 'USD' ? 1 : (data.rates && data.rates[cur]); // CUR per 1 USD
    if (!rXAU || !rCUR) { res.status(502).json({ error: 'Missing XAU or currency rate' }); return; }
    const usdPerXAU = 1 / rXAU;          // USD per XAU
    const curPerXAU = usdPerXAU * rCUR;  // CUR per XAU
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({ currency: cur, oz: curPerXAU, date: data.date, base: 'USD', source: 'metals-api' });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};