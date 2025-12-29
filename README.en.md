# JeyPass Secure Vault 🇬🇧/🇺🇸

![JeyPass Screenshot](https://raw.githubusercontent.com/dehnavi97/jeyPass/main/screenshot/en.png)

**JeyPass** is a modern, secure, and offline-capable password manager designed with simplicity and security in mind. It uses strong encryption (AES-GCM) to protect your data, ensuring that only you can access your credentials with a master password. Built with Next.js, Electron, and Capacitor, it provides a seamless experience across **Windows, macOS, Linux, Android, and iOS**.

**GitHub Repository:** [https://github.com/dehnavi97/jeyPass](https://github.com/dehnavi97/jeyPass)

---

## ✨ Key Features

- **Offline First:** Works completely offline. Your data is stored locally and securely on your device.
- **Strong Encryption:** Uses AES-256-GCM to encrypt your entire vault. Your data is unreadable without your master password.
- **Cross-Platform:**
    - **Desktop (Windows, macOS, Linux):** Runs as a native desktop application using Electron.
    - **Mobile (Android, iOS):** Runs as a native mobile application using Capacitor.
- **Modern UI/UX:**
  - A clean, intuitive, and themeable user interface with a floating action menu.
  - **Themes:** Light, Dark, Ocean, Desert, Garnet, and Forest themes to customize your experience.
  - Custom draggable title bar and window state persistence for the desktop app.
- **TOTP Support:** Generate and display Time-based One-Time Passwords (2FA codes) for your accounts.
- **Strong Password Generator:** Create strong, random, and customizable passwords.
- **Secure Sharing:** Share credentials safely via QR code.
- **Backup and Restore:** Easily back up your encrypted vault and restore it when needed, with cross-platform support (Desktop & Mobile).
- **Auto-lock Timer:** A pausable auto-lock timer to enhance security.
- **Multi-Language Support:** Fully available in English, Persian, Arabic, French, Turkish, and German.

## 🛠️ Technologies Used

- **Framework:** Next.js 14 (App Router)
- **Desktop:** Electron
- **Mobile:** Capacitor
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI
- **Internationalization:** i18next
- **Encryption:** Web Crypto API (AES-256-GCM)

## 🚀 Getting Started

Follow these steps to set up the project for local development.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm or yarn
- For Android development: [Android Studio](https://developer.android.com/studio)
- For iOS development: [Xcode](https://developer.apple.com/xcode/) and [CocoaPods](https://cocoapods.org/)

### 2. Clone the Repository

```bash
git clone https://github.com/dehnavi97/jeyPass.git
cd jeyPass
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run in Development Mode

- **For Electron (Desktop):**
  To run the app in development mode with hot-reloading:
  ```bash
  npm run dev:electron
  ```

- **For Android:**
  1. Sync your web build with the Android project:
     ```bash
     npm run sync:android
     ```
  2. Open the Android project in Android Studio:
     ```bash
     npm run open:android
     ```
  3. In Android Studio, run the app on an emulator or a connected device.

- **For iOS:**
  1. Add the iOS platform (if not already added):
     ```bash
     npx cap add ios
     ```
  2. Sync your web build with the iOS project:
     ```bash
     npm run sync:ios
     ```
  3. Open the iOS project in Xcode:
     ```bash
     npm run open:ios
     ```
  4. In Xcode, run the app on a simulator or a connected iPhone.

## 📦 Building for Production

### 1. Prepare Icons (Important First Step)

1.  Create your app icon at **1024x1024** resolution and save it as `assets/icon.png`.
2.  (Optional) You can create a dark mode icon as `assets/icon-dark.png` and a splash screen background as `assets/splash.png`.
3.  Run the following command to automatically generate all icon sizes and splash screens:
    ```bash
    npm run assets:generate
    ```

### 2. Build for Desktop (Electron)

- **For Windows:** (Must be run on Windows)
  ```bash
  npm run build:electron
  ```
  The installer (`.exe`) will be in the `release` directory.

- **For macOS:** (Must be run on macOS)
  ```bash
  npm run build:electron
  ```
  The installer (`.dmg`) will be in the `release` directory.

- **For Linux:**
  ```bash
  npm run build:electron
  ```
  The installer (`.AppImage`) will be in the `release` directory.

### 3. Build for Android (Capacitor)

1.  **Sync the Project:**
    ```bash
    npm run sync:android
    ```
2.  **Open in Android Studio:**
    ```bash
    npm run open:android
    ```
3.  **Generate Signed APK:**
    - In Android Studio, go to `Build > Generate Signed Bundle / APK...`.
    - Select **APK**, then follow the on-screen instructions to create a key store and sign your application.
    - After the build is complete, you can find the `app-release.apk` file in `android/app/release`.

### 4. Build for iOS (Capacitor)

1.  **Sync the Project:**
    ```bash
    npm run sync:ios
    ```
2.  **Open in Xcode:**
    ```bash
    npm run open:ios
    ```
3.  **Archive and Distribute the App:**
    - In Xcode, select `Any iOS Device (arm64)` as the build target.
    - Go to `Product > Archive`.
    - After archiving is complete, the Organizer window will open. You can distribute your app (for testing or the App Store) from there.

### 5. Build as a Progressive Web App (PWA)

The project is already configured as a PWA. After running `npm run build`, all necessary files are located in the `dist` directory. You can host this directory on any static web host (like Vercel, Netlify, or GitHub Pages) to serve the application as a web app.

---

Developed by **Seyed Javad Dehnavi**. For more applications, visit my Telegram channel: [t.me/Jey_Box](https://t.me/Jey_Box).
