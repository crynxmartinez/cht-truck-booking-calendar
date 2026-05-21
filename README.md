# GHL Proxy - GoHighLevel API CORS Proxy

This is a simple Vercel serverless function that proxies requests to the GoHighLevel API to avoid CORS issues.

## Setup

1. Push this repo to GitHub
2. Connect to Vercel
3. Add environment variable in Vercel:
   - **Name:** `GHL_API_TOKEN`
   - **Value:** Your GoHighLevel API token

## Usage

Once deployed, use this URL in your frontend:

```
https://your-vercel-app.vercel.app/api/slots?calendarId=XXX&startDate=XXX&endDate=XXX
```

## API Endpoint

### GET /api/slots

**Query Parameters:**
- `calendarId` - The GoHighLevel calendar ID
- `startDate` - Start date in milliseconds
- `endDate` - End date in milliseconds

**Response:** Returns the same response as GoHighLevel API
