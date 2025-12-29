# JeyPass Secure Vault 🇩🇪

![JeyPass Screenshot](https://raw.githubusercontent.com/dehnavi97/jeyPass/main/screenshot/de.png)

**JeyPass** ist ein moderner, sicherer und offline-fähiger Passwort-Manager, der mit Einfachheit und Sicherheit im Sinn entwickelt wurde. Er verwendet eine starke Verschlüsselung (AES-GCM), um Ihre Daten zu schützen und stellt sicher, dass nur Sie mit einem Master-Passwort auf Ihre Anmeldeinformationen zugreifen können. Gebaut mit Next.js, Electron und Capacitor, bietet es eine nahtlose Erfahrung auf **Windows, macOS, Linux, Android und iOS**.

**GitHub-Repository:** [https://github.com/dehnavi97/jeyPass](https://github.com/dehnavi97/jeyPass)

---

## ✨ Hauptmerkmale

- **Offline Zuerst:** Funktioniert vollständig offline. Ihre Daten werden lokal und sicher auf Ihrem Gerät gespeichert.
- **Starke Verschlüsselung:** Verwendet AES-256-GCM, um Ihren gesamten Tresor zu verschlüsseln. Ihre Daten sind ohne Ihr Master-Passwort unlesbar.
- **Plattformübergreifend:**
    - **Desktop (Windows, macOS, Linux):** Läuft als native Desktop-Anwendung mit Electron.
    - **Mobil (Android, iOS):** Läuft als native mobile Anwendung mit Capacitor.
- **Moderne Benutzeroberfläche:**
  - Eine saubere, intuitive und themenbasierte Benutzeroberfläche mit einem schwebenden Aktionsmenü.
  - **Themen:** Helle, Dunkle, Ozean-, Wüsten-, Granat- und Wald-Themen zur Anpassung Ihrer Erfahrung.
  - Anpassbare, ziehbare Titelleiste und Persistenz des Fensterzustands für die Desktop-App.
- **TOTP-Unterstützung:** Generieren und Anzeigen von zeitbasierten Einmalpasswörtern (2FA-Codes) für Ihre Konten.
- **Starker Passwort-Generator:** Erstellen Sie starke, zufällige und anpassbare Passwörter.
- **Sicheres Teilen:** Teilen Sie Anmeldeinformationen sicher per QR-Code.
- **Sicherung und Wiederherstellung:** Sichern Sie einfach Ihren verschlüsselten Tresor und stellen Sie ihn bei Bedarf wieder her, mit plattformübergreifender Unterstützung (Desktop & Mobil).
- **Auto-Sperr-Timer:** Ein pausierbarer Auto-Sperr-Timer zur Erhöhung der Sicherheit.
- **Mehrsprachige Unterstützung:** Vollständig verfügbar in Englisch, Persisch, Arabisch, Französisch, Türkisch und Deutsch.

## 🛠️ Verwendete Technologien

- **Framework:** Next.js 14 (App Router)
- **Desktop:** Electron
- **Mobil:** Capacitor
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS
- **UI-Komponenten:** ShadCN UI
- **Internationalisierung:** i18next
- **Verschlüsselung:** Web Crypto API (AES-256-GCM)

## 🚀 Erste Schritte

Folgen Sie diesen Schritten, um das Projekt für die lokale Entwicklung einzurichten.

### 1. Voraussetzungen

- [Node.js](https://nodejs.org/) (v18 oder höher)
- npm oder yarn
- Für die Android-Entwicklung: [Android Studio](https://developer.android.com/studio)
- Für die iOS-Entwicklung: [Xcode](https://developer.apple.com/xcode/) und [CocoaPods](https://cocoapods.org/)

### 2. Klonen des Repositorys

```bash
git clone https://github.com/dehnavi97/jeyPass.git
cd jeyPass
```

### 3. Abhängigkeiten installieren

```bash
npm install
```

### 4. Im Entwicklungsmodus ausführen

- **Für Electron (Desktop):**
  Um die App im Entwicklungsmodus mit Hot-Reloading auszuführen:
  ```bash
  npm run dev:electron
  ```

- **Für Android:**
  1. Synchronisieren Sie Ihren Web-Build mit dem Android-Projekt:
     ```bash
     npm run sync:android
     ```
  2. Öffnen Sie das Android-Projekt in Android Studio:
     ```bash
     npm run open:android
     ```
  3. Führen Sie in Android Studio die App auf einem Emulator oder einem verbundenen Gerät aus.

- **Für iOS:**
  1. Fügen Sie die iOS-Plattform hinzu (falls nicht vorhanden):
     ```bash
     npx cap add ios
     ```
  2. Synchronisieren Sie Ihren Web-Build mit dem iOS-Projekt:
     ```bash
     npm run sync:ios
     ```
  3. Öffnen Sie das iOS-Projekt in Xcode:
     ```bash
     npm run open:ios
     ```
  4. Führen Sie in Xcode die App auf einem Simulator oder einem verbundenen iPhone aus.

## 📦 Build für die Produktion

### 1. Icons vorbereiten (Wichtiger erster Schritt)

1.  Erstellen Sie Ihr App-Icon mit einer Auflösung von **1024x1024** und speichern Sie es als `assets/icon.png`.
2.  (Optional) Sie können ein Dark-Mode-Icon als `assets/icon-dark.png` und einen Splash-Screen-Hintergrund als `assets/splash.png` erstellen.
3.  Führen Sie den folgenden Befehl aus, um alle Icon-Größen und Splash-Screens automatisch zu generieren:
    ```bash
    npm run assets:generate
    ```

### 2. Build für Desktop (Electron)

- **Für Windows:** (Muss auf Windows ausgeführt werden)
  ```bash
  npm run build:electron
  ```
  Der Installer (`.exe`) befindet sich im Verzeichnis `release`.

- **Für macOS:** (Muss auf macOS ausgeführt werden)
  ```bash
  npm run build:electron
  ```
  Der Installer (`.dmg`) befindet sich im Verzeichnis `release`.

- **Für Linux:**
  ```bash
  npm run build:electron
  ```
  Der Installer (`.AppImage`) befindet sich im Verzeichnis `release`.

### 3. Build für Android (Capacitor)

1.  **Projekt synchronisieren:**
    ```bash
    npm run sync:android
    ```
2.  **In Android Studio öffnen:**
    ```bash
    npm run open:android
    ```
3.  **Signierte APK generieren:**
    - Gehen Sie in Android Studio zu `Build > Generate Signed Bundle / APK...`.
    - Wählen Sie **APK** und folgen Sie den Anweisungen auf dem Bildschirm, um einen Key Store zu erstellen und Ihre Anwendung zu signieren.
    - Nach Abschluss des Builds finden Sie die `app-release.apk`-Datei in `android/app/release`.

### 4. Build für iOS (Capacitor)

1.  **Projekt synchronisieren:**
    ```bash
    npm run sync:ios
    ```
2.  **In Xcode öffnen:**
    ```bash
    npm run open:ios
    ```
3.  **App archivieren und verteilen:**
    - Wählen Sie in Xcode `Any iOS Device (arm64)` als Ziel.
    - Gehen Sie zu `Product > Archive`.
    - Nach Abschluss der Archivierung wird das Organizer-Fenster geöffnet. Von dort aus können Sie Ihre App verteilen (für Tests oder den App Store).

### 5. Build als Progressive Web App (PWA)

Das Projekt ist bereits als PWA konfiguriert. Nach dem Ausführen von `npm run build` befinden sich alle erforderlichen Dateien im Verzeichnis `dist`. Sie können dieses Verzeichnis auf jedem statischen Webhost (wie Vercel, Netlify oder GitHub Pages) hosten, um die Anwendung als Web-App bereitzustellen.

---

Entwickelt von **Seyed Javad Dehnavi**. Für weitere Anwendungen besuchen Sie meinen Telegram-Kanal: [t.me/Jey_Box](https://t.me/Jey_Box).
