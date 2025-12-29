# JeyPass Secure Vault 🇫🇷

![JeyPass Screenshot](https://raw.githubusercontent.com/dehnavi97/jeyPass/main/screenshot/fr.png)

**JeyPass** est un gestionnaire de mots de passe moderne, sécurisé et fonctionnant hors ligne, conçu dans un souci de simplicité et de sécurité. Il utilise un cryptage fort (AES-GCM) pour protéger vos données, garantissant que vous seul pouvez accéder à vos identifiants avec un mot de passe principal. Construit avec Next.js, Electron et Capacitor, il offre une expérience transparente sur les plateformes **Windows, macOS, Linux, Android et iOS**.

**Dépôt GitHub:** [https://github.com/dehnavi97/jeyPass](https://github.com/dehnavi97/jeyPass)

---

## ✨ Fonctionnalités Clés

- **Hors Ligne d'Abord:** Fonctionne complètement hors ligne. Vos données sont stockées localement et en toute sécurité sur votre appareil.
- **Cryptage Fort:** Utilise AES-256-GCM pour crypter l'intégralité de votre coffre-fort. Vos données sont illisibles sans votre mot de passe principal.
- **Multiplateforme:**
    - **Bureau (Windows, macOS, Linux):** Fonctionne comme une application de bureau native avec Electron.
    - **Mobile (Android, iOS):** Fonctionne comme une application mobile native avec Capacitor.
- **Interface Utilisateur Moderne:**
  - Une interface utilisateur propre, intuitive et thématique avec un menu d'action flottant.
  - **Thèmes:** Thèmes Clair, Sombre, Océan, Désert, Grenat et Forêt pour personnaliser votre expérience.
  - Barre de titre personnalisée et déplaçable, et persistance de l'état de la fenêtre pour l'application de bureau.
- **Support TOTP:** Générez et affichez des mots de passe à usage unique basés sur le temps (codes 2FA) pour vos comptes.
- **Générateur de Mots de Passe Forts:** Créez des mots de passe forts, aléatoires et personnalisables.
- **Partage Sécurisé:** Partagez des identifiants en toute sécurité via un code QR.
- **Sauvegarde et Restauration:** Sauvegardez facilement votre coffre-fort crypté et restaurez-le en cas de besoin, avec un support multiplateforme (Bureau & Mobile).
- **Minuterie de Verrouillage Automatique:** Une minuterie de verrouillage automatique pouvant être mise en pause pour améliorer la sécurité.
- **Support Multilingue:** Entièrement disponible en anglais, persan, arabe, français, turc et allemand.

## 🛠️ Technologies Utilisées

- **Framework:** Next.js 14 (App Router)
- **Bureau:** Electron
- **Mobile:** Capacitor
- **Langage:** TypeScript
- **Style:** Tailwind CSS
- **Composants UI:** ShadCN UI
- **Internationalisation:** i18next
- **Cryptage:** Web Crypto API (AES-256-GCM)

## 🚀 Pour Commencer

Suivez ces étapes pour configurer le projet pour le développement local.

### 1. Prérequis

- [Node.js](https://nodejs.org/) (v18 ou ultérieure)
- npm ou yarn
- Pour le développement Android : [Android Studio](https://developer.android.com/studio)
- Pour le développement iOS : [Xcode](https://developer.apple.com/xcode/) et [CocoaPods](https://cocoapods.org/)

### 2. Cloner le Dépôt

```bash
git clone https://github.com/dehnavi97/jeyPass.git
cd jeyPass
```

### 3. Installer les Dépendances

```bash
npm install
```

### 4. Exécuter en Mode Développement

- **Pour Electron (Bureau):**
  Pour exécuter l'application en mode développement avec rechargement à chaud :
  ```bash
  npm run dev:electron
  ```

- **Pour Android:**
  1. Synchronisez votre build web avec le projet Android :
     ```bash
     npm run sync:android
     ```
  2. Ouvrez le projet Android dans Android Studio :
     ```bash
     npm run open:android
     ```
  3. Dans Android Studio, exécutez l'application sur un émulateur ou un appareil connecté.

- **Pour iOS:**
  1. Ajoutez la plateforme iOS (si ce n'est pas déjà fait) :
     ```bash
     npx cap add ios
     ```
  2. Synchronisez votre build web avec le projet iOS :
     ```bash
     npm run sync:ios
     ```
  3. Ouvrez le projet iOS dans Xcode :
     ```bash
     npm run open:ios
     ```
  4. Dans Xcode, exécutez l'application sur un simulateur ou un iPhone connecté.

## 📦 Construire pour la Production

### 1. Préparer les Icônes (Première Étape Importante)

1.  Créez votre icône d'application en **1024x1024** et enregistrez-la sous `assets/icon.png`.
2.  (Optionnel) Vous pouvez créer une icône pour le mode sombre sous `assets/icon-dark.png` et un fond d'écran de démarrage sous `assets/splash.png`.
3.  Exécutez la commande suivante pour générer automatiquement toutes les tailles d'icônes et les écrans de démarrage :
    ```bash
    npm run assets:generate
    ```

### 2. Construire pour le Bureau (Electron)

- **Pour Windows:** (Doit être exécuté sur Windows)
  ```bash
  npm run build:electron
  ```
  L'installateur (`.exe`) se trouvera dans le répertoire `release`.

- **Pour macOS:** (Doit être exécuté sur macOS)
  ```bash
  npm run build:electron
  ```
  L'installateur (`.dmg`) se trouvera dans le répertoire `release`.

- **Pour Linux:**
  ```bash
  npm run build:electron
  ```
  L'installateur (`.AppImage`) se trouvera dans le répertoire `release`.

### 3. Construire pour Android (Capacitor)

1.  **Synchroniser le Projet:**
    ```bash
    npm run sync:android
    ```
2.  **Ouvrir dans Android Studio:**
    ```bash
    npm run open:android
    ```
3.  **Générer un APK Signé:**
    - Dans Android Studio, allez à `Build > Generate Signed Bundle / APK...`.
    - Sélectionnez **APK**, puis suivez les instructions à l'écran pour créer un "key store" et signer votre application.
    - Une fois la construction terminée, vous pouvez trouver le fichier `app-release.apk` dans `android/app/release`.

### 4. Construire pour iOS (Capacitor)

1.  **Synchroniser le Projet:**
    ```bash
    npm run sync:ios
    ```
2.  **Ouvrir dans Xcode:**
    ```bash
    npm run open:ios
    ```
3.  **Archiver et Distribuer l'Application:**
    - Dans Xcode, sélectionnez `Any iOS Device (arm64)` comme cible de construction.
    - Allez à `Product > Archive`.
    - Une fois l'archivage terminé, la fenêtre de l'organisateur s'ouvrira. Vous pouvez distribuer votre application (pour des tests ou l'App Store) à partir de là.

### 5. Construire en tant qu'Application Web Progressive (PWA)

Le projet est déjà configuré comme une PWA. Après avoir exécuté `npm run build`, tous les fichiers nécessaires se trouvent dans le répertoire `dist`. Vous pouvez héberger ce répertoire sur n'importe quel hébergeur web statique (comme Vercel, Netlify ou GitHub Pages) pour servir l'application en tant qu'application web.

---

Développé par **Seyed Javad Dehnavi**. Pour plus d'applications, visitez ma chaîne Telegram : [t.me/Jey_Box](https://t.me/Jey_Box).
