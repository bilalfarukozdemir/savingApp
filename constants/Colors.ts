/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Light Theme
const primaryLight = '#3070F0';   // Daha canlı bir mavi
const secondaryLight = '#5856D6'; // Mor
const accentLight = '#FF9500';    // Turuncu
const successLight = '#34C759';   // Yeşil
const errorLight = '#FF3B30';     // Kırmızı
const warningLight = '#FFCC00';   // Sarı
const infoLight = '#5AC8FA';      // Açık mavi

// Dark Theme
const primaryDark = '#4890F8';    // Daha parlak mavi
const secondaryDark = '#6866E9';  // Parlak mor
const accentDark = '#FF9F0A';     // Parlak turuncu
const successDark = '#30D158';    // Parlak yeşil
const errorDark = '#FF453A';      // Parlak kırmızı
const warningDark = '#FFD60A';    // Parlak sarı
const infoDark = '#64D2FF';       // Parlak açık mavi

export const Colors = {
  light: {
    // Ana renkler
    primary: primaryLight,
    secondary: secondaryLight,
    accent: accentLight,
    success: successLight,
    error: errorLight,
    warning: warningLight,
    info: infoLight,
    
    // Metin ve arka plan renkleri
    text: '#11181C',          // Koyu metin
    textSecondary: '#4D5A66', // İkincil metin
    textMuted: '#687076',     // Soluk metin
    background: '#FFFFFF',    // Ana arka plan
    backgroundSecondary: '#F8F9FA', // İkincil arka plan
    backgroundTertiary: '#EFF1F3', // Üçüncül arka plan
    
    // UI bileşenleri
    card: '#FFFFFF',          // Kart arka planı
    input: '#FFFFFF',         // Giriş alanı
    border: '#E6E8EB',        // Kenarlık
    borderSecondary: '#DFE3E6', // İkincil kenarlık
    divider: '#EFF1F3',       // Ayırıcı
    
    // Navigasyon ve durum
    tint: primaryLight,
    tabIconDefault: '#687076',
    tabIconSelected: primaryLight,
    statusBarStyle: 'dark',
    
    // Efektler
    shadow: '#0000001A',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Diğer
    icon: '#687076',
    placeholderText: '#A3ACB2',
  },
  dark: {
    // Ana renkler
    primary: primaryDark,
    secondary: secondaryDark,
    accent: accentDark,
    success: successDark,
    error: errorDark,
    warning: warningDark,
    info: infoDark,
    
    // Metin ve arka plan renkleri
    text: '#ECEDEE',          // Açık metin
    textSecondary: '#B1B8BF', // İkincil metin
    textMuted: '#9BA1A6',     // Soluk metin
    background: '#151718',    // Ana arka plan
    backgroundSecondary: '#1E1F20', // İkincil arka plan
    backgroundTertiary: '#27292A', // Üçüncül arka plan
    
    // UI bileşenleri
    card: '#1E1F20',          // Kart arka planı
    input: '#27292A',         // Giriş alanı
    border: '#2D2E2F',        // Kenarlık
    borderSecondary: '#3A3B3C', // İkincil kenarlık
    divider: '#27292A',       // Ayırıcı
    
    // Navigasyon ve durum
    tint: primaryDark,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryDark,
    statusBarStyle: 'light',
    
    // Efektler
    shadow: '#00000033',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Diğer
    icon: '#9BA1A6',
    placeholderText: '#686B6E',
  },
};
