# Finansal Takip Uygulaması

Finansal hedeflerinizi takip etmek, harcamalarınızı yönetmek ve tasarruf hedeflerinizi gerçekleştirmek için geliştirilmiş kapsamlı bir mobil uygulama.

## 🎯 Yeni Özellikler ve İyileştirmeler

### 🔄 Animasyonlu Geçişler ve İyileştirilmiş Gezinme

- Sayfa geçişlerinde düzgün ve etkileyici animasyonlar
- Tab navigasyonu için optimize edilmiş geçiş efektleri
- Modal ve bottom sheet bileşenlerinde akıcı animasyonlar

### 🃏 Animasyonlu Bileşenler

- **AnimatedCard**: Çeşitli animasyon türleri (fade, slide, zoom) destekleyen kart bileşeni
- **ErrorModal**: Kullanıcı dostu hata bildirimleri için animasyonlu modal
- **BudgetOverview**: Bütçe bilgilerini sürekli güncellenen animasyonlarla gösterme
- **SavingsOverview**: Tasarruf hedeflerini hareketli grafiklerle görselleştirme
- **ExpenseOverview**: Harcama kategorilerini pasta grafiği ve animasyonlu geçişlerle gösterme
- **TransactionsOverview**: Son işlemler listesinde kayan animasyonlar

### 🎨 Kullanıcı Deneyimi İyileştirmeleri

- Dokunmatik geri bildirim (Haptic Feedback) ile geliştirilmiş bildirimler
- Tema geçişleri sırasında düzgün animasyonlar
- Performans optimizasyonları
- Responsive tasarım ve tüm ekran boyutlarına uyum

## 🛠️ Gelecek İyileştirmeler ve Öneriler

1. **Performans İyileştirmeleri**:
   - Daha optimum re-render mekanizmaları
   - Gereksiz re-render'ların azaltılması için memo ve useCallback kullanımı

2. **Daha Gelişmiş Animasyonlar**:
   - Gelişmiş paralaks etkiler
   - Kaydırma bazlı animasyonlar
   - Gesture (hareket) bazlı etkileşimler

3. **Erişilebilirlik İyileştirmeleri**:
   - Animasyonları devre dışı bırakma seçeneği
   - Renk kontrast ayarları
   - Daha büyük dokunma hedefleri

4. **Test ve Hata Ayıklama**:
   - Animasyon birimlerinin UI testleri
   - Performans ölçümlemeleri

## 📋 API Dokümantasyonu

### AnimatedCard

```jsx
<AnimatedCard 
  animationType="fade|slide|zoom|none" 
  index={0} 
  delay={100} 
  duration={400}
  onAnimationComplete={() => {}}
>
  {/* İçerik */}
</AnimatedCard>
```

### ErrorModal

```jsx
<ErrorModal
  visible={true}
  title="Hata Başlığı"
  message="Hata mesajı içeriği"
  onDismiss={() => {}}
  retryAction={() => {}}
/>
```

## 🚀 Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

2. Uygulamayı başlatın:
   ```
   npx expo start
   ```

3. Expo Go uygulamasını kullanarak mobil cihazınızda test edin veya iOS/Android emülatörü başlatın.

## 📝 Notlar

- React Native Reanimated 3.0+ gerektirir
- Expo SDK 49+ gerektirir
- iOS ve Android platformlarında test edilmiştir

---

## 📊 Ekran Görüntüleri

(Ekran görüntüleri buraya eklenecek)
