# JeyPass Güvenli Kasa 🇹🇷

![JeyPass Screenshot](https://raw.githubusercontent.com/dehnavi97/jeyPass/main/screenshot/tr.png)

**JeyPass**, basitlik ve güvenlik göz önünde bulundurularak tasarlanmış modern, güvenli ve çevrimdışı çalışabilen bir şifre yöneticisidir. Verilerinizi korumak için güçlü şifreleme (AES-GCM) kullanır ve kimlik bilgilerinize yalnızca ana şifrenizle erişebilmenizi sağlar. Next.js, Electron ve Capacitor ile oluşturulmuş olup, **Windows, macOS, Linux, Android ve iOS** platformlarında sorunsuz bir deneyim sunar.

**GitHub Deposu:** [https://github.com/dehnavi97/jeyPass](https://github.com/dehnavi97/jeyPass)

---

## ✨ Ana Özellikler

- **Önce Çevrimdışı:** Tamamen çevrimdışı çalışır. Verileriniz yerel olarak ve güvenli bir şekilde cihazınızda saklanır.
- **Güçlü Şifreleme:** Tüm kasanızı şifrelemek için AES-256-GCM kullanır. Verileriniz ana şifreniz olmadan okunamaz.
- **Çapraz Platform:**
    - **Masaüstü (Windows, macOS, Linux):** Electron kullanarak yerel bir masaüstü uygulaması olarak çalışır.
    - **Mobil (Android, iOS):** Capacitor kullanarak yerel bir mobil uygulama olarak çalışır.
- **Modern Kullanıcı Arayüzü:**
  - Yüzen eylem menüsüne sahip temiz, sezgisel ve temalandırılabilir bir kullanıcı arayüzü.
  - **Temalar:** Deneyiminizi özelleştirmek için Açık, Koyu, Okyanus, Çöl, Lal ve Orman temaları.
  - Masaüstü uygulaması için özel sürüklenebilir başlık çubuğu ve pencere durumu kalıcılığı.
- **TOTP Desteği:** Hesaplarınız için Zaman Tabanlı Tek Kullanımlık Şifreler (2FA kodları) oluşturun ve görüntüleyin.
- **Güçlü Şifre Oluşturucu:** Güçlü, rastgele ve özelleştirilebilir şifreler oluşturun.
- **Güvenli Paylaşım:** Kimlik bilgilerini QR kodu aracılığıyla güvenli bir şekilde paylaşın.
- **Yedekleme ve Geri Yükleme:** Şifrelenmiş kasanızı kolayca yedekleyin ve gerektiğinde geri yükleyin, çapraz platform desteği (Masaüstü ve Mobil) ile.
- **Otomatik Kilit Zamanlayıcısı:** Güvenliği artırmak için duraklatılabilir bir otomatik kilit zamanlayıcısı.
- **Çoklu Dil Desteği:** İngilizce, Farsça, Arapça, Fransızca, Türkçe ve Almanca dillerinde tam olarak mevcuttur.

## 🛠️ Kullanılan Teknolojiler

- **Çatı:** Next.js 14 (App Router)
- **Masaüstü:** Electron
- **Mobil:** Capacitor
- **Dil:** TypeScript
- **Stil:** Tailwind CSS
- **UI Bileşenleri:** ShadCN UI
- **Uluslararasılaştırma:** i18next
- **Şifreleme:** Web Crypto API (AES-256-GCM)

## 🚀 Başlarken

Projeyi yerel geliştirme için kurmak için bu adımları izleyin.

### 1. Ön Koşullar

- [Node.js](https://nodejs.org/) (v18 veya üstü)
- npm veya yarn
- Android geliştirme için: [Android Studio](https://developer.android.com/studio)
- iOS geliştirme için: [Xcode](https://developer.apple.com/xcode/) ve [CocoaPods](https://cocoapods.org/)

### 2. Depoyu Klonlayın

```bash
git clone https://github.com/dehnavi97/jeyPass.git
cd jeyPass
```

### 3. Bağımlılıkları Yükleyin

```bash
npm install
```

### 4. Geliştirme Modunda Çalıştırın

- **Electron için (Masaüstü):**
  Uygulamayı anında yeniden yükleme ile geliştirme modunda çalıştırmak için:
  ```bash
  npm run dev:electron
  ```

- **Android için:**
  1. Web yapınızı Android projesiyle senkronize edin:
     ```bash
     npm run sync:android
     ```
  2. Android projesini Android Studio'da açın:
     ```bash
     npm run open:android
     ```
  3. Android Studio'da uygulamayı bir emülatörde veya bağlı bir cihazda çalıştırın.

- **iOS için:**
  1. iOS platformunu ekleyin (zaten ekli değilse):
     ```bash
     npx cap add ios
     ```
  2. Web yapınızı iOS projesiyle senkronize edin:
     ```bash
     npm run sync:ios
     ```
  3. iOS projesini Xcode'da açın:
     ```bash
     npm run open:ios
     ```
  4. Xcode'da uygulamayı bir simülatörde veya bağlı bir iPhone'da çalıştırın.

## 📦 Üretim için Derleme

### 1. İkonları Hazırlama (Önemli İlk Adım)

1.  Uygulama ikonunuzu **1024x1024** çözünürlükte oluşturun ve `assets/icon.png` olarak kaydedin.
2.  (İsteğe bağlı) Koyu mod için bir ikonu `assets/icon-dark.png` ve bir açılış ekranı arka planını `assets/splash.png` olarak oluşturabilirsiniz.
3.  Tüm ikon boyutlarını ve açılış ekranlarını otomatik olarak oluşturmak için aşağıdaki komutu çalıştırın:
    ```bash
    npm run assets:generate
    ```

### 2. Masaüstü için Derleme (Electron)

- **Windows için:** (Windows üzerinde çalıştırılmalıdır)
  ```bash
  npm run build:electron
  ```
  Yükleyici (`.exe`) `release` dizininde olacaktır.

- **macOS için:** (macOS üzerinde çalıştırılmalıdır)
  ```bash
  npm run build:electron
  ```
  Yükleyici (`.dmg`) `release` dizininde olacaktır.

- **Linux için:**
  ```bash
  npm run build:electron
  ```
  Yükleyici (`.AppImage`) `release` dizininde olacaktır.

### 3. Android için Derleme (Capacitor)

1.  **Projeyi Senkronize Edin:**
    ```bash
    npm run sync:android
    ```
2.  **Android Studio'da Açın:**
    ```bash
    npm run open:android
    ```
3.  **İmzalı APK Oluşturun:**
    - Android Studio'da, `Build > Generate Signed Bundle / APK...` bölümüne gidin.
    - **APK**'yı seçin, ardından bir anahtar deposu oluşturmak ve uygulamanızı imzalamak için ekrandaki talimatları izleyin.
    - Derleme tamamlandıktan sonra, `app-release.apk` dosyasını `android/app/release` içinde bulabilirsiniz.

### 4. iOS için Derleme (Capacitor)

1.  **Projeyi Senkronize Edin:**
    ```bash
    npm run sync:ios
    ```
2.  **Xcode'da Açın:**
    ```bash
    npm run open:ios
    ```
3.  **Uygulamayı Arşivleyin ve Dağıtın:**
    - Xcode'da, derleme hedefi olarak `Any iOS Device (arm64)` seçin.
    - `Product > Archive` bölümüne gidin.
    - Arşivleme tamamlandıktan sonra, Organizer penceresi açılacaktır. Uygulamanızı buradan dağıtabilirsiniz (test veya App Store için).

### 5. Aşamalı Web Uygulaması (PWA) olarak Derleme

Proje zaten bir PWA olarak yapılandırılmıştır. `npm run build` komutunu çalıştırdıktan sonra, gerekli tüm dosyalar `dist` dizininde bulunur. Uygulamayı bir web uygulaması olarak sunmak için bu dizini herhangi bir statik web sunucusunda (Vercel, Netlify veya GitHub Pages gibi) barındırabilirsiniz.

---

**Seyed Javad Dehnavi** tarafından geliştirildi. Daha fazla uygulama için Telegram kanalımı ziyaret edin: [t.me/Jey_Box](https://t.me/Jey_Box).
