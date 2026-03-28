import { google } from 'googleapis';

export async function importOrdersFromSheet({ spreadsheetId, range = 'Orders!A:F' }) {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    return [];
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = response.data.values ?? [];

  return rows.slice(1).map((row) => ({
    externalOrderId: row[0],
    customerName: row[1],
    phone: row[2],
    city: row[3],
    product: row[4],
    price: Number.parseFloat(row[5] || '0'),
  }));
}
