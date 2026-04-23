import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Camera as CameraIcon, X } from 'lucide-react-native';
import { analyzeTireWithClaude } from '../services/claudeAi';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { Tire } from '../store/fleetStore';
import { useCamera } from './Others/open';

interface TirePopupProps {
  tire: Tire | null;
  visible: boolean;
  onClose: () => void;
  onSave: (data: Partial<Tire>) => void;
  tiresData: Tire[];
}

const TirePopup = ({
  tire,
  visible,
  onClose,
  onSave,
  tiresData,
}: TirePopupProps) => {
  const navigation = useNavigation<any>();
  const [pressure, setPressure] = useState('');
  const [issues, setIssues] = useState('');
  const [CNSD, setCNSD] = useState('');
  const [LNSD, setLNSD] = useState('');
  const [RNSD, setRNSD] = useState('');
  const [NSD, setNSD] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [AIresult, setAIresult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { openCamera, cameraLoading, cameraError, base64, scannedImage } =
    useCamera();

  // Load saved tire data when popup opens
  useEffect(() => {
    if (tire && visible) {
      // Find saved data for this tire
      const savedTire = tiresData.find(t => t.id === tire.id);

      if (savedTire) {
        // Load saved data
        setPressure(savedTire.pressure || '');
        setIssues(savedTire.issues || '');
        setCNSD(savedTire.CNSD || '');
        setLNSD(savedTire.LNSD || '');
        setRNSD(savedTire.RNSD || '');
        setPhotoUri(savedTire.photoUri || null);
      } else {
        // Reset to default values for new inspection
        setPressure(tire.pressure || '');
        setIssues('');
        setCNSD('');
        setLNSD('');
        setRNSD('');
        setPhotoUri(null);
      }
      setAIresult(null);
    }
  }, [tire, visible, tiresData]);

  const scanFromAi = async () => {
    try {
      if (!base64) {
        throw new Error('No image captured');
      }
      const result = await analyzeTireWithClaude(base64);
      setAIresult(result);
      if (result.pressure) {
        setPressure(result.pressure);
      }
      if (result.issues) {
        setIssues(result.issues);
      }
      if (result.CNSD) setCNSD(result.CNSD.toString());
      if (result.LNSD) setLNSD(result.LNSD.toString());
      if (result.RNSD) setRNSD(result.RNSD.toString());

      setPhotoUri(base64);
    } catch (error) {
      console.error('Error analyzing tire:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (base64) {
      scanFromAi();
    }
  }, [base64]);

  if (!tire) return null;

  const handleSave = () => {
   //if all NSD are number greater or equal to 0
   if (parseInt(LNSD) < 0 || parseInt(CNSD) < 0 || parseInt(RNSD) < 0) {
    Alert.alert('Error', 'NSD should be a number');
    return;
   }

    onSave({
      id: tire.id,
      pressure,
      NSD: `${LNSD || 0}, ${CNSD || 0}, ${RNSD || 0}`,
      CNSD: CNSD || '0',
      LNSD: LNSD || '0',
      RNSD: RNSD || '0',
      issues,
      photoUri: base64 || photoUri || undefined,
      hasIssue: issues.length > 0,
    });

    onClose();
  };

  const handleAiScan = async () => {
    setAIresult(null);
    setIsScanning(true);
    await openCamera();
  };

  if (cameraError) {
    console.log(cameraError);
    Alert.alert('Error', cameraError);
  }

  const imageUri = base64
    ? `data:image/jpeg;base64,${base64}`
    : scannedImage || photoUri || undefined;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Inspect Tire {tire.position}</Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Pressure (PSI)</Text>
              <TextInput
                style={styles.input}
                value={pressure}
                maxLength={2}
                onChangeText={setPressure}
                keyboardType="numeric"
              />
              <Text style={styles.label}>NSD (mm)</Text>
              <TextInput
                style={styles.input}
                value={NSD || `${LNSD || 0}, ${CNSD || 0}, ${RNSD || 0}`}
                onChangeText={text => {
                  setNSD(text);
                  const parts = text.split(',');
                  if (parts.length >= 3) {
                    setLNSD(parts[0].trim());
                    setCNSD(parts[1].trim());
                    setRNSD(parts[2].trim());
                  }
                }}
                maxLength={11}
                keyboardType="default"
              />

              <Text style={styles.label}>Issues</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={issues}
                onChangeText={setIssues}
                multiline
              />

              <View style={styles.photoSection}>
                {base64 || scannedImage || photoUri ? (
                  <Image
                    source={imageUri ? { uri: imageUri } : undefined}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.emptyPhoto}>
                    <CameraIcon size={40} color={COLORS.textSecondary} />
                    <Text>No photo captured</Text>
                  </View>
                )}
                {AIresult?.error && (
                  <View style={styles.aiError}>
                    <Text style={styles.aiErrorValue}>
                      {AIresult?.error.toString()}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.cameraButton,
                    (cameraLoading || isScanning) && { opacity: 0.7 },
                  ]}
                  onPress={handleAiScan}
                  disabled={cameraLoading || isScanning}
                >
                  <CameraIcon size={20} color="#fff" />
                  <Text style={styles.buttonText}>
                    {cameraLoading || isScanning
                      ? 'AI Checking...'
                      : 'Capture for AI Check'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Complete Inspection</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  content: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  body: {
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: SIZES.sm,
    color: COLORS.text,
  },
  aiError: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
    width: '100%',
  },
  aiErrorText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
  aiErrorValue: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginTop: -5,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  photoSection: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  emptyPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    marginTop: 8,
  },
  cameraButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
    gap: 5,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: 'bold',
  },
});

export default TirePopup;
