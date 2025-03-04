# React Native Paper Entegrasyonu

Bu proje React Native Paper kütüphanesini kullanarak modern bir kullanıcı arayüzü sağlamaktadır.

## Entegrasyon Özeti

React Native Paper entegrasyonu aşağıdaki temel bileşenleri içermektedir:

- **Tema Sistemi**: Aydınlık/karanlık mod desteği ve özelleştirilmiş renkler
- **Tipografi Sistemi**: Tutarlı metin stillerı ve boyutları
- **UI Bileşenleri**: Modern ve material tasarım standartlarına uygun bileşenler
- **İkon Sistemi**: Çeşitli icon kütüphanelerine destek veren yapı

## Yapılandırma Dosyaları

React Native Paper tema yapılandırması aşağıdaki dosyalarda bulunmaktadır:

- `constants/PaperTheme.ts`: Renk şemaları, tipografi ve tema yapılandırması
- `context/ThemeContext.tsx`: Tema durumu yönetimi ve geçişleri
- `components/ThemedText.tsx`: Tipografi bileşenleri
- `components/ui/PaperComponents.tsx`: Temel UI bileşenleri
- `components/ui/ThemeIcon.tsx`: İkon sistemi

## Bileşenler

React Native Paper, aşağıdaki bileşenleri sağlamaktadır:

- **Card**: Bilgileri gruplamak için kartlar
- **Button**: Farklı tiplerde butonlar (contained, outlined, text)
- **TextField**: Giriş alanları
- **Typography**: Metin bileşenleri ve hiyerarşisi
- **Checkbox, Radio, Switch**: Form elemanları
- **Lists**: Liste bileşenleri
- **Dialog, Modal, Snackbar**: Bildirim bileşenleri
- **Chip**: Etiket ve seçim bileşenleri

## İkon Kullanımı

İkon kullanımı için `ThemeIcon` bileşeni aşağıdaki kütüphanelerle uyumludur:

- Material Icons
- Material Community Icons
- Font Awesome
- Ionicons
- ve daha fazlası...

```typescript
<ThemeIcon name="home" type="material" size={24} color={colors.primary} />
```

## Dönüşüm Listesi

Aşağıdaki bileşenler React Native Paper'a taşınmıştır:

- [x] Tema sistemi
- [x] ThemedText bileşeni
- [x] IconSymbol adaptör bileşeni
- [x] EmptyState bileşeni
- [x] ExpenseOverview bileşeni 
- [x] Tab layout yapısı

Dönüştürülecek diğer bileşenler:

- [ ] TransactionsOverview bileşeni
- [ ] SavingsOverview bileşeni
- [ ] Expenses ekranları
- [ ] Savings ekranları
- [ ] Onboarding ekranı
- [ ] Form bileşenleri
- [ ] Dialog bileşenleri

## Demo Ekranı

ThemeDemoScreen bileşeni, React Native Paper entegrasyonunu göstermek için kullanılabilir. Bu bileşen, tipografi, butonlar, kartlar ve diğer UI bileşenlerini sergilemektedir.

## Kaynaklar

- [React Native Paper Dökümantasyonu](https://callstack.github.io/react-native-paper/)
- [Material Design Rehberi](https://material.io/design)
