/**
 * NutriCare-Oracle - Production-Grade Medical Locker
 * Modern UI with Professional Icons and Effects
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Linking,
  Image,
  Easing,
  LogBox,
} from 'react-native';

// Disable all LogBox notifications
LogBox.ignoreAllLogs(true);

// Suppress console warnings and errors for cleaner UI
const originalWarn = console.warn;
const originalError = console.error;
console.warn = (...args) => {
  // Only log in development, suppress in production
  if (__DEV__) {
    originalWarn(...args);
  }
};
console.error = (...args) => {
  // Only log in development, suppress in production
  if (__DEV__) {
    originalError(...args);
  }
};

import { BarChart, ProgressChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import MelangeService, { HealthInsightResponse } from './src/services/MelangeService';
import PrivacyService, { AnonymizedData } from './src/services/PrivacyService';
import BlockchainService, { IntegrityVerification } from './src/services/BlockchainService';
import WhisperService, { TranscriptionResult } from './src/services/WhisperService';
import VisionService, { VisionAnalysisResult } from './src/services/VisionService';

const { width, height } = Dimensions.get('window');

// Professional Icon Components
const IconUpload = ({ size = 24, color = '#6B7280' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconUploadArrow, { borderBottomColor: color }]} />
    <View style={[styles.iconUploadLine, { backgroundColor: color }]} />
  </View>
);

const IconAI = ({ size = 24, color = '#6B7280' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconAIBrain, { borderColor: color }]}>
      <View style={[styles.iconAIDot, { backgroundColor: color }]} />
      <View style={[styles.iconAIDot, { backgroundColor: color }]} />
      <View style={[styles.iconAIDot, { backgroundColor: color }]} />
    </View>
  </View>
);

const IconDoctor = ({ size = 24, color = '#6B7280' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconDoctorHead, { borderColor: color }]} />
    <View style={[styles.iconDoctorBody, { backgroundColor: color }]} />
    <View style={[styles.iconDoctorStethoscope, { borderColor: color }]} />
  </View>
);

const IconVerify = ({ size = 24, color = '#6B7280' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconVerifyShield, { borderColor: color }]}>
      <View style={[styles.iconVerifyCheck, { borderColor: color }]} />
    </View>
  </View>
);

const IconCamera = ({ size = 24, color = '#ffffff' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconCameraBody, { borderColor: color }]}>
      <View style={[styles.iconCameraLens, { borderColor: color }]} />
    </View>
  </View>
);

const IconGallery = ({ size = 24, color = '#ffffff' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconGalleryFrame, { borderColor: color }]} />
    <View style={[styles.iconGalleryImage, { backgroundColor: color }]} />
  </View>
);

const IconDocument = ({ size = 24, color = '#ffffff' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconDocumentPage, { borderColor: color }]}>
      <View style={[styles.iconDocumentLine, { backgroundColor: color }]} />
      <View style={[styles.iconDocumentLine, { backgroundColor: color }]} />
      <View style={[styles.iconDocumentLine, { backgroundColor: color }]} />
    </View>
  </View>
);

const IconMicrophone = ({ size = 24, color = '#ffffff' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconMicBody, { borderColor: color }]} />
    <View style={[styles.iconMicBase, { backgroundColor: color }]} />
  </View>
);

const IconEdit = ({ size = 24, color = '#ffffff' }) => (
  <View style={[styles.iconContainer, { width: size, height: size }]}>
    <View style={[styles.iconEditPencil, { backgroundColor: color }]} />
    <View style={[styles.iconEditTip, { backgroundColor: color }]} />
  </View>
);

interface UploadedDocument {
  name: string;
  content: string;
  hash: string;
  timestamp: Date;
  verified: boolean;
  metrics?: {
    glucose?: number;
    vitaminD?: number;
    cholesterol?: number;
    hemoglobin?: number;
  };
}

function App(): React.JSX.Element {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentTab, setCurrentTab] = useState<'upload' | 'insights' | 'verify' | 'doctor'>('upload');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [confettiVisible, setConfettiVisible] = useState(false);
  
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<UploadedDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  
  const [anonymizedData, setAnonymizedData] = useState<AnonymizedData | null>(null);
  const [healthInsights, setHealthInsights] = useState<HealthInsightResponse | null>(null);
  const [verificationResult, setVerificationResult] = useState<IntegrityVerification | null>(null);
  
  // Chatbot state
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Doctor approval state (HITL)
  const [doctorApproved, setDoctorApproved] = useState<{[key: string]: boolean}>({});
  const [doctorNotes, setDoctorNotes] = useState<{[key: string]: string}>({});
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [currentDoctorNote, setCurrentDoctorNote] = useState('');
  
  // Polygon modal state
  const [showPolygonModal, setShowPolygonModal] = useState(false);
  const polygonPulseAnim = useRef(new Animated.Value(1)).current;
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const waveAnim = useRef(new Animated.Value(1)).current;
  
  // Vision analysis state
  const [showVisionModal, setShowVisionModal] = useState(false);
  const [visionAnalysis, setVisionAnalysis] = useState<VisionAnalysisResult | null>(null);
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);
  
  // Real-time health monitoring state
  const [healthScore, setHealthScore] = useState(0);
  const [trendData, setTrendData] = useState<{glucose: number[], vitaminD: number[], cholesterol: number[]}>({
    glucose: [],
    vitaminD: [],
    cholesterol: []
  });
  const healthScoreAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  
  // Activity monitoring
  const [aiActivity, setAiActivity] = useState<{medgemma: boolean, whisper: boolean, vision: boolean}>({
    medgemma: false,
    whisper: false,
    vision: false
  });
  const activityPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Silent background initialization - no blocking, no alerts
    initializeServices().catch(err => {
      console.log('[Init] Background initialization in progress...');
      // Silently continue - app works in demo mode
    });
    
    // Smooth entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
    
    // Continuous floating animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { 
          toValue: 1, 
          duration: 3000, 
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true 
        }),
        Animated.timing(floatAnim, { 
          toValue: 0, 
          duration: 3000, 
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true 
        }),
      ])
    ).start();
    
    // Shimmer animation for loading states
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
    
    // Pulse animation for active elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { 
          toValue: 1.05, 
          duration: 1000, 
          useNativeDriver: true 
        }),
        Animated.timing(pulseAnim, { 
          toValue: 1, 
          duration: 1000, 
          useNativeDriver: true 
        }),
      ])
    ).start();
    
    // Sparkle animation for health score
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
      ])
    ).start();
  }, []);

  const initializeServices = async () => {
    // Silent initialization - no loading spinner on startup
    try {
      await Promise.all([
        MelangeService.initialize().catch(() => console.log('[MedGemma] Demo mode')),
        BlockchainService.initialize().catch(() => console.log('[Blockchain] Demo mode')),
        WhisperService.initialize().catch(() => console.log('[Whisper] Demo mode')),
        VisionService.initialize().catch(() => console.log('[Vision] Demo mode'))
      ]);
      setIsInitialized(true);
      console.log('✅ NutriCare Oracle ready');
    } catch (error) {
      console.log('[Init] Running in demo mode');
      setIsInitialized(true);
    }
  };

  const extractMetrics = (content: string): any => {
    const metrics: any = {};
    const glucoseMatch = content.match(/glucose[:\s]+(\d+)/i);
    if (glucoseMatch) metrics.glucose = parseInt(glucoseMatch[1]);
    const vitaminMatch = content.match(/vitamin\s*d[:\s]+(\d+)/i);
    if (vitaminMatch) metrics.vitaminD = parseInt(vitaminMatch[1]);
    const cholMatch = content.match(/cholesterol[:\s]+(\d+)/i);
    if (cholMatch) metrics.cholesterol = parseInt(cholMatch[1]);
    const hemoMatch = content.match(/hemoglobin[:\s]+([\d.]+)/i);
    if (hemoMatch) metrics.hemoglobin = parseFloat(hemoMatch[1]);
    return metrics;
  };
  
  const calculateHealthScore = (metrics: any): number => {
    if (!metrics || Object.keys(metrics).length === 0) return 0;
    
    let score = 100;
    
    // Glucose scoring (optimal: 70-100)
    if (metrics.glucose) {
      if (metrics.glucose > 100) score -= Math.min((metrics.glucose - 100) * 0.5, 20);
      if (metrics.glucose < 70) score -= Math.min((70 - metrics.glucose) * 0.8, 20);
    }
    
    // Vitamin D scoring (optimal: 30-100)
    if (metrics.vitaminD) {
      if (metrics.vitaminD < 30) score -= Math.min((30 - metrics.vitaminD) * 0.8, 20);
    }
    
    // Cholesterol scoring (optimal: <200)
    if (metrics.cholesterol) {
      if (metrics.cholesterol > 200) score -= Math.min((metrics.cholesterol - 200) * 0.3, 20);
    }
    
    // Hemoglobin scoring (optimal: 12-16)
    if (metrics.hemoglobin) {
      if (metrics.hemoglobin < 12) score -= Math.min((12 - metrics.hemoglobin) * 3, 15);
      if (metrics.hemoglobin > 16) score -= Math.min((metrics.hemoglobin - 16) * 2, 10);
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };
  
  const updateHealthScore = (metrics: any) => {
    const newScore = calculateHealthScore(metrics);
    setHealthScore(newScore);
    
    // Animate health score
    Animated.spring(healthScoreAnim, {
      toValue: newScore,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
    
    // Update trend data
    setTrendData(prev => ({
      glucose: [...prev.glucose.slice(-6), metrics.glucose || 0],
      vitaminD: [...prev.vitaminD.slice(-6), metrics.vitaminD || 0],
      cholesterol: [...prev.cholesterol.slice(-6), metrics.cholesterol || 0]
    }));
  };

  const handleUploadDocument = async () => {
    if (!docName.trim() || !docContent.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    setShowUploadModal(false);
    setIsLoading(true);
    setLoadingMessage('Processing document');
    
    try {
      let metrics = extractMetrics(docContent);
      if ((global as any).tempMetrics) {
        metrics = { ...metrics, ...(global as any).tempMetrics };
        delete (global as any).tempMetrics;
      }
      
      const content = `Medical Report: ${docName}\n\n${docContent}`;
      const hash = PrivacyService.generateHash({ content, name: docName });
      
      const doc: UploadedDocument = {
        name: docName,
        content,
        hash,
        timestamp: new Date(),
        verified: false,
        metrics
      };
      
      setLoadingMessage('Anchoring to blockchain');
      await BlockchainService.anchorHash(hash);
      doc.verified = true;
      
      setDocuments([...documents, doc]);
      setSelectedDoc(doc);
      
      // Update health score and show confetti
      updateHealthScore(metrics);
      setConfettiVisible(true);
      setTimeout(() => setConfettiVisible(false), 3000);
      
      Alert.alert('Success', `Document uploaded with ${Object.keys(metrics).length} metrics`);
      setDocName('');
      setDocContent('');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!selectedDoc) {
      Alert.alert('Error', 'Please select a document first');
      return;
    }

    console.log('[App] Analyzing document:', selectedDoc.name);
    setIsLoading(true);
    setLoadingMessage('Analyzing with AI');
    setAiActivity(prev => ({ ...prev, medgemma: true }));
    
    try {
      const anonymized = await PrivacyService.redactPII(selectedDoc.content);
      setAnonymizedData(anonymized);
      
      const insights = await MelangeService.generateHealthInsights({
        medicalData: anonymized.anonymized,
        query: 'Analyze this medical document comprehensively'
      });
      
      setHealthInsights(insights);
      Alert.alert('Complete', 'AI analysis ready');
      setCurrentTab('insights');
    } catch (error) {
      console.error('[App] Analysis failed:', error);
      Alert.alert('Error', `Analysis failed: ${error}`);
    } finally {
      setIsLoading(false);
      setAiActivity(prev => ({ ...prev, medgemma: false }));
    }
  };

  const handleVerifyIntegrity = async () => {
    if (!healthInsights) {
      Alert.alert('Error', 'No insights to verify');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Verifying on Polygon Amoy');
    
    try {
      const hash = PrivacyService.generateHash(healthInsights);
      const verification = await BlockchainService.verifyIntegrity(hash);
      setVerificationResult(verification);
      setIsLoading(false);
      
      // Show Polygon verification modal
      setShowPolygonModal(true);
    } catch (error) {
      console.error('Verification failed:', error);
      Alert.alert('Error', `Verification failed: ${error}`);
      setIsLoading(false);
    }
  };
  
  const handleChatMessage = async () => {
    if (!chatInput.trim() || !selectedDoc) {
      return;
    }
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages([...chatMessages, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);
    setAiActivity(prev => ({ ...prev, medgemma: true }));
    
    try {
      // Use MedGemma to answer questions about the document
      const response = await MelangeService.generateHealthInsights({
        medicalData: selectedDoc.content,
        query: userMessage
      });
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.insights }]);
    } catch (error) {
      console.error('[Chat] Failed:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process your question.' }]);
    } finally {
      setIsChatLoading(false);
      setAiActivity(prev => ({ ...prev, medgemma: false }));
    }
  };

  const handleChatVoiceInput = async () => {
    if (!selectedDoc) {
      Alert.alert('Error', 'Please select a document first');
      return;
    }
    
    try {
      console.log('[Chat Voice] Starting voice input...');
      
      const hasPermission = await WhisperService.hasAudioPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant microphone access to use voice input');
        return;
      }
      
      // Start recording
      console.log('[Chat Voice] Starting recording...');
      setIsRecording(true);
      setRecordingDuration(0);
      setAiActivity(prev => ({ ...prev, whisper: true }));
      
      await WhisperService.startRecording();
      console.log('[Chat Voice] Recording started');
      
      // Show alert to stop recording
      Alert.alert(
        'Voice Input',
        'Recording... Speak your question and tap Stop when done.',
        [
          {
            text: 'Stop',
            onPress: async () => {
              try {
                console.log('[Chat Voice] Stopping recording...');
                setIsRecording(false);
                
                // Clear timer if exists
                if ((global as any).chatRecordingTimer) {
                  clearInterval((global as any).chatRecordingTimer);
                  delete (global as any).chatRecordingTimer;
                }
                
                const audioRecording = await WhisperService.stopRecording();
                console.log('[Chat Voice] Recording stopped:', audioRecording);
                
                setIsChatLoading(true);
                console.log('[Chat Voice] Transcribing audio...');
                
                const transcription = await WhisperService.transcribeAudio(audioRecording.uri);
                console.log('[Chat Voice] Transcription:', transcription.text);
                
                // Send transcribed text to chatbot
                const userMessage = transcription.text;
                setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
                
                setAiActivity(prev => ({ ...prev, whisper: false, medgemma: true }));
                
                // Get AI response
                console.log('[Chat Voice] Getting AI response...');
                const response = await MelangeService.generateHealthInsights({
                  medicalData: selectedDoc.content,
                  query: userMessage
                });
                
                setChatMessages(prev => [...prev, { role: 'assistant', content: response.insights }]);
                console.log('[Chat Voice] Complete!');
                
                setIsChatLoading(false);
                setAiActivity(prev => ({ ...prev, medgemma: false }));
              } catch (error) {
                console.error('[Chat Voice] Failed:', error);
                Alert.alert('Error', `Voice input failed: ${error}`);
                setIsRecording(false);
                setIsChatLoading(false);
                setAiActivity({ medgemma: false, whisper: false, vision: false });
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: async () => {
              console.log('[Chat Voice] Cancelled');
              setIsRecording(false);
              setAiActivity(prev => ({ ...prev, whisper: false }));
              
              // Clear timer if exists
              if ((global as any).chatRecordingTimer) {
                clearInterval((global as any).chatRecordingTimer);
                delete (global as any).chatRecordingTimer;
              }
              
              try {
                await WhisperService.stopRecording();
              } catch (e) {
                console.error('[Chat Voice] Stop failed:', e);
              }
            }
          }
        ]
      );
      
      // Start recording timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Store timer reference
      (global as any).chatRecordingTimer = timer;
      
    } catch (error) {
      console.error('[Chat Voice] Failed to start:', error);
      Alert.alert('Error', `Failed to start voice recording: ${error}`);
      setIsRecording(false);
      setAiActivity(prev => ({ ...prev, whisper: false }));
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images, DocumentPicker.types.plainText],
      });
      
      if (result && result[0]) {
        const file = result[0];
        setIsLoading(true);
        setLoadingMessage('Processing document');
        
        let content = '';
        let extractedMetrics = {};
        
        if (file.type?.includes('image')) {
          try {
            const ocrResult = await MelangeService.extractTextFromImage(file.uri);
            content = `[Image Document: ${file.name}]\n\nExtracted Text:\n${ocrResult.text}`;
            extractedMetrics = ocrResult.extractedMetrics || {};
            setCurrentImageUri(file.uri); // Store for vision analysis
            Alert.alert('OCR Complete', `Extracted ${ocrResult.text.length} characters`);
          } catch (error) {
            console.error('OCR failed:', error);
            content = `[Image: ${file.name}]\nOCR processing failed`;
          }
        } else {
          content = `[Document: ${file.name}]\nType: ${file.type}\nSize: ${file.size} bytes`;
        }
        
        // Directly upload the document
        const name = file.name || 'Medical Document';
        const metrics = { ...extractMetrics(content), ...extractedMetrics };
        const fullContent = `Medical Report: ${name}\n\n${content}`;
        const hash = PrivacyService.generateHash({ content: fullContent, name });
        
        const doc: UploadedDocument = {
          name,
          content: fullContent,
          hash,
          timestamp: new Date(),
          verified: false,
          metrics
        };
        
        setLoadingMessage('Anchoring to blockchain');
        await BlockchainService.anchorHash(hash);
        doc.verified = true;
        
        setDocuments([...documents, doc]);
        setSelectedDoc(doc);
        
        // Update health score and show confetti
        updateHealthScore(metrics);
        setConfettiVisible(true);
        setTimeout(() => setConfettiVisible(false), 3000);
        
        Alert.alert('Success', `${name} uploaded with ${Object.keys(metrics).length} metrics`);
        setIsLoading(false);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Document picker error:', err);
        Alert.alert('Error', 'Failed to pick document');
      }
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: true });
      
      if (result.assets && result.assets[0]) {
        const photo = result.assets[0];
        setIsLoading(true);
        setLoadingMessage('Processing photo');
        
        try {
          const ocrResult = await MelangeService.extractTextFromImage(photo.uri!);
          const name = `Photo_${new Date().toISOString().split('T')[0]}`;
          const content = `[Photo Capture]\n\nExtracted Text:\n${ocrResult.text}`;
          
          setCurrentImageUri(photo.uri!); // Store for vision analysis
          
          // Directly upload
          const metrics = { ...extractMetrics(content), ...(ocrResult.extractedMetrics || {}) };
          const fullContent = `Medical Report: ${name}\n\n${content}`;
          const hash = PrivacyService.generateHash({ content: fullContent, name });
          
          const doc: UploadedDocument = {
            name,
            content: fullContent,
            hash,
            timestamp: new Date(),
            verified: false,
            metrics
          };
          
          setLoadingMessage('Anchoring to blockchain');
          await BlockchainService.anchorHash(hash);
          doc.verified = true;
          
          setDocuments([...documents, doc]);
          setSelectedDoc(doc);
          
          // Update health score and show confetti
          updateHealthScore(metrics);
          setConfettiVisible(true);
          setTimeout(() => setConfettiVisible(false), 3000);
          
          Alert.alert('Success', `Photo uploaded with ${Object.keys(metrics).length} metrics`);
        } catch (error) {
          console.error('OCR failed:', error);
          Alert.alert('Error', 'Failed to process photo');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Error', 'Failed to take photo');
      setIsLoading(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      
      if (result.assets && result.assets[0]) {
        const photo = result.assets[0];
        setIsLoading(true);
        setLoadingMessage('Processing image');
        
        try {
          const ocrResult = await MelangeService.extractTextFromImage(photo.uri!);
          const name = `Gallery_${new Date().toISOString().split('T')[0]}`;
          const content = `[Gallery Image]\n\nExtracted Text:\n${ocrResult.text}`;
          
          setCurrentImageUri(photo.uri!); // Store for vision analysis
          
          // Directly upload
          const metrics = { ...extractMetrics(content), ...(ocrResult.extractedMetrics || {}) };
          const fullContent = `Medical Report: ${name}\n\n${content}`;
          const hash = PrivacyService.generateHash({ content: fullContent, name });
          
          const doc: UploadedDocument = {
            name,
            content: fullContent,
            hash,
            timestamp: new Date(),
            verified: false,
            metrics
          };
          
          setLoadingMessage('Anchoring to blockchain');
          await BlockchainService.anchorHash(hash);
          doc.verified = true;
          
          setDocuments([...documents, doc]);
          setSelectedDoc(doc);
          
          // Update health score and show confetti
          updateHealthScore(metrics);
          setConfettiVisible(true);
          setTimeout(() => setConfettiVisible(false), 3000);
          
          Alert.alert('Success', `Image uploaded with ${Object.keys(metrics).length} metrics`);
        } catch (error) {
          console.error('OCR failed:', error);
          Alert.alert('Error', 'Failed to process image');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Gallery error:', err);
      Alert.alert('Error', 'Failed to pick from gallery');
      setIsLoading(false);
    }
  };

  const handleDoctorApprove = () => {
    if (!selectedDoc) return;
    
    setDoctorApproved({ ...doctorApproved, [selectedDoc.hash]: true });
    if (currentDoctorNote.trim()) {
      setDoctorNotes({ ...doctorNotes, [selectedDoc.hash]: currentDoctorNote });
    }
    setShowDoctorModal(false);
    setCurrentDoctorNote('');
    Alert.alert('Approved', 'Insights approved by healthcare professional');
  };

  const handleDoctorReject = () => {
    if (!selectedDoc) return;
    
    setDoctorApproved({ ...doctorApproved, [selectedDoc.hash]: false });
    if (currentDoctorNote.trim()) {
      setDoctorNotes({ ...doctorNotes, [selectedDoc.hash]: currentDoctorNote });
    }
    setShowDoctorModal(false);
    setCurrentDoctorNote('');
    Alert.alert('Rejected', 'Insights require revision');
  };

  // Voice Recording Handlers
  const handleStartVoiceRecording = async () => {
    try {
      const hasPermission = await WhisperService.hasAudioPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant microphone access to use voice input');
        return;
      }
      
      setShowVoiceModal(true);
      setIsRecording(true);
      setRecordingDuration(0);
      setAiActivity(prev => ({ ...prev, whisper: true }));
      
      // Start waveform animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1.3, duration: 400, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0.8, duration: 400, useNativeDriver: true }),
        ])
      ).start();
      
      // Start recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      await WhisperService.startRecording();
    } catch (error) {
      console.error('[Voice] Recording start failed:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
      setShowVoiceModal(false);
      setAiActivity(prev => ({ ...prev, whisper: false }));
    }
  };

  const handleStopVoiceRecording = async () => {
    try {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      
      setIsRecording(false);
      waveAnim.stopAnimation();
      
      const audioRecording = await WhisperService.stopRecording();
      setShowVoiceModal(false);
      
      setIsLoading(true);
      setLoadingMessage('Transcribing audio');
      
      const transcription = await WhisperService.transcribeAudio(audioRecording.uri);
      
      // Auto-populate document content
      const name = `Voice Note - ${new Date().toLocaleDateString()}`;
      const content = transcription.text;
      
      // Directly upload the transcribed content
      const metrics = extractMetrics(content);
      const fullContent = `Medical Report: ${name}\n\n${content}`;
      const hash = PrivacyService.generateHash({ content: fullContent, name });
      
      const doc: UploadedDocument = {
        name,
        content: fullContent,
        hash,
        timestamp: new Date(),
        verified: false,
        metrics
      };
      
      setLoadingMessage('Anchoring to blockchain');
      await BlockchainService.anchorHash(hash);
      doc.verified = true;
      
      setDocuments([...documents, doc]);
      setSelectedDoc(doc);
      
      // Update health score and show confetti
      updateHealthScore(metrics);
      setConfettiVisible(true);
      setTimeout(() => setConfettiVisible(false), 3000);
      
      Alert.alert('Success', `Voice transcribed: ${Object.keys(metrics).length} metrics found`);
    } catch (error) {
      console.error('[Voice] Transcription failed:', error);
      Alert.alert('Error', 'Failed to transcribe audio');
    } finally {
      setIsLoading(false);
      setAiActivity(prev => ({ ...prev, whisper: false }));
    }
  };

  // Vision Analysis Handlers
  const handleDeepVisionAnalysis = async (imageUri: string) => {
    if (!imageUri) {
      Alert.alert('Error', 'No image selected for vision analysis');
      return;
    }
    
    setCurrentImageUri(imageUri);
    setShowVisionModal(true);
    setIsVisionAnalyzing(true);
    setAiActivity(prev => ({ ...prev, vision: true }));
    
    try {
      const analysis = await VisionService.analyzeImage({
        imageUri,
        query: 'Analyze this medical document image in detail. Identify document type, visual elements, data structure, and any medical findings visible in the image.',
        context: selectedDoc?.content || ''
      });
      
      setVisionAnalysis(analysis);
    } catch (error) {
      console.error('[Vision] Analysis failed:', error);
      Alert.alert('Error', 'Vision analysis failed');
      setShowVisionModal(false);
    } finally {
      setIsVisionAnalyzing(false);
      setAiActivity(prev => ({ ...prev, vision: false }));
    }
  };

  // Render Tab Navigation
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, currentTab === 'upload' && styles.tabActive]}
        onPress={() => setCurrentTab('upload')}
        activeOpacity={0.7}>
        <Animated.View style={[
          styles.tabIcon, 
          currentTab === 'upload' && styles.tabIconActive,
          { transform: [{ scale: currentTab === 'upload' ? pulseAnim : 1 }] }
        ]}>
          <IconUpload 
            size={20} 
            color={currentTab === 'upload' ? '#ffffff' : '#6B7280'} 
          />
        </Animated.View>
        <Text style={[styles.tabText, currentTab === 'upload' && styles.tabTextActive]}>Upload</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, currentTab === 'insights' && styles.tabActive]}
        onPress={() => setCurrentTab('insights')}
        activeOpacity={0.7}>
        <Animated.View style={[
          styles.tabIcon, 
          currentTab === 'insights' && styles.tabIconActive,
          { transform: [{ scale: currentTab === 'insights' ? pulseAnim : 1 }] }
        ]}>
          <IconAI 
            size={20} 
            color={currentTab === 'insights' ? '#ffffff' : '#6B7280'} 
          />
        </Animated.View>
        <Text style={[styles.tabText, currentTab === 'insights' && styles.tabTextActive]}>Insights</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, currentTab === 'doctor' && styles.tabActive]}
        onPress={() => setCurrentTab('doctor')}
        activeOpacity={0.7}>
        <Animated.View style={[
          styles.tabIcon, 
          currentTab === 'doctor' && styles.tabIconActive,
          { transform: [{ scale: currentTab === 'doctor' ? pulseAnim : 1 }] }
        ]}>
          <IconDoctor 
            size={20} 
            color={currentTab === 'doctor' ? '#ffffff' : '#6B7280'} 
          />
        </Animated.View>
        <Text style={[styles.tabText, currentTab === 'doctor' && styles.tabTextActive]}>Doctor</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, currentTab === 'verify' && styles.tabActive]}
        onPress={() => setCurrentTab('verify')}
        activeOpacity={0.7}>
        <Animated.View style={[
          styles.tabIcon, 
          currentTab === 'verify' && styles.tabIconActive,
          { transform: [{ scale: currentTab === 'verify' ? pulseAnim : 1 }] }
        ]}>
          <IconVerify 
            size={20} 
            color={currentTab === 'verify' ? '#ffffff' : '#6B7280'} 
          />
        </Animated.View>
        <Text style={[styles.tabText, currentTab === 'verify' && styles.tabTextActive]}>Verify</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Upload Tab
  const renderUploadTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Quick Stats Overview */}
      {documents.length > 0 && (
        <Animatable.View animation="fadeInDown" duration={600} delay={0}>
          <View style={styles.statsOverview}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{documents.length}</Text>
              <Text style={styles.statLabel}>Documents</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{healthScore || '--'}</Text>
              <Text style={styles.statLabel}>Health Score</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {documents.filter(d => d.verified).length}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </Animatable.View>
      )}

      {/* Real-Time Health Score Dashboard */}
      {healthScore > 0 && (
        <Animatable.View animation="fadeInDown" duration={600} delay={50}>
          <View style={styles.healthScoreCard}>
            <LinearGradient colors={['#6366F1', '#8B5CF6', '#A855F7']} style={styles.healthScoreGradient}>
              <Text style={styles.healthScoreTitle}>Your Health Score</Text>
              <View style={styles.healthScoreMeter}>
                <Animated.View style={[
                  styles.healthScoreRing,
                  {
                    transform: [{
                      rotate: healthScoreAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0deg', '360deg']
                      })
                    }]
                  }
                ]}>
                  <View style={styles.healthScoreRingInner} />
                </Animated.View>
                <View style={styles.healthScoreCenter}>
                  <Text style={styles.healthScoreValue}>{healthScore}</Text>
                  <Text style={styles.healthScoreLabel}>/ 100</Text>
                </View>
                
                {/* Removed sparkle effects */}
              </View>
              
              <View style={styles.healthScoreStatus}>
                <Text style={styles.healthScoreStatusText}>
                  {healthScore >= 80 ? 'Excellent Health' : 
                   healthScore >= 60 ? 'Good Health' : 
                   healthScore >= 40 ? 'Needs Attention' : 
                   'Consult Doctor'}
                </Text>
              </View>
              
              {/* Mini trend indicators */}
              <View style={styles.miniTrendsContainer}>
                {trendData.glucose.length > 1 && (
                  <View style={styles.miniTrend}>
                    <Text style={styles.miniTrendLabel}>Glucose</Text>
                    <View style={styles.miniTrendLine}>
                      {trendData.glucose.slice(-5).map((val, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.miniTrendBar,
                            { height: `${Math.min((val / 200) * 100, 100)}%` }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.miniTrendValue}>{trendData.glucose[trendData.glucose.length - 1]}</Text>
                  </View>
                )}
                {trendData.vitaminD.length > 1 && (
                  <View style={styles.miniTrend}>
                    <Text style={styles.miniTrendLabel}>Vit D</Text>
                    <View style={styles.miniTrendLine}>
                      {trendData.vitaminD.slice(-5).map((val, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.miniTrendBar,
                            { height: `${Math.min((val / 100) * 100, 100)}%`, backgroundColor: '#60A5FA' }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.miniTrendValue}>{trendData.vitaminD[trendData.vitaminD.length - 1]}</Text>
                  </View>
                )}
                {trendData.cholesterol.length > 1 && (
                  <View style={styles.miniTrend}>
                    <Text style={styles.miniTrendLabel}>Chol</Text>
                    <View style={styles.miniTrendLine}>
                      {trendData.cholesterol.slice(-5).map((val, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.miniTrendBar,
                            { height: `${Math.min((val / 300) * 100, 100)}%`, backgroundColor: '#F472B6' }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.miniTrendValue}>{trendData.cholesterol[trendData.cholesterol.length - 1]}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        </Animatable.View>
      )}
      
      {/* Removed AI Models Status Dashboard for cleaner demo UI */}
      
      <Animatable.View animation="fadeInUp" duration={500} delay={100}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Medical Document</Text>
          <Text style={styles.cardSubtitle}>Choose how to add your document</Text>
          
          {/* Quick Demo Button */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={async () => {
              const name = 'Sample Lab Report - ' + new Date().toLocaleDateString();
              const content = 'Blood Glucose: 110 mg/dL\nVitamin D: 18 ng/mL\nCholesterol: 145 mg/dL\nHemoglobin: 12.5 g/dL\n\nPatient presented with slightly elevated glucose levels and low vitamin D. Recommend dietary modifications and vitamin D supplementation.';
              
              setIsLoading(true);
              setLoadingMessage('Processing sample data');
              
              try {
                const metrics = extractMetrics(content);
                const fullContent = `Medical Report: ${name}\n\n${content}`;
                const hash = PrivacyService.generateHash({ content: fullContent, name });
                
                const doc: UploadedDocument = {
                  name,
                  content: fullContent,
                  hash,
                  timestamp: new Date(),
                  verified: false,
                  metrics
                };
                
                setLoadingMessage('Anchoring to blockchain');
                await BlockchainService.anchorHash(hash);
                doc.verified = true;
                
                setDocuments([...documents, doc]);
                setSelectedDoc(doc);
                
                updateHealthScore(metrics);
                setConfettiVisible(true);
                setTimeout(() => setConfettiVisible(false), 3000);
                
                Alert.alert('Demo Data Loaded', `Sample document uploaded with ${Object.keys(metrics).length} metrics`);
              } catch (error) {
                console.error('Upload error:', error);
                Alert.alert('Error', 'Failed to upload document');
              } finally {
                setIsLoading(false);
              }
            }}
            activeOpacity={0.8}>
            <View style={styles.demoGradient}>
              <Text style={styles.demoButtonText}>Load Sample Data</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.compactUploadGrid}>
            <TouchableOpacity
              style={styles.compactUploadOption}
              onPress={handleTakePhoto}
              activeOpacity={0.8}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.compactUploadGradient}>
                <View style={styles.compactIconCircle}>
                  <IconCamera size={20} color="#ffffff" />
                </View>
                <Text style={styles.compactUploadText}>Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.compactUploadOption}
              onPress={handlePickFromGallery}
              activeOpacity={0.8}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.compactUploadGradient}>
                <View style={styles.compactIconCircle}>
                  <IconGallery size={20} color="#ffffff" />
                </View>
                <Text style={styles.compactUploadText}>Gallery</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.compactUploadOption}
              onPress={handlePickDocument}
              activeOpacity={0.8}>
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.compactUploadGradient}>
                <View style={styles.compactIconCircle}>
                  <IconDocument size={20} color="#ffffff" />
                </View>
                <Text style={styles.compactUploadText}>Files</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.compactUploadOption}
              onPress={handleStartVoiceRecording}
              activeOpacity={0.8}>
              <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.compactUploadGradient}>
                <View style={styles.compactIconCircle}>
                  <IconMicrophone size={20} color="#ffffff" />
                </View>
                <Text style={styles.compactUploadText}>Voice</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animatable.View>

      {documents.length > 0 && (
        <Animatable.View animation="fadeInUp" duration={500} delay={200}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Documents</Text>
            <Text style={styles.cardSubtitle}>{documents.length} document(s) uploaded</Text>
            
            {documents.map((doc, index) => (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                duration={400}
                delay={index * 100}>
                <TouchableOpacity
                  style={[
                    styles.documentItem,
                    selectedDoc?.hash === doc.hash && styles.documentItemSelected
                  ]}
                  onPress={() => setSelectedDoc(doc)}
                  activeOpacity={0.7}>
                  <LinearGradient
                    colors={selectedDoc?.hash === doc.hash ? ['#EEF2FF', '#E0E7FF'] : ['#F9FAFB', '#F9FAFB']}
                    style={styles.documentItemGradient}>
                    <View style={styles.documentIcon}>
                      <View style={styles.documentIconShape} />
                    </View>
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentName}>{doc.name}</Text>
                      <Text style={styles.documentMeta}>
                        {doc.timestamp.toLocaleDateString()} • {Object.keys(doc.metrics || {}).length} metrics
                      </Text>
                    </View>
                    {doc.verified && (
                      <Animated.View style={[styles.verifiedBadge, { transform: [{ scale: pulseAnim }] }]}>
                        <Text style={styles.verifiedText}>OK</Text>
                      </Animated.View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>
      )}

      {selectedDoc && (
        <Animatable.View animation="fadeInUp" duration={500} delay={300}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Selected Document</Text>
            <Text style={styles.cardSubtitle}>{selectedDoc.name}</Text>
            
            {selectedDoc.metrics && Object.keys(selectedDoc.metrics).length > 0 && (
              <>
                <Text style={[styles.cardTitle, { marginTop: 16, marginBottom: 12, fontSize: 16 }]}>Health Metrics</Text>
                
                <View style={styles.chartContainer}>
                  <ProgressChart
                    data={{
                      labels: ['Glucose', 'Vit D', 'Chol', 'Hemo'],
                      data: [
                        Math.min((selectedDoc.metrics.glucose || 0) / 200, 1),
                        Math.min((selectedDoc.metrics.vitaminD || 0) / 100, 1),
                        Math.min((selectedDoc.metrics.cholesterol || 0) / 300, 1),
                        Math.min((selectedDoc.metrics.hemoglobin || 0) / 20, 1),
                      ]
                    }}
                    width={width - 68}
                    height={200}
                    strokeWidth={14}
                    radius={28}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#EEF2FF',
                      backgroundGradientTo: '#E0E7FF',
                      color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                    }}
                    hideLegend={false}
                    style={styles.chart}
                  />
                </View>
                
                <View style={styles.metricsGrid}>
                  {selectedDoc.metrics.glucose && (
                    <Animatable.View animation="bounceIn" delay={100} style={styles.metricCard}>
                      <LinearGradient colors={['#FEF3C7', '#FDE68A']} style={styles.metricGradient}>
                        <Text style={styles.metricLabel}>Glucose</Text>
                        <Text style={[styles.metricValue, { color: '#D97706' }]}>{selectedDoc.metrics.glucose}</Text>
                        <Text style={styles.metricUnit}>mg/dL</Text>
                        <View style={[styles.metricIndicator, { backgroundColor: selectedDoc.metrics.glucose > 100 ? '#EF4444' : '#10B981' }]} />
                      </LinearGradient>
                    </Animatable.View>
                  )}
                  {selectedDoc.metrics.vitaminD && (
                    <Animatable.View animation="bounceIn" delay={200} style={styles.metricCard}>
                      <LinearGradient colors={['#DBEAFE', '#BFDBFE']} style={styles.metricGradient}>
                        <Text style={styles.metricLabel}>Vitamin D</Text>
                        <Text style={[styles.metricValue, { color: '#2563EB' }]}>{selectedDoc.metrics.vitaminD}</Text>
                        <Text style={styles.metricUnit}>ng/mL</Text>
                        <View style={[styles.metricIndicator, { backgroundColor: selectedDoc.metrics.vitaminD < 30 ? '#EF4444' : '#10B981' }]} />
                      </LinearGradient>
                    </Animatable.View>
                  )}
                  {selectedDoc.metrics.cholesterol && (
                    <Animatable.View animation="bounceIn" delay={300} style={styles.metricCard}>
                      <LinearGradient colors={['#FCE7F3', '#FBCFE8']} style={styles.metricGradient}>
                        <Text style={styles.metricLabel}>Cholesterol</Text>
                        <Text style={[styles.metricValue, { color: '#DB2777' }]}>{selectedDoc.metrics.cholesterol}</Text>
                        <Text style={styles.metricUnit}>mg/dL</Text>
                        <View style={[styles.metricIndicator, { backgroundColor: selectedDoc.metrics.cholesterol > 200 ? '#EF4444' : '#10B981' }]} />
                      </LinearGradient>
                    </Animatable.View>
                  )}
                  {selectedDoc.metrics.hemoglobin && (
                    <Animatable.View animation="bounceIn" delay={400} style={styles.metricCard}>
                      <LinearGradient colors={['#D1FAE5', '#A7F3D0']} style={styles.metricGradient}>
                        <Text style={styles.metricLabel}>Hemoglobin</Text>
                        <Text style={[styles.metricValue, { color: '#059669' }]}>{selectedDoc.metrics.hemoglobin}</Text>
                        <Text style={styles.metricUnit}>g/dL</Text>
                        <View style={[styles.metricIndicator, { backgroundColor: selectedDoc.metrics.hemoglobin < 12 ? '#EF4444' : '#10B981' }]} />
                      </LinearGradient>
                    </Animatable.View>
                  )}
                </View>
              </>
            )}
            
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={handleAnalyzeDocument}
              activeOpacity={0.8}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.analyzeGradient}>
                <Text style={styles.analyzeButtonText}>Analyze with MedGemma AI</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {currentImageUri && (
              <TouchableOpacity
                style={[styles.analyzeButton, { marginTop: 12 }]}
                onPress={() => handleDeepVisionAnalysis(currentImageUri)}
                activeOpacity={0.8}>
                <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.analyzeGradient}>
                  <Text style={styles.analyzeButtonText}>Deep Vision Analysis</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animatable.View>
      )}
    </ScrollView>
  );

  // Render Insights Tab
  const renderInsightsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Removed test buttons for cleaner demo UI */}

      {healthInsights ? (
        <>
          <Animatable.View animation="fadeInUp" duration={500} delay={100}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>AI Analysis</Text>
              <Text style={styles.cardSubtitle}>Generated by MedGemma on-device</Text>
              <View style={styles.insightsBox}>
                <Text style={styles.insightsText}>{healthInsights.insights}</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  Confidence: {(healthInsights.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </Animatable.View>

          {selectedDoc?.metrics && Object.keys(selectedDoc.metrics).length > 0 && (
            <>
              <Animatable.View animation="fadeInUp" duration={500} delay={200}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Metrics Visualization</Text>
                  <Text style={styles.cardSubtitle}>Progress chart showing health indicators</Text>
                  <ProgressChart
                    data={{
                      labels: ['Glucose', 'Vit D', 'Chol', 'Hemo'],
                      data: [
                        Math.min((selectedDoc.metrics.glucose || 0) / 200, 1),
                        Math.min((selectedDoc.metrics.vitaminD || 0) / 100, 1),
                        Math.min((selectedDoc.metrics.cholesterol || 0) / 300, 1),
                        Math.min((selectedDoc.metrics.hemoglobin || 0) / 20, 1),
                      ]
                    }}
                    width={width - 68}
                    height={200}
                    strokeWidth={14}
                    radius={28}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#EEF2FF',
                      backgroundGradientTo: '#E0E7FF',
                      color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                    }}
                    hideLegend={false}
                    style={styles.chart}
                  />
                </View>
              </Animatable.View>
              
              <Animatable.View animation="fadeInUp" duration={500} delay={250}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Metrics Comparison</Text>
                  <Text style={styles.cardSubtitle}>Bar chart showing values</Text>
                  <BarChart
                    data={{
                      labels: ['Glucose', 'Vit D', 'Chol', 'Hemo'],
                      datasets: [{
                        data: [
                          selectedDoc.metrics.glucose || 0,
                          selectedDoc.metrics.vitaminD || 0,
                          selectedDoc.metrics.cholesterol || 0,
                          (selectedDoc.metrics.hemoglobin || 0) * 10,
                        ]
                      }]
                    }}
                    width={width - 68}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#F0FDF4',
                      backgroundGradientTo: '#DCFCE7',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                      style: { borderRadius: 12 },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: 'rgba(0,0,0,0.1)'
                      }
                    }}
                    style={styles.chart}
                    fromZero
                  />
                </View>
              </Animatable.View>
            </>
          )}

          {healthInsights.recommendations.length > 0 && (
            <Animatable.View animation="fadeInUp" duration={500} delay={300}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Recommendations</Text>
                {healthInsights.recommendations.map((rec, idx) => (
                  <View key={idx} style={styles.recommendationItem}>
                    <View style={styles.recommendationBullet} />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            </Animatable.View>
          )}

          {healthInsights.riskFactors.length > 0 && (
            <Animatable.View animation="fadeInUp" duration={500} delay={400}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Risk Factors</Text>
                {healthInsights.riskFactors.map((risk, idx) => (
                  <View key={idx} style={styles.riskItem}>
                    <View style={styles.riskBullet} />
                    <Text style={styles.riskText}>{risk}</Text>
                  </View>
                ))}
              </View>
            </Animatable.View>
          )}
          
          {/* Chatbot Interface */}
          <Animatable.View animation="fadeInUp" duration={500} delay={500}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ask MedGemma</Text>
              <Text style={styles.cardSubtitle}>Ask questions about your medical document</Text>
              
              <View style={styles.chatContainer}>
                {chatMessages.length === 0 && (
                  <View style={styles.chatEmpty}>
                    <Text style={styles.chatEmptyText}>Ask me anything about your health data</Text>
                    <Text style={styles.chatEmptyHint}>Example: "What should I eat to improve my vitamin D?"</Text>
                  </View>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <View key={idx} style={[styles.chatMessage, msg.role === 'user' ? styles.chatMessageUser : styles.chatMessageAssistant]}>
                    <Text style={[styles.chatMessageText, msg.role === 'user' ? styles.chatMessageTextUser : styles.chatMessageTextAssistant]}>
                      {msg.content}
                    </Text>
                  </View>
                ))}
                
                {isChatLoading && (
                  <View style={styles.chatMessage}>
                    <ActivityIndicator size="small" color="#6366F1" />
                  </View>
                )}
              </View>
              
              <View style={styles.chatInputContainer}>
                <TouchableOpacity
                  style={styles.chatVoiceButton}
                  onPress={handleChatVoiceInput}
                  activeOpacity={0.7}>
                  <LinearGradient colors={['#FF5722', '#E64A19']} style={styles.chatVoiceGradient}>
                    <Text style={styles.chatVoiceIcon}>MIC</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={200}
                />
                <TouchableOpacity
                  style={styles.chatSendButton}
                  onPress={handleChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  activeOpacity={0.7}>
                  <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.chatSendGradient}>
                    <Text style={styles.chatSendText}>→</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
            <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.emptyIconContainer}>
              <View style={styles.emptyAIIcon}>
                <View style={styles.emptyAICircle} />
                <View style={styles.emptyAICircle} />
                <View style={styles.emptyAICircle} />
              </View>
            </LinearGradient>
          </Animatable.View>
          <Text style={styles.emptyTitle}>AI Analysis Ready</Text>
          <Text style={styles.emptyText}>Upload a medical document to get started with AI-powered health insights</Text>
          <View style={styles.emptyFeatures}>
            <View style={styles.emptyFeature}>
              <View style={styles.emptyFeatureCheck} />
              <Text style={styles.emptyFeatureText}>On-device AI processing</Text>
            </View>
            <View style={styles.emptyFeature}>
              <View style={styles.emptyFeatureCheck} />
              <Text style={styles.emptyFeatureText}>Privacy-preserving analysis</Text>
            </View>
            <View style={styles.emptyFeature}>
              <View style={styles.emptyFeatureCheck} />
              <Text style={styles.emptyFeatureText}>Blockchain verification</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  // Render Doctor Tab (HITL - Human in the Loop)
  const renderDoctorTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Animatable.View animation="fadeInUp" duration={500} delay={100}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Doctor Review Portal</Text>
          <Text style={styles.cardSubtitle}>Human-in-the-Loop validation for AI insights</Text>
          
          {!healthInsights ? (
            <View style={styles.doctorEmptyState}>
              <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
                <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.emptyIconContainer}>
                  <View style={styles.doctorIconContainer}>
                    <View style={styles.doctorIconHead} />
                    <View style={styles.doctorIconBody} />
                  </View>
                </LinearGradient>
              </Animatable.View>
              <Text style={styles.doctorEmptyText}>No insights to review yet</Text>
              <Text style={styles.doctorEmptyHint}>Upload and analyze a document first, then return here for professional review</Text>
            </View>
          ) : (
            <>
              <View style={styles.doctorStatusCard}>
                <Text style={styles.doctorStatusLabel}>Current Status:</Text>
                {selectedDoc && doctorApproved[selectedDoc.hash] !== undefined ? (
                  <View style={[styles.doctorStatusBadge, doctorApproved[selectedDoc.hash] ? styles.doctorStatusApproved : styles.doctorStatusRejected]}>
                    <Text style={styles.doctorStatusText}>
                      {doctorApproved[selectedDoc.hash] ? 'Approved' : 'Needs Revision'}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.doctorStatusBadge, styles.doctorStatusPending]}>
                    <Text style={styles.doctorStatusText}>⏱ Pending Review</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.doctorInsightsPreview}>
                <Text style={styles.doctorPreviewLabel}>AI-Generated Insights:</Text>
                <Text style={styles.doctorPreviewText}>{healthInsights.insights}</Text>
              </View>
              
              {selectedDoc && doctorNotes[selectedDoc.hash] && (
                <View style={styles.doctorNotesDisplay}>
                  <Text style={styles.doctorNotesLabel}>Doctor's Notes:</Text>
                  <Text style={styles.doctorNotesText}>{doctorNotes[selectedDoc.hash]}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.doctorReviewButton}
                onPress={() => setShowDoctorModal(true)}
                activeOpacity={0.8}>
                <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.doctorReviewGradient}>
                  <Text style={styles.doctorReviewButtonText}>
                    {selectedDoc && doctorApproved[selectedDoc.hash] !== undefined ? 'Update Review' : 'Review Insights'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animatable.View>
      
      {documents.length > 0 && (
        <Animatable.View animation="fadeInUp" duration={500} delay={200}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Review History</Text>
            <View style={styles.historyList}>
              {documents.map((doc, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyName}>{doc.name}</Text>
                    <Text style={styles.historyDate}>{doc.timestamp.toLocaleString()}</Text>
                  </View>
                  {doctorApproved[doc.hash] !== undefined && (
                    <View style={[styles.historyBadge, doctorApproved[doc.hash] ? {} : { backgroundColor: '#F59E0B' }]}>
                      <Text style={styles.historyBadgeText}>{doctorApproved[doc.hash] ? 'OK' : 'X'}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </Animatable.View>
      )}
    </ScrollView>
  );

  // Render Verify Tab
  const renderVerifyTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Animatable.View animation="fadeInUp" duration={500} delay={100}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Blockchain Verification</Text>
          <Text style={styles.cardSubtitle}>Verify data integrity on Polygon</Text>
          
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifyIntegrity}
            disabled={!healthInsights}
            activeOpacity={0.8}>
            <LinearGradient
              colors={healthInsights ? ['#10B981', '#059669'] : ['#9CA3AF', '#6B7280']}
              style={styles.verifyGradient}>
              <Text style={styles.verifyButtonText}>Verify Integrity</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      {verificationResult && (
        <Animatable.View animation="fadeInUp" duration={500} delay={200}>
          <View style={[styles.card, verificationResult.isValid ? styles.cardSuccess : styles.cardWarning]}>
            <View style={styles.verificationHeader}>
              <View style={[styles.statusIcon, verificationResult.isValid ? styles.statusIconSuccess : styles.statusIconWarning]}>
                <Text style={styles.statusIconText}>{verificationResult.isValid ? 'OK' : '!'}</Text>
              </View>
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationTitle}>
                  {verificationResult.isValid ? 'Verified' : 'Warning'}
                </Text>
                <Text style={styles.verificationMessage}>{verificationResult.message}</Text>
              </View>
            </View>
            
            <View style={styles.hashBox}>
              <Text style={styles.hashLabel}>Hash:</Text>
              <Text style={styles.hashValue} numberOfLines={1} ellipsizeMode="middle">
                {verificationResult.localHash}
              </Text>
            </View>
            
            <Text style={styles.timestampText}>
              Verified: {verificationResult.timestamp.toLocaleString()}
            </Text>
          </View>
        </Animatable.View>
      )}

      {documents.length > 0 && (
        <Animatable.View animation="fadeInUp" duration={500} delay={300}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Document History</Text>
            <View style={styles.historyList}>
              {documents.map((doc, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <View style={styles.historyDot} />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyName}>{doc.name}</Text>
                    <Text style={styles.historyDate}>{doc.timestamp.toLocaleString()}</Text>
                  </View>
                  {doc.verified && (
                    <View style={styles.historyBadge}>
                      <Text style={styles.historyBadgeText}>OK</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </Animatable.View>
      )}
    </ScrollView>
  );

  // Render Upload Modal
  const renderUploadModal = () => (
    <Modal
      visible={showUploadModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowUploadModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Enter Document Details</Text>
            <TouchableOpacity onPress={() => setShowUploadModal(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Document Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Lab Results 2024"
              value={docName}
              onChangeText={setDocName}
              placeholderTextColor="#9CA3AF"
            />
            
            <Text style={styles.inputLabel}>Document Content</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter medical data, lab results, etc."
              value={docContent}
              onChangeText={setDocContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
            
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleUploadDocument}
              activeOpacity={0.8}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.submitGradient}>
                <Text style={styles.submitButtonText}>Upload Document</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Render Doctor Review Modal
  const renderDoctorModal = () => (
    <Modal
      visible={showDoctorModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDoctorModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Doctor Review</Text>
            <TouchableOpacity onPress={() => setShowDoctorModal(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Clinical Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add your professional assessment..."
              value={currentDoctorNote}
              onChangeText={setCurrentDoctorNote}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
            
            <View style={styles.doctorButtonsRow}>
              <TouchableOpacity
                style={[styles.doctorActionButton, { flex: 1, marginRight: 8 }]}
                onPress={handleDoctorReject}
                activeOpacity={0.8}>
                <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.doctorActionGradient}>
                  <Text style={styles.doctorActionText}>✕ Reject</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.doctorActionButton, { flex: 1, marginLeft: 8 }]}
                onPress={handleDoctorApprove}
                activeOpacity={0.8}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.doctorActionGradient}>
                  <Text style={styles.doctorActionText}>Approve</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Render Polygon Verification Modal
  const renderPolygonModal = () => {
    useEffect(() => {
      if (showPolygonModal) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(polygonPulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
            Animated.timing(polygonPulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          ])
        ).start();
      }
    }, [showPolygonModal]);

    if (!verificationResult) return null;

    const txHash = verificationResult.transactionHash || '';
    const isSimulated = txHash.startsWith('0xsimulated');
    const url = isSimulated 
      ? 'https://amoy.polygonscan.com/' 
      : `https://amoy.polygonscan.com/tx/${txHash}`;

    return (
      <Modal
        visible={showPolygonModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPolygonModal(false)}>
        <View style={styles.polygonOverlay}>
          <Animatable.View animation="zoomIn" duration={400} style={styles.polygonCard}>
            <TouchableOpacity 
              style={styles.polygonClose}
              onPress={() => setShowPolygonModal(false)}>
              <Text style={styles.polygonCloseText}>✕</Text>
            </TouchableOpacity>
            
            {/* Polygon Logo */}
            <Animated.View style={[styles.polygonLogoContainer, { transform: [{ scale: polygonPulseAnim }] }]}>
              <LinearGradient colors={['#8247E5', '#6B3FD8']} style={styles.polygonLogoBg}>
                <Text style={styles.polygonLogoText}>⬡</Text>
              </LinearGradient>
            </Animated.View>
            
            <Text style={styles.polygonTitle}>
              {verificationResult.isValid ? 'Verified on Polygon' : 'Verification Warning'}
            </Text>
            <Text style={styles.polygonSubtitle}>Amoy Testnet</Text>
            
            <View style={styles.polygonInfoBox}>
              <View style={styles.polygonInfoRow}>
                <Text style={styles.polygonInfoLabel}>Status:</Text>
                <View style={[styles.polygonStatusBadge, verificationResult.isValid ? styles.polygonStatusSuccess : styles.polygonStatusWarning]}>
                  <Text style={styles.polygonStatusText}>
                    {verificationResult.isValid ? 'Valid' : 'Warning'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.polygonInfoRow}>
                <Text style={styles.polygonInfoLabel}>Network:</Text>
                <Text style={styles.polygonInfoValue}>Polygon Amoy (ChainID: 80002)</Text>
              </View>
              
              <View style={styles.polygonInfoRow}>
                <Text style={styles.polygonInfoLabel}>Timestamp:</Text>
                <Text style={styles.polygonInfoValue}>{verificationResult.timestamp.toLocaleString()}</Text>
              </View>
            </View>
            
            <View style={styles.polygonHashBox}>
              <Text style={styles.polygonHashLabel}>Transaction Hash:</Text>
              <Text style={styles.polygonHashValue} numberOfLines={2} ellipsizeMode="middle">
                {txHash}
              </Text>
            </View>
            
            <Text style={styles.polygonMessage}>{verificationResult.message}</Text>
            
            <TouchableOpacity
              style={styles.polygonScanButton}
              onPress={async () => {
                try {
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert('PolygonScan URL', url);
                  }
                } catch (error) {
                  console.error('[Linking] Failed:', error);
                  Alert.alert('PolygonScan URL', url);
                }
              }}
              activeOpacity={0.8}>
              <LinearGradient colors={['#8247E5', '#6B3FD8']} style={styles.polygonScanGradient}>
                <Text style={styles.polygonScanText}>View on PolygonScan →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    );
  };

  // Render Voice Recording Modal
  const renderVoiceModal = () => (
    <Modal
      visible={showVoiceModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {
        if (isRecording) {
          handleStopVoiceRecording();
        } else {
          setShowVoiceModal(false);
        }
      }}>
      <View style={styles.voiceOverlay}>
        <Animatable.View animation="zoomIn" duration={400} style={styles.voiceCard}>
          <LinearGradient
            colors={['#ffffff', '#FFF5F5', '#ffffff']}
            style={styles.voiceCardGradient}>
            <Text style={styles.voiceTitle}>Voice Recording</Text>
            <Text style={styles.voiceSubtitle}>Speak your medical data clearly</Text>
            
            {/* Animated Waveform Circles */}
            <View style={styles.voiceWaveWrapper}>
              <Animated.View style={[
                styles.voiceWaveRing,
                {
                  transform: [{ scale: waveAnim }],
                  opacity: waveAnim.interpolate({
                    inputRange: [0.8, 1.3],
                    outputRange: [0.3, 0]
                  })
                }
              ]} />
              <Animated.View style={[
                styles.voiceWaveRing,
                {
                  transform: [{ 
                    scale: waveAnim.interpolate({
                      inputRange: [0.8, 1.3],
                      outputRange: [0.9, 1.2]
                    })
                  }],
                  opacity: 0.2
                }
              ]} />
              
              <Animated.View style={[styles.voiceWaveContainer, { transform: [{ scale: waveAnim }] }]}>
                <LinearGradient colors={['#FF5722', '#E64A19', '#D84315']} style={styles.voiceWave}>
                  <Text style={styles.voiceWaveText}>REC</Text>
                </LinearGradient>
              </Animated.View>
            </View>
            
            <Text style={styles.voiceDuration}>
              {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </Text>
            
            {isRecording && (
              <Animatable.View animation="pulse" iterationCount="infinite" style={styles.voiceRecordingBadge}>
                <View style={styles.voiceRecordingDot} />
                <Text style={styles.voiceHint}>Recording in progress...</Text>
              </Animatable.View>
            )}
            
            <TouchableOpacity
              style={styles.voiceStopButton}
              onPress={handleStopVoiceRecording}
              activeOpacity={0.8}>
              <LinearGradient colors={['#EF4444', '#DC2626', '#B91C1C']} style={styles.voiceStopGradient}>
                <Text style={styles.voiceStopText}>⏹ Stop & Transcribe</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.voiceFooter}>Powered by Whisper via Melange</Text>
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Render Vision Analysis Modal
  const renderVisionModal = () => (
    <Modal
      visible={showVisionModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowVisionModal(false)}>
      <View style={styles.modalOverlay}>
        <Animatable.View animation="slideInUp" duration={500} style={styles.visionModalContainer}>
          <LinearGradient colors={['#F3E8FF', '#ffffff']} style={styles.visionModalGradient}>
            <View style={styles.modalHeader}>
              <View style={styles.visionHeaderIcon}>
                <Text style={styles.visionHeaderIconText}>🔍</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.modalTitle}>Vision Analysis</Text>
                <Text style={styles.visionHeaderSubtitle}>Llama 3.2 Vision • 11B Parameters</Text>
              </View>
              <TouchableOpacity onPress={() => setShowVisionModal(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {isVisionAnalyzing ? (
                <View style={styles.visionLoading}>
                  <Animated.View style={{
                    transform: [{
                      rotate: shimmerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }]
                  }}>
                    <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.visionLoadingCircle}>
                      <Text style={styles.visionLoadingIcon}>VIS</Text>
                    </LinearGradient>
                  </Animated.View>
                  <Text style={styles.visionLoadingText}>Analyzing image with Llama Vision...</Text>
                  <Text style={styles.visionLoadingHint}>Deep learning in progress</Text>
                </View>
              ) : visionAnalysis ? (
                <>
                  <View style={styles.visionSection}>
                    <View style={styles.visionSectionHeader}>
                      <View style={styles.visionSectionIcon}>
                        <Text style={styles.visionSectionIconText}>AI</Text>
                      </View>
                      <Text style={styles.visionSectionTitle}>Deep Analysis</Text>
                    </View>
                    <View style={styles.visionAnalysisBox}>
                      <Text style={styles.visionAnalysisText}>{visionAnalysis.analysis}</Text>
                    </View>
                  </View>
                  
                  {visionAnalysis.detectedElements.length > 0 && (
                    <View style={styles.visionSection}>
                      <View style={styles.visionSectionHeader}>
                        <View style={[styles.visionSectionIcon, { backgroundColor: '#DBEAFE' }]}>
                          <Text style={[styles.visionSectionIconText, { color: '#2563EB' }]}>▢</Text>
                        </View>
                        <Text style={styles.visionSectionTitle}>Detected Elements</Text>
                      </View>
                      {visionAnalysis.detectedElements.map((elem, idx) => (
                        <Animatable.View key={idx} animation="fadeInLeft" delay={idx * 100} style={styles.visionListItem}>
                          <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.visionListGradient}>
                            <View style={[styles.visionBullet, { backgroundColor: '#2563EB' }]} />
                            <Text style={styles.visionListText}>{elem}</Text>
                          </LinearGradient>
                        </Animatable.View>
                      ))}
                    </View>
                  )}
                  
                  {visionAnalysis.medicalFindings.length > 0 && (
                    <View style={styles.visionSection}>
                      <View style={styles.visionSectionHeader}>
                        <View style={[styles.visionSectionIcon, { backgroundColor: '#D1FAE5' }]}>
                          <Text style={[styles.visionSectionIconText, { color: '#059669' }]}>+</Text>
                        </View>
                        <Text style={styles.visionSectionTitle}>Medical Findings</Text>
                      </View>
                      {visionAnalysis.medicalFindings.map((finding, idx) => (
                        <Animatable.View key={idx} animation="fadeInLeft" delay={idx * 100} style={styles.visionListItem}>
                          <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.visionListGradient}>
                            <View style={[styles.visionBullet, { backgroundColor: '#10B981' }]} />
                            <Text style={styles.visionListText}>{finding}</Text>
                          </LinearGradient>
                        </Animatable.View>
                      ))}
                    </View>
                  )}
                  
                  <View style={styles.visionConfidenceBox}>
                    <LinearGradient colors={['#F3E8FF', '#E9D5FF']} style={styles.visionConfidenceGradient}>
                      <Text style={styles.visionConfidenceLabel}>Analysis Confidence</Text>
                      <Text style={styles.visionConfidenceValue}>{(visionAnalysis.confidence * 100).toFixed(0)}%</Text>
                      <View style={styles.visionConfidenceBar}>
                        <View style={[styles.visionConfidenceBarFill, { width: `${visionAnalysis.confidence * 100}%` }]} />
                      </View>
                    </LinearGradient>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );

  // Main Render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Animated Background Decorations */}
      <Animated.View style={[
        styles.bgDecoration1,
        {
          transform: [{
            translateY: floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -20]
            })
          }]
        }
      ]} />
      <Animated.View style={[
        styles.bgDecoration2,
        {
          transform: [{
            translateY: floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 15]
            })
          }]
        }
      ]} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={['#ffffff', '#F8F9FC']}
          style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.appIconContainer}>
                <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.appIcon}>
                  <View style={styles.appIconInner}>
                    <View style={styles.appIconCross} />
                    <View style={[styles.appIconCross, { transform: [{ rotate: '90deg' }] }]} />
                  </View>
                </LinearGradient>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>NutriCare Oracle</Text>
                <Text style={styles.headerSubtitle}>AI-Powered Health Insights</Text>
              </View>
            </View>
            {isInitialized && (
              <Animated.View style={[styles.statusBadge, { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready</Text>
              </Animated.View>
            )}
          </View>
        </LinearGradient>

        {renderTabBar()}

        {currentTab === 'upload' && renderUploadTab()}
        {currentTab === 'insights' && renderInsightsTab()}
        {currentTab === 'doctor' && renderDoctorTab()}
        {currentTab === 'verify' && renderVerifyTab()}

        {renderUploadModal()}
        {renderDoctorModal()}
        {renderVoiceModal()}
        {renderVisionModal()}
        {renderPolygonModal()}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <Animated.View style={{
                transform: [{
                  rotate: shimmerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }}>
                <ActivityIndicator size="large" color="#6366F1" />
              </Animated.View>
              <Text style={styles.loadingText}>{loadingMessage}</Text>
              <View style={styles.loadingProgress}>
                <Animated.View style={[
                  styles.loadingProgressBar,
                  {
                    transform: [{
                      scaleX: shimmerAnim
                    }]
                  }
                ]} />
              </View>
            </View>
          </View>
        )}
        
        {/* Success Confetti */}
        {confettiVisible && (
          <View style={styles.confettiContainer}>
            {[...Array(20)].map((_, i) => (
              <Animatable.View
                key={i}
                animation="fadeOutDown"
                duration={2000}
                delay={i * 100}
                style={[
                  styles.confettiParticle,
                  {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 30}%`,
                    backgroundColor: ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][i % 5],
                  }
                ]}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    marginRight: 12,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.6)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIconActive: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  tabIconText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabIconTextActive: {
    color: '#ffffff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  cardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 20,
    fontWeight: '400',
  },
  uploadGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  compactUploadGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  compactUploadOption: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  compactUploadGradient: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  compactUploadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  demoButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  demoGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  uploadOption: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  uploadGradient: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    position: 'relative',
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  uploadIconText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  uploadOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  uploadShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  documentItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  documentItemSelected: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  documentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  documentMeta: {
    fontSize: 11,
    color: '#6B7280',
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: (width - 80) / 2,
    borderRadius: 16,
    margin: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  metricGradient: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  metricIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  noDataText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 12,
  },
  analyzeButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  analyzeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  insightsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  insightsText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  confidenceBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  chartContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 6,
    marginRight: 10,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  riskBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 6,
    marginRight: 10,
  },
  riskText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyFeatures: {
    alignItems: 'flex-start',
  },
  emptyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  emptyFeatureText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  verifyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  verifyGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIconSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusIconWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusIconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  verificationMessage: {
    fontSize: 12,
    color: '#6B7280',
  },
  hashBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  hashLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  hashValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
  },
  timestampText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  historyList: {
    marginTop: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  historyBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
    maxHeight: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  loadingProgress: {
    width: 200,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  loadingProgressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
    transformOrigin: 'left',
  },
  // Chatbot styles
  chatContainer: {
    minHeight: 200,
    maxHeight: 300,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  chatEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  chatEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  chatEmptyHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  chatMessage: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  chatMessageUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366F1',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  chatMessageAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chatMessageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatMessageTextUser: {
    color: '#ffffff',
  },
  chatMessageTextAssistant: {
    color: '#374151',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  chatVoiceButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chatVoiceGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatVoiceIcon: {
    fontSize: 20,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    maxHeight: 80,
  },
  chatSendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chatSendGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
  },
  // Doctor review styles
  doctorEmptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  doctorEmptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  doctorEmptyHint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  doctorStatusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorStatusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  doctorStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  doctorStatusApproved: {
    backgroundColor: '#D1FAE5',
  },
  doctorStatusRejected: {
    backgroundColor: '#FEE2E2',
  },
  doctorStatusPending: {
    backgroundColor: '#FEF3C7',
  },
  doctorStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  doctorInsightsPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  doctorPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  doctorPreviewText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  doctorNotesDisplay: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  doctorNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  doctorNotesText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
    fontStyle: 'italic',
  },
  doctorReviewButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doctorReviewGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  doctorReviewButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  doctorButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 20,
  },
  doctorActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  doctorActionGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  doctorActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  // Polygon modal styles
  polygonOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  polygonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#8247E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  polygonClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  polygonCloseText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  polygonLogoContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  polygonLogoBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8247E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  polygonLogoText: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: '700',
  },
  polygonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  polygonSubtitle: {
    fontSize: 14,
    color: '#8247E5',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  polygonInfoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  polygonInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  polygonInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  polygonInfoValue: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  polygonStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  polygonStatusSuccess: {
    backgroundColor: '#D1FAE5',
  },
  polygonStatusWarning: {
    backgroundColor: '#FEF3C7',
  },
  polygonStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  polygonHashBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  polygonHashLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  polygonHashValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#8247E5',
    lineHeight: 16,
  },
  polygonMessage: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  polygonScanButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8247E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  polygonScanGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  polygonScanText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  // Voice recording modal styles
  voiceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  voiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    width: '90%',
    maxWidth: 380,
    overflow: 'hidden',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 20,
  },
  voiceCardGradient: {
    padding: 36,
    alignItems: 'center',
  },
  voiceTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  voiceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
  },
  voiceWaveWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  voiceWaveRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  voiceWaveContainer: {
    zIndex: 10,
  },
  voiceWave: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  voiceWaveText: {
    fontSize: 64,
    color: '#ffffff',
  },
  voiceDuration: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
    fontFamily: 'monospace',
    marginBottom: 16,
    letterSpacing: 2,
  },
  voiceRecordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 28,
  },
  voiceRecordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  voiceHint: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  voiceStopButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  voiceStopGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  voiceStopText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  voiceFooter: {
    marginTop: 16,
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  // Vision analysis modal styles
  visionModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
  },
  visionModalGradient: {
    width: '100%',
    height: '100%',
  },
  visionHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visionHeaderIconText: {
    fontSize: 24,
  },
  visionHeaderSubtitle: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 2,
  },
  visionLoading: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  visionLoadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  visionLoadingIcon: {
    fontSize: 40,
    color: '#ffffff',
  },
  visionLoadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  visionLoadingHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  visionSection: {
    marginBottom: 28,
  },
  visionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  visionSectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  visionSectionIconText: {
    fontSize: 18,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  visionSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  visionAnalysisBox: {
    backgroundColor: 'rgba(243, 232, 255, 0.4)',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  visionAnalysisText: {
    fontSize: 13,
    lineHeight: 21,
    color: '#374151',
  },
  visionListItem: {
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  visionListGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  visionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginTop: 6,
    marginRight: 12,
  },
  visionListText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },
  visionConfidenceBox: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  visionConfidenceGradient: {
    padding: 20,
    alignItems: 'center',
  },
  visionConfidenceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  visionConfidenceValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#8B5CF6',
    marginBottom: 12,
  },
  visionConfidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  visionConfidenceBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  // Background decorations
  bgDecoration1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    zIndex: -1,
  },
  bgDecoration2: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    zIndex: -1,
  },
  // Header gradient wrapper
  headerGradient: {
    width: '100%',
  },
  // Confetti particles
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confettiParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Stats dashboard styles
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.12)',
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  statBadgeActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statDotActive: {
    backgroundColor: '#EF4444',
  },
  statStatusActive: {
    color: '#DC2626',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statGradient: {
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  statsStatLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  statStatus: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  statsFooter: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Health Score Dashboard styles
  healthScoreCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  healthScoreGradient: {
    padding: 24,
    alignItems: 'center',
  },
  healthScoreTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  healthScoreMeter: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  healthScoreRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 12,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRightColor: '#ffffff',
  },
  healthScoreRingInner: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  healthScoreCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthScoreValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 56,
  },
  healthScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sparkle: {
    position: 'absolute',
  },
  healthScoreStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  healthScoreStatusText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  miniTrendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  miniTrend: {
    alignItems: 'center',
  },
  miniTrendLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  miniTrendLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 3,
    marginBottom: 6,
  },
  miniTrendBar: {
    width: 6,
    backgroundColor: '#34D399',
    borderRadius: 3,
    minHeight: 4,
  },
  miniTrendValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  
  // Professional Icon Styles
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUploadArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 2,
  },
  iconUploadLine: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  iconAIBrain: {
    width: 16,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
  },
  iconAIDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  iconDoctorHead: {
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderRadius: 4,
    marginBottom: 1,
  },
  iconDoctorBody: {
    width: 12,
    height: 8,
    borderRadius: 4,
    marginBottom: 1,
  },
  iconDoctorStethoscope: {
    width: 16,
    height: 3,
    borderWidth: 1,
    borderRadius: 1.5,
  },
  iconVerifyShield: {
    width: 14,
    height: 16,
    borderWidth: 1.5,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconVerifyCheck: {
    width: 6,
    height: 3,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
  },
  iconCameraBody: {
    width: 16,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCameraLens: {
    width: 6,
    height: 6,
    borderWidth: 1,
    borderRadius: 3,
  },
  iconGalleryFrame: {
    width: 16,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 2,
    position: 'absolute',
  },
  iconGalleryImage: {
    width: 8,
    height: 6,
    borderRadius: 1,
    marginTop: 3,
  },
  iconDocumentPage: {
    width: 12,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 2,
    paddingHorizontal: 2,
    paddingVertical: 3,
    justifyContent: 'space-between',
  },
  iconDocumentLine: {
    width: '100%',
    height: 1,
    borderRadius: 0.5,
  },
  iconMicBody: {
    width: 8,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 4,
    marginBottom: 1,
  },
  iconMicBase: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  iconEditPencil: {
    width: 2,
    height: 14,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  iconEditTip: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    top: 2,
    right: 2,
  },
  
  // Test button styles
  testButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  testGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Professional icon styles
  appIconInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconCross: {
    position: 'absolute',
    width: 20,
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  documentIconShape: {
    width: 16,
    height: 20,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  doctorIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorIconHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    marginBottom: 4,
  },
  doctorIconBody: {
    width: 32,
    height: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#10B981',
  },
  emptyAIIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: 60,
  },
  emptyAICircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
  },
  emptyFeatureCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
});

export default App;
