# savingApp

Kişisel bütçe, harcama ve tasarruf hedefi takibi için React Native (Expo)
uygulaması. Tüm veri cihazda kalır — sunucu yok, hesap yok, kayıt yok.

Tasarruf hedefi koy, harcamalarını kategorilere ayır, aylık bütçenin ne
kadarını harcadığını tek ekranda gör.

<details>
<summary><b>In English</b></summary>

A React Native (Expo) app for personal budgeting, expense tracking and savings
goals. All data stays on the device via AsyncStorage — no server, no account,
no sign-up. Built with Expo Router, React Native Paper and Reanimated. The UI
is in Turkish.

</details>

---

## Çalıştırma

```
git clone https://github.com/bilalfarukozdemir/savingApp.git
cd savingApp
npm install
npx expo start
```

Telefonda **Expo Go** ile QR kodu okut; ya da `a` / `i` ile emülatörde aç.

```
npm test        # jest-expo
npm run lint
```

## Ekranlar

```
onboarding                ilk açılışta kurulum
(tabs)/index              panel — bütçe, tasarruf, harcama ve işlem özetleri
(tabs)/savings            tasarruf hedefleri listesi
savings/new               yeni hedef
savings/[id]              hedef detayı ve ilerleme
expenses/index            harcama listesi ve kategori analizi
expenses/new              yeni harcama
transactions              işlem geçmişi
```

## Kullanılanlar

| | |
|---|---|
| Çatı | Expo ~52, Expo Router |
| Arayüz | React Native Paper, @gorhom/bottom-sheet |
| Animasyon | Reanimated, özel `AnimatedCard` bileşeni |
| Yazı tipi | Inter (@expo-google-fonts) |
| Depolama | AsyncStorage — yalnızca cihazda |
| Geri bildirim | expo-haptics |
| Test | jest-expo |

## Veri ve gizlilik

Hiçbir veri cihazdan çıkmaz. Uygulamanın arka ucu yoktur; bütçe, harcama ve
hedefler `AsyncStorage` içinde saklanır.

Bunun karşılığı şu: **uygulamayı silersen veriler de gider.** Yedekleme ve
cihazlar arası eşitleme henüz yok.

## Bilinen sınırlar

- Yedekleme / dışa aktarma yok.
- Cihazlar arası eşitleme yok.
- Tek para birimi.
- Banka veya kart entegrasyonu yok; girişler elle yapılır.
- Arayüz ve kod içi tanımlayıcılar Türkçedir.

## Ayrıca

Geliştirme sürecinde yapılan arayüz ve animasyon iyileştirmelerinin ayrıntılı
dökümü [SUMMARY.md](SUMMARY.md) dosyasındadır.
