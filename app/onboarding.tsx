import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  SafeAreaView, 
  ScrollView, 
  Animated, 
  Dimensions, 
  Image, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFinance } from '@/context/FinanceContext';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme ?? 'light'];
  const { setUserProfile, completeOnboarding } = useFinance();
  
  // State for form values
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [incomeDay, setIncomeDay] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Validation states
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [incomeError, setIncomeError] = useState('');
  const [dayError, setDayError] = useState('');
  
  // Para birimi formatı için yardımcı fonksiyon
  const formatCurrency = (value: string) => {
    if (!value) return '';
    
    // Sadece sayıları al
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Sayıyı float'a çevir
    const floatValue = parseFloat(numericValue);
    
    if (isNaN(floatValue)) {
      return '';
    }
    
    // Türk Lirası formatında göster
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(floatValue);
  };
  
  // Yaş değiştiğinde çalışacak fonksiyon
  const handleAgeChange = (text: string) => {
    // Sadece rakamları kabul et
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Yaşın 999'dan büyük olamayacağını varsayalım
    if (numericValue.length <= 3) {
      setAge(numericValue);
    }
  };
  
  // Gelir değiştiğinde çalışacak fonksiyon
  const handleIncomeChange = (text: string) => {
    // Önce format temizlenir, sonra yeniden formatlanır
    const numericValue = text.replace(/[^0-9]/g, '');
    setMonthlyIncome(numericValue);
  };
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentStep]);
  
  const validate = () => {
    let isValid = true;
    
    // Validate name
    if (currentStep === 0) {
      if (!name.trim()) {
        setNameError('Lütfen adınızı girin');
        isValid = false;
      } else {
        setNameError('');
      }
    }
    
    // Validate age
    if (currentStep === 1) {
      const ageNum = parseInt(age);
      if (!age.trim() || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
        setAgeError('Lütfen geçerli bir yaş girin (1-120)');
        isValid = false;
      } else {
        setAgeError('');
      }
    }
    
    // Validate monthly income
    if (currentStep === 2) {
      const incomeNum = parseFloat(monthlyIncome);
      if (!monthlyIncome.trim() || isNaN(incomeNum) || incomeNum <= 0) {
        setIncomeError('Lütfen geçerli bir aylık gelir girin');
        isValid = false;
      } else {
        setIncomeError('');
      }
    }
    
    // Validate income day
    if (currentStep === 3) {
      const dayNum = parseInt(incomeDay);
      if (!incomeDay.trim() || isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
        setDayError('Lütfen geçerli bir gün girin (1-31)');
        isValid = false;
      } else {
        setDayError('');
      }
    }
    
    return isValid;
  };
  
  const handleNextStep = () => {
    if (validate()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (currentStep < 3) {
        // Fade out and slide down
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 50,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          setCurrentStep(currentStep + 1);
          // Fade in and slide up handled by useEffect
        });
      } else {
        handleSubmit();
      }
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Fade out and slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        // Fade in and slide down handled by useEffect
      });
    }
  };
  
  const handleSubmit = () => {
    if (validate()) {
      setIsSubmitting(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Create user profile object
      const userProfile = {
        name: name.trim(),
        age: parseInt(age),
        monthlyIncome: parseFloat(monthlyIncome),
        incomeDay: parseInt(incomeDay),
        isOnboardingCompleted: true
      };
      
      // Save user profile to context
      setUserProfile(userProfile);
      completeOnboarding();
      
      // Navigate to home screen
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    }
  };
  
  const renderProgressBar = () => {
    const steps = 4;
    const progress = (currentStep + 1) / steps;
    
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.background }]}>
          <View 
            style={[
              styles.progress, 
              { 
                width: `${progress * 100}%`,
                backgroundColor: colors.primary 
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {currentStep + 1}/{steps}
        </Text>
      </View>
    );
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Adınız Nedir?
            </Text>
            <Text style={[styles.stepDescription, { color: colors.text }]}>
              Size nasıl hitap etmemizi istersiniz?
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  borderColor: nameError ? 'red' : colors.border,
                  color: colors.text,
                  backgroundColor: colors.card
                }
              ]}
              placeholder="Adınızı girin"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </Animated.View>
        );
        
      case 1:
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Yaşınız
            </Text>
            <Text style={[styles.stepDescription, { color: colors.text }]}>
              Yaşınızı öğrenmek, finansal tavsiyelerimizi kişiselleştirmemize yardımcı olur.
            </Text>
            
            <View style={styles.inputContainer}>
              <View style={[styles.ageInputWrapper, { backgroundColor: colors.card, borderColor: ageError ? 'red' : colors.border }]}>
                <TextInput
                  style={[styles.ageInput, { color: colors.text }]}
                  placeholder="Yaş"
                  placeholderTextColor={colors.textMuted}
                  value={age}
                  onChangeText={handleAgeChange}
                  keyboardType="numeric"
                  maxLength={3}
                  autoFocus
                />
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>yıl</Text>
              </View>
            </View>
            
            {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
            
            <Text style={[styles.inputInfoText, { color: colors.textMuted }]}>
              Finansal planlama için yaş önemli bir faktördür. Yaşınıza uygun tasarruf önerileri sunabilmemiz için bu bilgiye ihtiyacımız var.
            </Text>
          </Animated.View>
        );
        
      case 2:
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Aylık Geliriniz
            </Text>
            <Text style={[styles.stepDescription, { color: colors.text }]}>
              Daha doğru bütçe önerileri için aylık gelirinizi paylaşın.
            </Text>
            
            <View style={styles.inputContainer}>
              <View style={[styles.currencyInputWrapper, { backgroundColor: colors.card, borderColor: incomeError ? 'red' : colors.border }]}>
                <Text style={[styles.currencySymbol, { color: colors.text }]}>₺</Text>
                <TextInput
                  style={[styles.currencyInput, { color: colors.text }]}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={monthlyIncome ? formatCurrency(monthlyIncome).replace('₺', '').trim() : ''}
                  onChangeText={handleIncomeChange}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
            </View>
            
            {incomeError ? <Text style={styles.errorText}>{incomeError}</Text> : null}
            
            <Text style={[styles.inputInfoText, { color: colors.textMuted }]}>
              Geliriniz, aylık bütçe planlaması ve tasarruf hedeflerinizi belirlemek için kullanılacaktır. Bu bilgi gizli tutulacaktır.
            </Text>
          </Animated.View>
        );
        
      case 3:
        return (
          <Animated.View 
            style={[
              styles.stepContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Maaş Günü
            </Text>
            <Text style={[styles.stepDescription, { color: colors.text }]}>
              Gelirinizin hangi gün hesabınıza yatırıldığını belirtin. Bu bilgi, otomatik bakiye güncelleme için kullanılacaktır.
            </Text>
            <View style={styles.inputContainer}>
              <View style={[styles.dayInputWrapper, { backgroundColor: colors.card, borderColor: dayError ? 'red' : colors.border }]}>
                <TextInput
                  style={[styles.dayInput, { color: colors.text }]}
                  placeholder="Gün"
                  placeholderTextColor={colors.textMuted}
                  value={incomeDay}
                  onChangeText={(text) => {
                    // Sadece rakamları kabul et ve 31'den büyük olamaz
                    const numericValue = text.replace(/[^0-9]/g, '');
                    const dayNum = parseInt(numericValue);
                    if (!numericValue || (dayNum >= 1 && dayNum <= 31)) {
                      setIncomeDay(numericValue);
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                  autoFocus
                />
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>her ay</Text>
              </View>
            </View>
            
            {dayError ? <Text style={styles.errorText}>{dayError}</Text> : null}
            
            <Text style={[styles.inputInfoText, { color: colors.textMuted }]}>
              Bu tarihte, aylık geliriniz otomatik olarak bakiyenize eklenecektir. Bu sayede finansal durumunuzu daha kolay takip edebilirsiniz.
            </Text>
          </Animated.View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.welcomeHeader,
              { backgroundColor: colors.primary }
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/icon.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={styles.welcomeTitle}>
                Meet the AI-powered Budget and Savings App!
              </Text>
              
              <Text style={styles.welcomeSubtitle}>
                Akıllı finansal asistanınız ile tasarruflarınızı yönetin ve finansal hedeflerinize ulaşın
              </Text>
            </View>
            
            <View style={styles.spacer} />
            
            <View style={styles.welcomeWave}>
              <Svg
                height="50"
                width={width}
                viewBox={`0 0 ${width} 50`}
                style={styles.waveSvg}
              >
                <Path
                  d={`M0 25h${width/4}c${width/6} 0 ${width/3} -25 ${width/2} -25s${width/3} 25 ${width/2} 25h${width/4}v25H0z`}
                  fill={colors.background}
                />
              </Svg>
            </View>
          </Animated.View>
          
          {renderProgressBar()}
          
          {renderStep()}
          
          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.backButton, { borderColor: colors.border }]}
                onPress={handlePrevStep}
                disabled={isSubmitting}
              >
                <Text style={[styles.backButtonText, { color: colors.text }]}>Geri</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                { backgroundColor: colors.primary },
                isSubmitting && styles.disabledButton
              ]}
              onPress={handleNextStep}
              disabled={isSubmitting}
            >
              <Text style={styles.nextButtonText}>
                {currentStep < 3 ? 'Devam' : 'Tamamla'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
  },
  welcomeHeader: {
    width: '100%',
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    minHeight: 320,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 30,
    zIndex: 2,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  spacer: {
    height: 30,
  },
  welcomeWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    overflow: 'hidden',
    zIndex: 1,
  },
  waveSvg: {
    position: 'absolute',
    bottom: 0,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  stepContainer: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 10,
  },
  ageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  ageInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  currencyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
  },
  dayInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  dayInput: {
    width: 60,
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginLeft: 10,
  },
  inputInfoText: {
    fontSize: 14,
    marginTop: 15,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 