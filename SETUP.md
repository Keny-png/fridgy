# Fridgy Setup Guide

Since this app runs entirely in your browser without a backend server, it needs to connect to **your** Google Account to store data in Google Sheets. To do this, you need to create a free Google Cloud Console project.

## 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "My Family Fridge").
3. Navigate to **APIs & Services > Library**.
4. Search for and **Enable** the following APIs:
    - **Google Sheets API**
    - **Google Drive API**

## 2. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** (unless you have a Google Workspace organization).
3. Fill in the app name ("Fridgy") and user support email.
4. Add your email as a **Test User** (Important! Otherwise you can't log in).

## 3. Create Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Application type: **Web application**.
4. Name: "Fridgy PWA".
5. **Authorized JavaScript origins**:
    - Add `http://localhost:5173` (for local development).
    - Add your hosted URL (e.g., `https://your-username.github.io`).
6. Click **Create**.
7. Copy the **Client ID**.

## 4. Helper Configuration
Create a file named `.env` in the root of the project with the following content:

```
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## 5. Running the App
1. Run `npm install`.
2. Run `npm run dev`.
3. Open `http://localhost:5173`.
4. Sign in!

## 6. Deployment (GitHub Pages)
1. Update `vite.config.ts` to set `base: '/repo-name/'` if deploying to a subpath.
2. Run `npm run build`.
3. Push functionality to GitHub.
