// =============================================
// GOOGLE APPS SCRIPT - KalpDev Solar
// Handles: Leads, Referral Users, Referral Leads
//
// SETUP STEPS:
// 1. Open: https://docs.google.com/spreadsheets/d/1XWDbziEtUj9kb5Tje-xH5DykoY9H9DhO4hOJo5oDJD8/
// 2. Create 3 sheet tabs (rename at bottom):
//    - "Leads" (contact form data)
//    - "ReferralUsers" (referral program registrations)
//    - "ReferralLeads" (leads with referral codes)
//
// 3. Add headers in Row 1 of each sheet:
//
//    LEADS sheet:
//    A1: Timestamp | B1: Name | C1: Phone | D1: Email | E1: Area | F1: Bill | G1: Property | H1: Message | I1: Referral Code | J1: Source
//
//    REFERRALUSERS sheet:
//    A1: Timestamp | B1: Name | C1: Phone | D1: Email | E1: Password | F1: UPI ID | G1: Referral Code
//
//    REFERRALLEADS sheet:
//    A1: Timestamp | B1: Lead Name | C1: Lead Phone | D1: Area | E1: Bill | F1: Referral Code | G1: Referred By | H1: Status
//
// 4. Click: Extensions → Apps Script
// 5. Delete everything there, paste this ENTIRE code
// 6. Click Save (Ctrl+S)
// 7. Click: Deploy → New Deployment
// 8. Select type: Web app
// 9. Set "Execute as": Me
// 10. Set "Who has access": Anyone
// 11. Click Deploy → Copy the URL
// 12. Paste that URL in script.js AND referral.js (replace PASTE_YOUR_URL_HERE)
// =============================================

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  var action = data.action || 'lead';
  var timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  if (action === 'register_referral') {
    // Save to ReferralUsers sheet
    var sheet = ss.getSheetByName('ReferralUsers');
    if (!sheet) sheet = ss.insertSheet('ReferralUsers');
    sheet.appendRow([
      timestamp,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.password || '',
      data.upi || '',
      data.referralCode || ''
    ]);
  }
  else if (action === 'referral_lead') {
    // Save to ReferralLeads sheet
    var sheet = ss.getSheetByName('ReferralLeads');
    if (!sheet) sheet = ss.insertSheet('ReferralLeads');
    sheet.appendRow([
      timestamp,
      data.name || '',
      data.phone || '',
      data.area || '',
      data.bill || '',
      data.referralCode || '',
      data.referredBy || '',
      'Pending'
    ]);
  }
  else {
    // Default: Save to Leads sheet
    var sheet = ss.getSheetByName('Leads');
    if (!sheet) sheet = ss.insertSheet('Leads');
    sheet.appendRow([
      timestamp,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.area || '',
      data.bill || '',
      data.propertyType || '',
      data.message || '',
      data.referralCode || '',
      data.source || 'website'
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var action = e.parameter.action || '';

  // Get referral users (for login verification)
  if (action === 'get_users') {
    var sheet = ss.getSheetByName('ReferralUsers');
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    var data = sheet.getDataRange().getValues();
    var users = [];
    for (var i = 1; i < data.length; i++) {
      users.push({
        name: data[i][1],
        phone: data[i][2],
        email: data[i][3],
        password: data[i][4],
        upi: data[i][5],
        referralCode: data[i][6]
      });
    }
    return ContentService.createTextOutput(JSON.stringify(users)).setMimeType(ContentService.MimeType.JSON);
  }

  // Get referral leads for a specific code
  if (action === 'get_leads') {
    var code = e.parameter.code || '';
    var sheet = ss.getSheetByName('ReferralLeads');
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    var data = sheet.getDataRange().getValues();
    var leads = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][5] === code) {
        leads.push({
          name: data[i][1],
          phone: data[i][2],
          area: data[i][3],
          bill: data[i][4],
          referralCode: data[i][5],
          referredBy: data[i][6],
          status: data[i][7] || 'Pending',
          date: data[i][0]
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(leads)).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
}
