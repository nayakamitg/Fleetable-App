import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  RefreshControl,
} from 'react-native';
import {
  Camera as CameraIcon,
  Calendar,
  DollarSign,
  Droplets,
  ChevronRight,
  Image as ImageIcon,
  X,
  Receipt,
} from 'lucide-react-native';
import { analyzeFuelWithClaude } from '../services/claudeAi';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import VehicleDropdown from '../components/VehicleDropdown';

import Header from '../components/Header';
import { useCamera, useGallery } from '../components/Others/open';
import { TireLoader } from '../components/UI/loader';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../services/globalStorage/rudux/store';
import { Vehicle } from '../store/fleetStore';
import CheckBox from '@react-native-community/checkbox';
import {
  addFuelEntry,
  fetchFuelHistory,
  resetFuelEntryState,
  resetFuelHistory,
} from '../services/globalStorage/rudux/slices/fuelEntrySlice';
import FuelHistoryModal from '../components/FuelHistoryPopup';
import { convertToStandardDate, isValidDDMMYYYY } from '../components/Others/Functions';
import { useLoginContext } from '../services/globalStorage/contextApi/loginContext';

const FuelEntryScreen = () => {
  const {
    loading: vehiclesLoading,
    error: vehiclesError,
  } = useSelector((state: RootState) => state.vehicles);
  const {
    loading: addLoading,
    success,
    error: addError,
    historyData,
    historyLoading,
  } = useSelector((state: RootState) => state.fuelEntry);
  const dispatch = useDispatch();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
  const [isFullTank, setIsFullTank] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const vehicleRef = useRef<View>(null);
  const [showHistory, setShowHistory] = useState(false);
  const {user, loggedIn} = useLoginContext();
  const {
    openCamera,
    base64: cameraBase64,
    cameraError,
    cameraLoading,
    scannedImage: cameraScannedImage,
    resetCamera,
  } = useCamera();
  const {
    openGallery,
    base64: galleryBase64,
    galleryError,
    galleryLoading,
    scannedImage: galleryScannedImage,
    resetGallery,
  } = useGallery();

  const [error, setError] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [fuelData, setFuelData] = useState({
    type: '',
    recieptNo: '',
    quantity: '',
    rate: '',
    amount: '',
    date: convertToStandardDate(new Date().toLocaleDateString()),
  });
  const [showOptions, setShowOptions] = useState(false);
  const [formError, setFormError] = useState({
    quantity: false,
    rate: false,
    amount: false,
    type: false,
    vehicle: false,
  });

  const resetScanState = () => {
    setError(null);
    resetCamera();
    resetGallery();
    setFuelData({
      type: '',
      recieptNo: '',
      quantity: '',
      rate: '',
      amount: '',
      date: convertToStandardDate(new Date().toLocaleDateString()),
    });
  };

  const isInvalid = (val: any) =>
    !val ||
    val === 'Unknown' ||
    val === 'unknown' ||
    String(val).toLowerCase() === 'n/a';

  const updateFuelData = (data: any) => {
    if (data?.networkError) {
      setError('Please check your internet connection');
      return;
    }
    if (
      isInvalid(data.fuelType) &&
      isInvalid(data.Quantity) &&
      isInvalid(data.recieptNo) &&
      isInvalid(data.Price) &&
      isInvalid(data.Total) &&
      isInvalid(data.Date)
    ) {
      setError('Please select clear image of fuel slip or pump slip');
      return;
    }
    setError(null);
    setFuelData(prev => ({
      ...prev,
      type: !isInvalid(data.fuelType) ? data.fuelType : prev.type,
      quantity: !isInvalid(data.Quantity)
        ? String(data.Quantity)
        : prev.quantity,
      rate: !isInvalid(data.Price) ? String(data.Price) : prev.rate,
      amount: !isInvalid(data.Total) ? String(data.Total) : prev.amount,
      date: !isInvalid(data.Date) ? data.Date : prev.date,
      recieptNo: !isInvalid(data.recieptNo)
        ? String(data.recieptNo)
        : prev.recieptNo,
    }));
  };

  const searchFromAi = async (imgBase64: string) => {
    setError(null);
    setFormError({
    quantity: false,
    rate: false,
    amount: false,
    type: false,
    vehicle: false,
  });
    setIsAiProcessing(true);
    try {
      const aiResult = await analyzeFuelWithClaude(imgBase64);
      updateFuelData(aiResult);
    } catch (err: any) {
      const message: string = err?.message || String(err) || '';
      if (message.includes('Image size is too large')) {
        setError('Image size is too large. Please try a smaller or compressed image.');
      } else if (message.includes('Network request failed') || message.includes('network')) {
        setError('Please check your internet connection.');
      } else if (message) {
        setError(`AI Error: ${message}`);
      } else {
        setError('Analysis failed. Could not extract data from the image.');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handle Camera Hook Outputs
  useEffect(() => {
    if (cameraError) {
      setError(cameraError);
    }
    if (cameraBase64) {
      searchFromAi(cameraBase64);
    }
  }, [cameraBase64, cameraError]);

  // Handle Gallery Hook Outputs
  useEffect(() => {
    if (galleryError) {
      setError(galleryError);
    }
    if (galleryBase64) {
      searchFromAi(galleryBase64);
    }
  }, [galleryBase64, galleryError]);

  const handleAIScan = () => {
    resetScanState();
    setFormError({
    quantity: false,
    rate: false,
    amount: false,
    type: false,
    vehicle: false,
  });
    setShowOptions(true);
  };


  const scrollToVehicle = () => {
    vehicleRef.current?.measureLayout(
      scrollRef.current,
      (x, y) => {
        scrollRef.current?.scrollTo({ y: y-100, animated: true });
      },
      () => console.log("Error measuring layout")
    );
  };

  const validateForm = () => {
    let errors = {
      quantity: false,
      rate: false,
      amount: false,
      date: false,
      type: false,
      vehicle: false,
    };
    let isValid = true;

    if (!selectedVehicle) {
      scrollToVehicle();
      errors.vehicle = true;
      isValid = false;
    }

    if (!fuelData.quantity) {
      errors.quantity = true;
      isValid = false;
    }
    if (!fuelData.rate) {
      errors.rate = true;
      isValid = false;
    }

    if (!fuelData.amount) {
      errors.amount = true;
      isValid = false;
    }

    if (!fuelData.date) {
      errors.date = true;
      isValid = false;
    }

    if (!fuelData.type) {
      errors.type = true;
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const handleSave = () => {
    if (!user || !loggedIn) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    if (!isValidDDMMYYYY(fuelData.date || '')) {
      Alert.alert('Error', 'Please enter a valid date in dd/mm/yyyy format.');
      return;
    }
    if (!validateForm()) {
      return;
    }
    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle first.');
      return;
    }

    if (!fuelData.quantity || !fuelData.amount) {
      Alert.alert(
        'Error',
        'Please fill in required fields (Quantity and Amount).',
      );
      return;
    }

    const payload = {
      truckNo: selectedVehicle.vehicleNo,
      odometerId: '0',
      date: convertToStandardDate(fuelData?.date || ''), //dd/MM/yyyy
      fuel: parseFloat(fuelData.quantity) || 0,
      rateOfFuel: parseFloat(fuelData.rate) || 0,
      vendor: '',
      partialFill: isFullTank,
      tripId: '',
      note: '',
      amount: parseFloat(fuelData.amount) || 0,
      transactionId: fuelData.recieptNo || '',
      importFrom: 'Fuel Slip',
      settlementId: '',
      ftlTripId: '',
      cgstPercent: 0,
      cgstAmount: 0,
      sgstPercent: 0,
      sgstAmount: 0,
      igstPercent: 0,
      igstAmount: 0,
      tax1Percent: 0,
      tax1Amount: 0,
      tax2Percent: 0,
      tax2Amount: 0,
      taxableAmount: parseFloat(fuelData.amount) || 0,
      netAmount: parseFloat(fuelData.amount) || 0,
      fuelType: fuelData.type || '',
    };

    dispatch(addFuelEntry(payload) as any);
  };

  useEffect(() => {
    if (success) {
      Alert.alert('Success', 'Fuel entry saved successfully.', [
        {
          text: 'OK',
          onPress: () => {
            resetScanState();
            dispatch(resetFuelEntryState());
          },
        },
      ]);
    }
    if (addError) {
      Alert.alert('Error', addError);
    }
  }, [success, addError, dispatch]);

  useEffect(() => {
    if (vehiclesError) {
      setError(vehiclesError);
    }
  }, [vehiclesError]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      resetScanState();
      if (selectedVehicle?.vehicleNo) {
        await dispatch(fetchFuelHistory(selectedVehicle.vehicleNo) as any);
      }
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, selectedVehicle, resetScanState]);

  const isScanning =
    cameraLoading ||
    galleryLoading ||
    isAiProcessing ||
    addLoading ||
    historyLoading;
  const currentScannedImage = cameraScannedImage || galleryScannedImage;

  if (vehiclesLoading) {
    <View style={styles.loadingOverlay}>
      <TireLoader size={26} color={COLORS.primary} text="Loading Vehicles..." />
    </View>;
  }
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {isScanning && (
        <View style={styles.loadingOverlay}>
          <TireLoader
            size={26}
            color={COLORS.primary}
            text="AI Analyzing Image..."
          />
        </View>
      )}
      <Header title="Fuel Entry" />
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Fuel Entry</Text>
          <Text style={styles.subtitle}>AI Receipt Scanning</Text>
        </View>

        <VehicleDropdown
        ref={vehicleRef}
          selectedVehicle={selectedVehicle}
          onSelect={vehicle => {
            setFormError({ ...formError, vehicle: false });
            setSelectedVehicle(vehicle);
            if (vehicle) {
              dispatch(fetchFuelHistory(vehicle.vehicleNo) as any);
            } else {
              dispatch(resetFuelHistory());
            }
          }}
        />

        {formError.vehicle && (
          <Text style={styles.errorText}>Please select a vehicle</Text>
        )}

        {selectedVehicle && (
          <TouchableOpacity
            style={{
              padding: 10,
              marginTop: -10,
              borderRadius: 10,
              alignItems: 'start',
              marginBottom: 10,
            }}
            onPress={() => setShowHistory(true)}
            disabled={!selectedVehicle || historyLoading}
          >
            <Text
              style={{
                color: COLORS.primary,
                textDecorationLine: 'underline',
                fontWeight: 'bold',
                fontSize: SIZES.md,
              }}
            >
              {historyLoading ? 'Loading History...' : 'See Fuel History'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.scanSection}>
          <TouchableOpacity
            style={styles.scanCard}
            onPress={handleAIScan}
            disabled={isScanning}
          >
            <View style={styles.scanIconContainer}>
              <CameraIcon color={COLORS.primary} size={32} />
            </View>
            <View style={styles.scanTextContainer}>
              <Text style={styles.scanTitle}>
                {isScanning ? 'AI Extracting Data...' : 'Scan Fuel Slip / Pump'}
              </Text>
              <Text style={styles.scanSubtitle}>
                Auto-fill details using AI
              </Text>
            </View>
            <ChevronRight color={COLORS.border} size={24} />
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reciept No/Slip No</Text>
            <View style={styles.inputWrapper}>
              <Receipt
                color={COLORS.textSecondary}
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={fuelData.recieptNo || ''}
                placeholder="Enter Reciept No/Slip No"
                onChangeText={text =>
                  setFuelData({ ...fuelData, recieptNo: text })
                }
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fuel Type</Text>
            <View style={styles.inputWrapper}>
              <Droplets
                color={COLORS.textSecondary}
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={fuelData.type || ''}
                placeholder="Diesel, Petrol etc"
                onChangeText={text =>{
                  setFormError({ ...formError, type: false });
                  setFuelData({ ...fuelData, type: text })}}
              />
            </View>
          </View>

          {formError.type && (
            <Text style={styles.errorText}>Please select a fuel type</Text>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Quantity (Ltrs)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0.0"
                    value={fuelData.quantity || ''}
                    onChangeText={text =>{
                      setFormError({ ...formError, quantity: false });
                      setFuelData({ ...fuelData, quantity: text })}}
                  />
                  <Text
                    style={[
                      styles.label,
                      {
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 5,
                      },
                    ]}
                  >
                    Ltrs
                  </Text>
                </View>
              </View>
              {formError.quantity && (
                <Text style={styles.errorText}>Please enter quantity</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Rate (per Ltr)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0.00"
                    value={fuelData.rate || ''}
                    onChangeText={text =>{
                      setFormError({ ...formError, rate: false });
                      setFuelData({ ...fuelData, rate: text })}}
                  />
                  <Text
                    style={[
                      styles.label,
                      {
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 5,
                      },
                    ]}
                  >
                    /Ltrs
                  </Text>
                </View>
              </View>
              {formError.rate && (
                <Text style={styles.errorText}>Please enter rate</Text>
              )}
            </View>
          </View>

          <View
            style={[
              styles.row,
              {
                alignItems: 'center',
                marginBottom: SPACING.md,
                marginLeft: -6,
              },
            ]}
          >
            <CheckBox
              value={isFullTank}
              onValueChange={setIsFullTank}
              tintColors={{ true: COLORS.primary, false: COLORS.border }}
              style={
                Platform.OS === 'ios' ? { transform: [{ scale: 0.8 }] } : {}
              }
            />
            <Text
              onPress={() => setIsFullTank(!isFullTank)}
              style={[styles.label, { marginBottom: 0, marginLeft: 8 }]}
            >
              Is Full Tank
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Amount</Text>
            <View style={styles.inputWrapper}>
              <DollarSign
                color={COLORS.textSecondary}
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.00"
                value={fuelData.amount || ''}
                onChangeText={text =>{
                  setFormError({ ...formError, amount: false });
                  setFuelData({ ...fuelData, amount: text })}}
              />
            </View>
          </View>
          {formError.amount && (
            <Text style={styles.errorText}>Please enter amount</Text>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputWrapper}>
              <Calendar
                color={COLORS.textSecondary}
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={fuelData.date || ''}
                placeholder="DD/MM/YYYY"
                onChangeText={text => setFuelData({ ...fuelData, date: text })}
              />
            </View>
          </View>

          <TouchableOpacity
            disabled={addLoading}
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Fuel Entry</Text>
          </TouchableOpacity>
        </View>

        {currentScannedImage && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Scanned Receipt Preview</Text>
            <Image
              source={{ uri: currentScannedImage }}
              style={styles.previewImage}
            />
          </View>
        )}

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
                    onPress={() => {
                      resetScanState();
                      setShowOptions(false);
                      openCamera();
                    }}
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
                    onPress={() => {
                      resetScanState();
                      setShowOptions(false);
                      openGallery();
                    }}
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

        {/* Fuel History Modal */}

      <FuelHistoryModal
  showHistory={showHistory}
  setShowHistory={setShowHistory}
  selectedVehicle={selectedVehicle}
  historyData={historyData}
  historyLoading={historyLoading}
/>

        {/* <Modal
          visible={showHistory}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowHistory(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowHistory(false)}>
            <View style={styles.historyModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.historyModalContainer}>
                  <View style={styles.historyModalHeader}>
                    <View style={styles.historyHeaderTitleRow}>
                      <History color={COLORS.primary} size={24} />
                      <Text style={styles.historyModalTitle}>Fuel History</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowHistory(false)}
                      style={styles.closeButton}
                    >
                      <X color={COLORS.textSecondary} size={24} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.historyVehicleNo}>
                    Vehicle: {selectedVehicle?.vehicleNo}
                  </Text>

                  {historyLoading ? (
                    <View style={styles.historyEmptyContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                  ) : historyData && historyData.length > 0 ? (
                    <ScrollView style={styles.historyList}>
                      {historyData.map((item, index) => (
                        <View
                          key={item?.fuelId || index}
                          style={styles.historyItem}
                        >
                          <View style={styles.historyItemHeader}>
                            <View style={styles.historyDateRow}>
                              <Calendar
                                color={COLORS.textSecondary}
                                size={14}
                              />
                              <Text style={styles.historyDate}>
                                {item?.dateFormatted || item?.date?.split('T')[0]}
                              </Text>
                            </View>
                            <View style={styles.historyBadge}>
                              <Text style={styles.historyBadgeText}>
                                {item?.fuelType || 'Diesel'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.historyDetailsContainer}>
                            <View style={styles.historyDetailItem}>
                              <Text style={styles.historyDetailLabel}>
                                Fuel
                              </Text>
                              <View style={styles.historyValueRow}>
                                <Fuel color={COLORS.primary} size={16} />
                                <Text style={styles.historyValue}>
                                  {item?.fuel} Ltrs
                                </Text>
                              </View>
                            </View>

                            <View style={styles.historyDetailItem}>
                              <Text style={styles.historyDetailLabel}>
                                Amount
                              </Text>
                              <View style={styles.historyValueRow}>
                                <TrendingUp color="#4CAF50" size={16} />
                                <Text style={styles.historyValue}>
                                  ₹{item?.amount}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.historyEmptyContainer}>
                      <Fuel color={COLORS.border} size={48} />
                      <Text style={styles.historyEmptyText}>
                        No fuel history found for this vehicle
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal> */}
      </ScrollView>

   
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.sm,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 4,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
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
  scanSection: {
    marginVertical: SPACING.md,
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  scanIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  scanTextContainer: {
    flex: 1,
  },
  scanTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scanSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  error: {
    color: COLORS.error || '#f44336',
    fontSize: SIZES.sm,
    marginTop: SPACING.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.text,
    borderWidth: 0,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  previewImage: {
    width: '100%',
    height: 500,
    borderRadius: 16,
    resizeMode: 'contain',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  historyButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: COLORS.border,
  },
  historyButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: SIZES.md,
  },
  historyButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  historyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  historyModalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.lg,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  historyHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyModalTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  historyVehicleNo: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  historyList: {
    marginTop: SPACING.sm,
  },
  historyItem: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 5,
  },
  historyBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyBadgeText: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  historyDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDetailItem: {
    flex: 1,
  },
  historyDetailLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  historyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyValue: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 6,
  },
  historyEmptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default FuelEntryScreen;
