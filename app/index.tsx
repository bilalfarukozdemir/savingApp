import React from 'react';
import { Redirect } from 'expo-router';
import { useFinance } from '@/context/FinanceContext';

export default function IndexScreen() {
  const { userProfile } = useFinance();
  
  // Redirect bileşeni, sayfa yüklendiğinde otomatik olarak yönlendirme yapar
  // useEffect içinde router.replace kullanmak yerine bu yöntem daha güvenlidir
  
  // Kullanıcı daha önce onboarding'i tamamlamadıysa onboarding sayfasına yönlendir
  if (!userProfile || !userProfile.isOnboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }
  
  // Kullanıcı daha önce onboarding'i tamamlamışsa ana sayfaya yönlendir
  return <Redirect href="/(tabs)" />;
} 