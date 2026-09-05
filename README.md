# Taal Tarang registration form

This HTML form contains the questions from the official Taal Tarang Google Form. Full Name and Contact Number are both unique checks. The browser shows no other fields until both checks pass. On completion, all answers are saved to the target Google Sheet and sent to the original Google Form. The browser then opens a WhatsApp chat to the organiser with a prefilled registration summary.

1. Install packages: `npm install`
2. Run `npm run build` once.
3. Run `npm run server` and open `http://localhost:3001`.

Enter a 10-digit Indian mobile number. Used numbers are saved locally in `registrations.json`.

The WhatsApp step opens a chat with a prefilled message; the user must tap **Send**. Automatic WhatsApp delivery needs an approved WhatsApp Business API account.

## Target Google Sheet

To store answers in the target spreadsheet, open that spreadsheet and select **Extensions → Apps Script**. Paste in [google-apps-script.gs](google-apps-script.gs), then deploy it as a Web app that executes as you and is accessible to anyone. The script creates a fresh tab named `Taal Tarang Registrations`, without deleting existing spreadsheet data.

## Netlify

The project includes [netlify.toml](netlify.toml) and a serverless API at `netlify/functions/registration.mjs`. Deploy the repository to Netlify and add `GOOGLE_SHEETS_WEB_APP_URL` and `GOOGLE_SHEETS_SECRET` as Netlify environment variables. Do not upload `.env`.
