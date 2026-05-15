# Connect Form to Google Sheets - Setup Guide

## Step 1: Create Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Name it: "KalpDev Solar Leads"
4. In Row 1, add these headers:
   - A1: `Timestamp`
   - B1: `Name`
   - C1: `Phone`
   - D1: `Source`
   - E1: `Email`
   - F1: `Area`
   - G1: `Bill`
   - H1: `Property Type`
   - I1: `Message`

## Step 2: Add Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code
3. Paste the code from the file `google-apps-script.js` (in this folder)
4. Click **Save** (name it "FormHandler")

## Step 3: Deploy as Web App

1. In Apps Script, click **Deploy → New Deployment**
2. Click the gear icon → Select **Web app**
3. Set:
   - Description: "Solar Form Handler"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Copy the Web App URL** (it looks like: `https://script.google.com/macros/s/XXXXX/exec`)

## Step 4: Add URL to Website

1. Open `script.js` in the solar-pune folder
2. Find this line near the top:
   ```
   const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_SHEET_WEB_APP_URL';
   ```
3. Replace `YOUR_GOOGLE_SHEET_WEB_APP_URL` with your actual Web App URL
4. Save the file

## Done! 🎉

Now every form submission (popup + contact form) will:
1. Save to your Google Sheet automatically
2. Also redirect to WhatsApp for instant response
3. Store locally as backup (in case of network issues)

## Troubleshooting

- If data isn't appearing, check that the Web App URL is correct
- Make sure you selected "Anyone" for access
- If you update the script, you need to create a **New Deployment** (not just save)
- Check the Apps Script execution log for errors: Extensions → Apps Script → Executions
