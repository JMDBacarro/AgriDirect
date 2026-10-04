# 🌾 AgriDirect - Real-Time Multi-Device Deployment Guide

This package contains the complete front-end codebase for **AgriDirect** pre-configured for **Firebase Cloud Firestore Real-Time Synchronization** and **GitHub Pages Hosting**.

When hosted on GitHub Pages and connected to Firebase, any action performed on one computer (e.g. publishing produce, placing an order, updating a delivery status, or sending a direct message) will instantly update the UI across all connected computers and devices in real time without refreshing the page!

---

## 📂 Package Contents

* `index.html` - Complete Single Page Application (SPA) layout with Firebase v10 CDN integration.
* `style.css` - Complete design system, color variables, responsive grid, and UI modal styles.
* `script.js` - Application logic with Cloud Firestore real-time snapshot listeners (`onSnapshot`) and automatic demo data seeding.
* `README.md` - Setup and deployment instructions.

---

## 🚀 Quick Setup Instructions (5 Minutes)

### Step 1: Create a Free Firebase Project
1. Open [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Name your project (e.g., `agridirect-test`) and click **Continue**. Disable Google Analytics (optional) and click **Create project**.
3. In your Firebase dashboard, click **Build** in the sidebar -> **Firestore Database** -> **Create database**.
4. Choose a location closest to your users (e.g., `asia-east1`) and select **Start in test mode** -> click **Create**.
5. Return to the Project Overview page, click the **Web icon (`</>`)** to add a Web App, enter an app nickname, and click **Register app**.
6. Firebase will display your `firebaseConfig` object. Keep this tab open or copy the keys!

---

### Step 2: Add Your Firebase Keys to `script.js`
1. Open `script.js` in any code or text editor (Notepad, VS Code, etc.).
2. At the top of `script.js`, replace the placeholder values in `firebaseConfig` with your actual Firebase keys:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "agridirect-test.firebaseapp.com",
    projectId: "agridirect-test",
    storageBucket: "agridirect-test.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abc123def456"
};
```
3. Save `script.js`.

---

### Step 3: Deploy to GitHub Pages (Free Hosting)
1. Log in to [GitHub](https://github.com/) and create a new public repository named `agridirect`.
2. Click **uploading an existing file**, drag and drop `index.html`, `style.css`, and `script.js`, and click **Commit changes**.
3. Go to **Settings** -> **Pages** in your GitHub repository menu.
4. Under **Build and deployment** -> **Branch**, select `main` (or `master`) and `/ (root)`, then click **Save**.
5. Wait 1-2 minutes. GitHub will provide your live URL (e.g., `https://yourusername.github.io/agridirect`).

---

## 📱 How to Test Real-Time Synchronization Across Computers

1. Open your GitHub Pages link on **Computer A** and log in as a **Farmer** (`farmer1@test.com`, pass: `123`).
2. Open the same link on **Computer B** (or your phone) and log in as a **Buyer** (`buyer1@test.com`, pass: `123`).
3. On **Computer A**, publish a new produce listing or update stock. Notice how it **instantly appears on Computer B** without refreshing the page!
4. On **Computer B**, place an order. On **Computer A**, switch to the **Farmer Command Center** -> **Customer Orders** to see the order arrive in real time!

---

💡 *Note: The system automatically seeds default demo accounts for Farmers (`farmer1@test.com` to `farmer5@test.com`), Buyers (`buyer1@test.com` to `buyer5@test.com`), Transportation Hub (`transpo@test.com`), and Couriers (`rider1@test.com` to `rider10@test.com`) into your Firestore database on first run.*
