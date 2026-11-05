export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: 'Missing URL' });

  try {
    // Saare headers (jaise Stripe ka Authorization) copy karo
    const forwardHeaders = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
        forwardHeaders[key] = value;
      }
    }

    // Body ko string mein bhejo taaki Stripe isko samajh sake
    const bodyData = req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: bodyData
    });

    const textData = await response.text();
    let jsonData;
    try { jsonData = JSON.parse(textData); } catch { jsonData = { raw: textData }; }

    return res.status(response.status).json(jsonData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
