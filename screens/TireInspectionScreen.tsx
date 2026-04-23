import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Camera as CameraIcon,
  Info,
  X,
  Image as ImageIcon,
  Save,
} from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { analyzeTireWithClaude } from '../services/claudeAi';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import VehicleDropdown from '../components/VehicleDropdown';
import TireLayout from '../components/TireLayout';
import TirePopup from '../components/TirePopup';
import { Vehicle, Tire } from '../store/fleetStore';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { TireLoader } from '../components/UI/loader';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../services/globalStorage/rudux/store';
import { addTireInspection } from '../services/globalStorage/rudux/slices/tyreSlice';


const SlipInspectionScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading: isSaving ,error} = useSelector((state: RootState) => state.tyres);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
  const [activeTire, setActiveTire] = useState<Tire | null>(null);
  const [tiresData, setTiresData] = useState<Tire[]>([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [inspectedTireIds, setInspectedTireIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const handleTirePress = useCallback((tire: Tire) => {
    setActiveTire(tire);
    setPopupVisible(true);
  }, []);

  const handleSaveTire = useCallback((data: Partial<Tire>) => {
    if (data.id) {
      // Add to inspected list
      setInspectedTireIds(prev => [...new Set([...prev, data.id!])]);

      // Update or add tire data
      setTiresData(prev => {
        const existingIndex = prev.findIndex(t => t.id === data.id);
        if (existingIndex >= 0) {
          // Update existing tire data
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...data };
          return updated;
        } else {
          // Add new tire data with initial tire info
          const fullTireData = activeTire
            ? { ...activeTire, ...data }
            : (data as Tire);
          return [...prev, fullTireData];
        }
      });

      setPopupVisible(false);
    }
  }, [activeTire]);

  const handleSave = async () => {
    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle first');
      return;
    }

    if (tiresData.length === 0) {
      Alert.alert(
        'Error',
        'No tire data collected. Please inspect at least one tire.',
      );
      return;
    }

    try {
      const inspectionPayload: any = {
        inspectionNo: `INSP-${Date.now()}`,
        inspectionDate: new Date()
          .toISOString()
          .split('T')[0]
          .split('-')
          .reverse()
          .join('/'),
        inspectionFor: selectedVehicle.vehicleNo,
        action: '',
        details: tiresData.map((tire: any) => ({
          tyreId: parseInt(tire.tyreId) || parseInt(tire.id),
          nsd: tire.CNSD || tire.NSD || '',
          nsdAt: '',
          truckNo: selectedVehicle.vehicleNo,
          tyrePosition: tire.position || tire.positionCode || '',
          nsdDate: new Date()
            .toISOString()
            .split('T')[0]
            .split('-')
            .reverse()
            .join('/'),
          leftNsd: tire.LNSD || tire.NSD || '',
          rightNsd: tire.RNSD || tire.NSD || '',
          truckOdo: '0',
          psi: tire.pressure || '0',
          valveCap: 'true',
          remark1: '',
          remark2: tire.issues || '',
          tyrePics: tire.photoUri || '',
          odometerId: '',
        })),
      };

      const resultAction = await dispatch(addTireInspection(inspectionPayload));

      if (addTireInspection.fulfilled.match(resultAction)) {
        setTiresData([]);
        setInspectedTireIds([]);
        setScannedImage(null);
        Alert.alert('Success', 'Tire inspection saved successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const errorMessage =
          (resultAction.payload as string) || 'Failed to save inspection';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    }
  };

  useEffect(() => {
    if(error){
      Alert.alert('Error', error);
    }
  }, [error]);
  const handleGlobalCamera = useCallback(() => {
    setShowOptions(true);
  }, []);

  const openCamera = async () => {
    setShowOptions(false);
    const result = await launchCamera({
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
    });

    if (result.didCancel || !result.assets?.[0]?.base64) return;

    setIsScanning(true);
    try {
      const base64 = result.assets[0].base64;
      setScannedImage(result.assets[0].uri || null);
      const aiResult = await analyzeTireWithClaude(base64);
      console.log('aiResult', aiResult);
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not analyze tire data.');
    } finally {
      setIsScanning(false);
    }
  };

  const openGallery = async () => {
    setShowOptions(false);
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
    });

    if (result.didCancel || !result.assets?.[0]?.base64) return;

    setIsScanning(true);
    try {
      const base64 = result.assets[0].base64;
      setScannedImage(result.assets[0].uri || null);
      const aiResult = await analyzeTireWithClaude(base64);
      Alert.alert('AI Analysis', JSON.stringify(aiResult, null, 2));
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not analyze tire data.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      <Header title="Tire Inspection" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Tire Inspection</Text>
            <Text style={styles.subtitle}>AI-Powered Fleet Safety</Text>
          </View>

          <VehicleDropdown
            selectedVehicle={selectedVehicle}
            onSelect={setSelectedVehicle}
          />

          {!selectedVehicle ? (
            <View style={styles.emptyState}>
              <Info color={COLORS.textSecondary} size={48} />
              <Text style={styles.emptyText}>
                Please select a vehicle to start inspection
              </Text>
            </View>
          ) : (
            <>
              <TireLayout
                vehicle={selectedVehicle}
                onTirePress={handleTirePress}
                inspectedTireIds={inspectedTireIds}
              />

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {inspectedTireIds.length}/
                    {parseInt(selectedVehicle.tyres) || 0}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {parseInt(selectedVehicle.tyres) -
                      inspectedTireIds.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
              </View>
            </>
          )}

          {selectedVehicle && (
            <TouchableOpacity
              style={[
                styles.saveButton,
                { opacity: tiresData.length <= 0 ? 0.5 : 1 },
              ]}
              onPress={handleSave}
              disabled={isSaving || tiresData.length <= 0}
            >
              <Text style={styles.saveButtonText}>Save Tire Inspection</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* {selectedVehicle && (
          <View style={styles.fabContainer}>
            <TouchableOpacity
              style={styles.cameraFab}
              onPress={handleGlobalCamera}
            >
              <CameraIcon color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.fabLabel}>AI Scan</Text>
          </View>
        )} */}

        <TirePopup
          tire={activeTire}
          visible={popupVisible}
          onClose={() => setPopupVisible(false)}
          onSave={handleSaveTire}
          tiresData={tiresData}
        />

        {/* Options Modal */}
        <Modal
          visible={showOptions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOptions(false)}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setShowOptions(false);
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Image Source</Text>
                  <TouchableOpacity onPress={() => setShowOptions(false)}>
                    <X color={COLORS.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={openCamera}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: '#E3F2FD' },
                      ]}
                    >
                      <CameraIcon color={COLORS.primary} size={28} />
                    </View>
                    <Text style={styles.optionText}>Camera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={openGallery}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        { backgroundColor: '#F3E5F5' },
                      ]}
                    >
                      <ImageIcon color="#9C27B0" size={28} />
                    </View>
                    <Text style={styles.optionText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Loading Overlay */}
        {isScanning && (
          <View style={styles.loadingOverlay}>
            <TireLoader
              size={48}
              color={COLORS.primary}
              text="AI Analyzing Tire..."
            />
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  saveButton: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: SIZES.md,
    marginHorizontal: SPACING.md,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: 50,
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'center',
  },
  cameraFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabLabel: {
    marginTop: 4,
    fontSize: SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    alignItems: 'center',
    width: 100,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default SlipInspectionScreen;
