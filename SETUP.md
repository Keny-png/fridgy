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

## 7. How to Share with Family
To let family members use the same inventory:

1.  **Add to Test Users (Crucial)**:
    - Go to Google Cloud Console > **OAuth consent screen**.
    - Under **Test users**, click **Add Users**.
    - Enter your family members' Google email addresses.
    - *Note: Without this, they will get a "403 Access Denied" error when logging in.*

2.  **Share the Database**:
    - You (the owner) log in to Fridgy first.
    - Go to your Google Drive.
    - Find the file named **"Fridgy Database"**.
    - Right-click > **Share**.
    - Enter family members' emails and give them **Editor** access.

3.  **Family Login**:
    - Send the deployed App URL to your family.

## 8. Troubleshooting

### "This app isn't verified" / 「このアプリはGoogleで確認されていません」
When family members try to log in, they might see a scary red warning screen saying the app is unsafe or unverified. This is normal for private, personal apps in "Testing" mode.

**How to bypass:**
1. Click the **"Advanced" (詳細)** link on the bottom left of the warning.
2. Click **"Go to Fridgy PWA (unsafe)"** (Fridgy PWA（安全ではないページ）に移動).
3. Click "Continue".

### "Access blocked: App is currently being tested" / 「アクセスをブロック: アプリは現在テスト中です」
If you see this error, it means the Google account is **not added as a Test User**.

**How to fix:**
1. Go back to [Google Cloud Console](https://console.cloud.google.com/) > **OAuth consent screen**.
2. Check the **Test users** list.
3. Ensure the family member's email is added correctly (typos are common!).
4. Click "Save".

## 9. How to Update / Add Features
To make changes in the future:

1.  **Start Local Server**:
    Open terminal in the project folder and run:
    ```bash
    npm run dev
    ```
    Access `http://localhost:5173` to see changes in real-time.

2.  **Edit Code**:
    - **UI/Layout**: Edit files in `src/pages` or `src/components`.
    - **Logic**: Edit `src/hooks` or `src/lib`.
    - **Styles**: Edit CSS files or `src/styles/variables.css`.

3.  **Deploy Updates**:
    Once you are happy with the changes, run these commands to update the live app:
    ```bash
    npm run build
    git add .
    git commit -m "Describe your changes here"
    git push
    ```
    GitHub Pages will automatically detect the push and update the site within 1-2 minutes.



