import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
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
} from '../services/globalStorage/rudux/slices/SlipSlice';
import { convertToStandardDate } from '../components/Others/Functions';

const SlipInspectionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading: isAnalyzing, saving: isSaving } = useSelector(
    (state: RootState) => state.slip,
  );
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    truckNo: '',
    driverId: '',
    driverName: '',
    chNo: '',
    date: new Date().toISOString().split('T')[0].split('-').reverse().join('/'),
    owner: '',
    loadStation: '',
    chDest: '',
    tWt: '',
    truckFreight: '',
    advance: '',
    lbrCgr: '0',
    addOther: '0',
    lessOther: '0',
    netTrFreight: '0',
    tripId: '',
    agentId: '',
    commission: '0',
    grNo: '',
    consignor: '',
    consignee: '',
    goodsDesc: '',
    totPkg: '',
    trnsId: '',
    chNote: '',
    tds: '0',
    transporter: '',
    rate: '0',
    bkgFreight: '0',
    branch: '',
    freightType: '',
    rateType: '',
    packageType: '',
    invoiceNo: '',
    hsn: '',
    grDate: '',
    descriptions: '',
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImageCapture = useCallback(async (type: 'camera' | 'library') => {
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

    try {
      const resultAction = await dispatch(uploadSlip(result.assets[0].uri));

      if (uploadSlip.fulfilled.match(resultAction)) {
        const aiData = resultAction.payload;
        setFormData(prev => ({
          ...prev,
          truckNo: aiData.truckNo || prev.truckNo,
          driverName: aiData.driverName || prev.driverName,
          grNo: aiData.grNo || prev.grNo,
          grDate: aiData.date || prev.grDate,
          loadStation: aiData.loadStation || prev.loadStation,
          chDest: aiData.chDest || prev.chDest,
          consignor: aiData.consignor || prev.consignor,
          consignee: aiData.consignee || prev.consignee,
          goodsDesc: aiData.goodsDesc || prev.goodsDesc,
          totPkg: aiData.totPkg?.toString() || prev.totPkg,
          tWt: aiData.tWt?.toString() || prev.tWt,
          truckFreight: aiData.truckFreight?.toString() || prev.truckFreight,
          advance: aiData.advance?.toString() || prev.advance,
          invoiceNo: aiData.invoiceNo || prev.invoiceNo,
          packageType: aiData.packageType || prev.packageType,
          descriptions: aiData.message || 'Slip data extracted successfully',
        }));
        Alert.alert(
          'Success',
          aiData.message || 'Slip data extracted successfully!',
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
        tWt: parseFloat(formData.tWt) || 0,
        truckFreight: parseFloat(formData.truckFreight) || 0,
        advance: parseFloat(formData.advance) || 0,
        lbrCgr: parseFloat(formData.lbrCgr) || 0,
        addOther: parseFloat(formData.addOther) || 0,
        lessOther: parseFloat(formData.lessOther) || 0,
        netTrFreight: parseFloat(formData.netTrFreight) || 0,
        commission: parseFloat(formData.commission) || 0,
        totPkg: parseInt(formData.totPkg) || 0,
        tds: parseFloat(formData.tds) || 0,
        rate: parseFloat(formData.rate) || 0,
        bkgFreight: parseFloat(formData.bkgFreight) || 0,
        grDate: convertToStandardDate(formData.grDate),
      };

      if (!payload.grDate) {
        Alert.alert('Error', 'Please enter a valid GR date format DD-MM-YYYY.');
        return;
      }

      const resultAction = await dispatch(saveSlip(payload));

      if (saveSlip.fulfilled.match(resultAction)) {
        Alert.alert('Success', 'Slip saved to trip successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setImageUri(null);
              dispatch(clearSlipData());
              setFormData({
                truckNo: '',
                driverId: '',
                driverName: '',
                chNo: '',
                date: new Date()
                  .toISOString()
                  .split('T')[0]
                  .split('-')
                  .reverse()
                  .join('/'),
                owner: '',
                loadStation: '',
                chDest: '',
                tWt: '',
                truckFreight: '',
                advance: '',
                lbrCgr: '0',
                addOther: '0',
                lessOther: '0',
                netTrFreight: '0',
                tripId: '',
                agentId: '',
                commission: '0',
                grNo: '',
                consignor: '',
                consignee: '',
                goodsDesc: '',
                totPkg: '',
                trnsId: '',
                chNote: '',
                tds: '0',
                transporter: '',
                rate: '0',
                bkgFreight: '0',
                branch: '',
                freightType: '',
                rateType: '',
                packageType: '',
                invoiceNo: '',
                hsn: '',
                grDate: '',
                descriptions: '',
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

  const renderInput = useCallback((
    label: string,
    field: string,
    icon: any,
    placeholder = '',
  ) => (
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
  ), [formData, handleInputChange]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Slip Inspection" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Slip Inspection</Text>
          <Text style={styles.subtitle}>AI-Powered Fleet Safety</Text>
        </View>

        <Surface style={styles.uploadCard} elevation={2}>
          <Text style={styles.cardTitle}>Scan Transport Slip</Text>
          <Text style={styles.cardSubtitle}>
            Upload or capture an image to extract details
          </Text>

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
    </SafeAreaView>
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
