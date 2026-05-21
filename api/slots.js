export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const { calendarId, startDate, endDate } = req.query;

  if (!calendarId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required parameters: calendarId, startDate, endDate' });
  }

  // GHL API v2 Private Integration Token and Location ID - stored securely in Vercel environment variables
  const API_TOKEN = process.env.GHL_API_TOKEN;
  const LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!API_TOKEN) {
    return res.status(500).json({ error: 'API token not configured' });
  }

  if (!LOCATION_ID) {
    return res.status(500).json({ error: 'Location ID not configured' });
  }

  try {
    // GHL API v2 expects milliseconds as numbers
    const startMs = parseInt(startDate);
    const endMs = parseInt(endDate);
    
    // GHL API v2 endpoint for calendar slots
    const url = `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${startMs}&endDate=${endMs}`;
    
    console.log('Fetching from:', url);
    console.log('Using token:', API_TOKEN.substring(0, 20) + '...');
    console.log('Location ID:', LOCATION_ID);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
        'Version': '2021-07-28',
        'Location': LOCATION_ID
      }
    });

    const responseText = await response.text();
    console.log('GHL Response Status:', response.status);
    console.log('GHL Response:', responseText);

    if (!response.ok) {
      console.error('GHL API Error:', response.status, responseText);
      return res.status(response.status).json({ 
        error: `GHL API Error: ${response.status}`,
        details: responseText 
      });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid JSON response from GHL', raw: responseText });
    }

    // Transform API v2 response to match v1 format for compatibility
    // API v2 returns: { slots: { "2024-01-15": ["09:00", "10:00"], ... } }
    // We need to transform it to match what the frontend expects
    const transformedData = {};
    
    if (data.slots) {
      for (const [date, times] of Object.entries(data.slots)) {
        transformedData[date] = {
          slots: times.map(time => ({ time }))
        };
      }
    } else if (data) {
      // If response format is different, pass through
      Object.assign(transformedData, data);
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return res.status(200).json(transformedData);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
