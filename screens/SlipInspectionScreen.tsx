import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import {
  Camera,
  Image as ImageIcon,
  Save,
  FileText,
  Truck,
  User,
  Calendar,
  MapPin,
  Package,
  Weight,
  CreditCard,
  ClipboardList,
  ChevronDown,
  Check,
  CheckCircle,
} from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../services/globalStorage/rudux/store';
import {
  uploadSlip,
  saveSlip,
  clearSlipData,
  getPrompts,
} from '../services/globalStorage/rudux/slices/SlipSlice';
import { convertToStandardDate } from '../components/Others/Functions';

const initialFormData = {
  chId: '',
  truckNo: '',
  driverId: '',
  chNo: '',
  date: new Date().toISOString().split('T')[0].split('-').reverse().join('/'),
  owner: '',
  loadStation: '',
  chDest: '',
  tWt: '',
  truckFreight: '',
  advance: '',
  lbrCgr: '',
  addOther: '',
  lessOther: '',
  netTrfreight: '',
  status: '',
  cBy: '',
  cDate: '',
  luBy: '',
  luDate: '',
  lock: '',
  tripID: '',
  agentId: '',
  commission: '',
  grNo: '',
  consignor: '',
  consignee: '',
  goodsDesc: '',
  totPkg: '',
  trnsId: '',
  chNote: '',
  unldDate: '',
  unldChrg: '',
  unldBy: '',
  unldNote: '',
  tds: '',
  payableAt: '',
  transporter: '',
  payableBy: '',
  advToBranch: '',
  rate: '',
  bkgFreight: '',
  unldWeight: '',
  branch: '',
  shortage: '',
  ownerPan: '',
  commisionPaidBy: '',
  paidDate: '',
  grDate: '',
  packageType: '',
  weightPerPackage: '',
  freightType: '',
  rateType: '',
  extraTruckFreight: '',
  greenTax: '',
  balanceRecievedBy: '',
  lessMulsiana: '',
  lessClaim: '',
  detention: '',
  minimumWeight: '',
  amount: '',
  invoiceNo: '',
  customerName: '',
  invoiceDate: '',
  hsn: '',
  driverName: '',
  podrReceivedBy: '',
  isPodRecieved: '',
  podDate: '',
  deliveryDate: '',
  reportingDate: '',
  delayReason: '',
  podRemark: '',
  loadStationText: '',
  chDestText: '',
  tax1: '',
  tax2: '',
  ownerFreight: '',
  tripNoPrefix: '',
  tripNoSuffix: '',
  manualTripNo: '',
  hastime: '',
  isOwnGr: '',
  originName: '',
  originAddress: '',
  originCity: '',
  originState: '',
  originCountry: '',
  originPinCode: '',
  originLatitude: '',
  originLongitude: '',
  destinationName: '',
  destinationAddress: '',
  destinationCity: '',
  destinationState: '',
  destinationCountry: '',
  destinationPinCode: '',
  destinationLatitude: '',
  destinationLongitude: '',
  taxableValue: '',
  taxGroup: '',
  tripDistance: '',
  tripDistanceUnit: '',
  tripDuration: '',
  tripDurationUnit: '',
  tripWeight: '',
  tripWeightUnit: '',
  shipToParty: '',
  vehicleType: '',
  vehicleOwner: '',
  vehicleOwnership: '',
  expectedCompletedDate: '',
  tripStatus: '',
  completedBy: '',
  completedDate: '',
  completeKms: '',
  podSubmitDate: '',
  rcvdPkgs: '',
  rcvdWeight: '',
  startKM: '',
  customFieldJSON: '',
  tripStartDate: '',
  tripEndDate: '',
  returnDestination: '',
  ownFreight: '',
  accountCtrl2: '',
  userAgent: '',
  helper: '',
  descriptions: '',
};



const SlipInspectionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { prompts,promptError,promptLoading, loading: isAnalyzing, saving: isSaving, error } = useSelector(
    (state: RootState) => state.slip,
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('1');
  const [promptModalVisible, setPromptModalVisible] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImageCapture = useCallback(
    async (type: 'camera' | 'library') => {
      const options = {
        mediaType: 'photo' as const,
        includeBase64: true,
        quality: 0.7,
      };

      const result =
        type === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel || !result.assets?.[0]?.base64) return;

      const base64 = result.assets[0].base64;
      setImageUri(result.assets[0].uri || null);
      if (base64) {
        setBase64Image(base64);
      }

      try {
        const resultAction = await dispatch(
          uploadSlip({ imageUri: result.assets[0].uri, promptId: selectedPromptId || undefined })
        );

        if (uploadSlip.fulfilled.match(resultAction)) {
          const responseData = resultAction.payload;
          const aiData = responseData?.data || {};

          const cleanedAiData = Object.keys(aiData).reduce((acc, key) => {
            acc[key] =
              aiData[key] === null ? '' : aiData[key]?.toString() || '';
            return acc;
          }, {} as any);

          setFormData(prev => ({
            ...prev,
            ...cleanedAiData,
            descriptions:
              responseData?.message || 'Slip data extracted successfully',
          }));
          Alert.alert(
            'Success',
            responseData?.message || 'Slip data extracted successfully!',
          );
        } else {
          Alert.alert(
            'Scan Failed',
            (resultAction.payload as string) || 'Failed to extract data',
          );
        }
      } catch (error) {
        console.log('OCR Error:', error);
        Alert.alert('Error', 'An error occurred during slip analysis.');
      }
    },
    [dispatch, selectedPromptId],
  );


  useEffect(() => {
    dispatch(getPrompts());
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setImageUri(null);
      setBase64Image(null);
      setFormData(initialFormData);
      await dispatch(getPrompts() as any);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);


  const handleSave = useCallback(async () => {
    try {
      const payload = {
        ...formData,
        date: new Date()
          .toISOString()
          .split('T')[0]
          .split('-')
          .reverse()
          .join('/'),
        grDate: formData.grDate ? convertToStandardDate(formData.grDate) : '',
        invoiceDate: formData.invoiceDate ? convertToStandardDate(formData.invoiceDate) : '',
        base64Image: base64Image || '',
      };

      // if (!payload.grDate) {
      //   Alert.alert('Error', 'Please enter a valid GR date format DD-MM-YYYY.');
      //   return;
      // }

      const resultAction = await dispatch(saveSlip(payload));

      if (saveSlip.fulfilled.match(resultAction)) {
        Alert.alert('Success', 'Slip saved to trip successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setImageUri(null);
              setBase64Image(null);
              dispatch(clearSlipData());
              setFormData({
                ...initialFormData,
                date: new Date()
                  .toISOString()
                  .split('T')[0]
                  .split('-')
                  .reverse()
                  .join('/'),
              });
            },
          },
        ]);
      } else {
        Alert.alert(
          'Save Failed',
          (resultAction.payload as string) || 'Failed to save slip',
        );
      }
    } catch (error) {
      console.log('Save Error:', error);
      Alert.alert('Error', 'An error occurred while saving the slip.');
    }
  }, [dispatch, formData]);

  const renderInput = useCallback(
    (label: string, field: string, icon: any, placeholder = '') => (
      <View style={styles.inputContainer}>
        <View style={styles.iconWrapper}>
          {React.createElement(icon, { size: 20, color: COLORS.primary })}
        </View>
        <TextInput
          label={label}
          value={formData[field as keyof typeof formData]}
          onChangeText={val => handleInputChange(field, val)}
          mode="outlined"
          style={styles.input}
          placeholder={placeholder}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
          dense
        />
      </View>
    ),
    [formData, handleInputChange],
  );

  return (
    <View style={styles.container}>
      <Header title="Slip Inspection" />
      <ScrollView
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
          <Text style={styles.title}>Slip Inspection</Text>
          <Text style={styles.subtitle}>AI-Powered Fleet Safety</Text>
        </View>

        <Surface style={styles.uploadCard} elevation={2}>
          <Text style={styles.cardTitle}>Scan Transport Slip</Text>
          <Text style={styles.cardSubtitle}>
            Upload or capture an image to extract details
          </Text>

          <TouchableOpacity
            style={styles.promptDropdown}
            onPress={() => setPromptModalVisible(true)}
          >
            <Text style={styles.promptDropdownText}>
              {prompts?.find((p: any) => p.promptID === selectedPromptId)?.promptName || 'Select Prompt (Optional)'}
            </Text>
            <ChevronDown size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {(promptError || error) && (
            <Text style={{ color: COLORS.error, fontSize: SIZES.sm, marginTop: -SPACING.sm, marginBottom: SPACING.md, alignSelf: 'flex-start', paddingHorizontal: 4 }}>
              {String(promptError || error)}
            </Text>
          )}

          <View style={styles.imagePreviewContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <FileText
                  size={48}
                  color={COLORS.textSecondary}
                  strokeWidth={1}
                />
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}
            {isAnalyzing && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator
                  animating={true}
                  color={COLORS.primary}
                  size="large"
                />
                <Text style={styles.loadingText}>Analyzing Slip...</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={() => handleImageCapture('camera')}
              icon={() => <Camera size={18} color="#fff" />}
              style={styles.actionButton}
            >
              Camera
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleImageCapture('library')}
              icon={() => <ImageIcon size={18} color={COLORS.primary} />}
              style={styles.actionButton}
            >
              Gallery
            </Button>
          </View>
        </Surface>

        <Surface style={styles.formCard} elevation={1}>
          <Text style={styles.sectionTitle}>Slip Details</Text>
          {renderInput('Customer Name', 'customerName', User, 'e.g. Acme Corp')}
          {renderInput('Truck Number', 'truckNo', Truck, 'e.g. DN09R93277')}
          {renderInput('Driver Name', 'driverName', User, 'e.g. Rocher')}
          {renderInput('GR Number', 'grNo', ClipboardList, 'e.g. 011396')}
          {renderInput('GR Date', 'grDate', Calendar, 'dd/MM/yyyy')}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              {renderInput('Load Station', 'loadStation', MapPin)}
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              {renderInput('Dest Station', 'chDest', MapPin)}
            </View>
          </View>

          {renderInput('Consignor', 'consignor', User)}
          {renderInput('Consignee', 'consignee', User)}
          {renderInput('Goods Description', 'goodsDesc', Package)}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              {renderInput('Total Pkg', 'totPkg', Package)}
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              {renderInput('Total Weight', 'tWt', Weight)}
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              {renderInput('Truck Freight', 'truckFreight', CreditCard)}
            </View>
            <View style={{ width: 10 }} />
            <View style={{ flex: 1 }}>
              {renderInput('Advance', 'advance', CreditCard)}
            </View>
          </View>

          {renderInput('Invoice Number', 'invoiceNo', FileText)}
          {renderInput('Invoice Date', 'invoiceDate', Calendar, 'dd/MM/yyyy')}
          {renderInput('Package Type', 'packageType', Package)}
          {renderInput('Descriptions', 'descriptions', FileText)}
        </Surface>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
          icon={() => <Save size={24} color="#fff" />}
        >
          {isSaving ? 'Saving...' : 'Save to Trip'}
        </Button>
      </ScrollView>

      {/* Prompt Selection Modal */}
      <Modal
        visible={promptModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPromptModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPromptModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Prompt</Text>
                  <TouchableOpacity onPress={() => setPromptModalVisible(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
                {promptLoading ? (
                  <ActivityIndicator color={COLORS.primary} size="small" />
                ) : (
                  <FlatList
                    data={prompts}
                    keyExtractor={(item, index) => item.promptID || index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.promptItem}
                        onPress={() => {
                          setSelectedPromptId(item.promptID);
                          setPromptModalVisible(false);
                        }}
                      >
                        <View style={{ flex: 1, paddingRight: SPACING.md }}>
                          <Text style={styles.promptItemText}>{item.promptName}</Text>
                          {item.detailedPrompt ? (
                            <Text style={styles.detailedPromptText} numberOfLines={2}>
                              {item.detailedPrompt.replace(/\r\n|\n/g, ' ').trim()}
                            </Text>
                          ) : null}
                        </View>
                        {selectedPromptId === item.promptID && (
                          <CheckCircle size={20} color={COLORS.success} />
                        )}
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>No prompts available</Text>
                    }
                  />
                )}
                <TouchableOpacity
                   style={styles.promptItem}
                   onPress={() => {
                     setSelectedPromptId('1');
                     setPromptModalVisible(false);
                   }}
                 >
                   <Text style={[styles.promptItemClear, { color: COLORS.error,width:"100%",textAlign:'right' }]}>Clear Selection</Text>
                 </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  uploadCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  promptDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: SPACING.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  promptDropdownText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  promptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  promptItemText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  promptItemClear: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  detailedPromptText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginVertical: SPACING.lg,
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
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  formCard: {
    padding: SPACING.md,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconWrapper: {
    width: 36,
    alignItems: 'center',
    marginTop: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonContent: {
    height: 56,
  },
  saveButtonLabel: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default SlipInspectionScreen;
