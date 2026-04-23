import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  Trash2,
  Camera,
  CameraIcon,
  ImageIcon,
  X,
  Info,
} from 'lucide-react-native';
import theme from '../constants/theme';
import Header from '../components/Header';
import VehicleDropdown from '../components/VehicleDropdown';
import { Vehicle } from '../store/fleetStore';
import { useCamera, useGallery } from '../components/Others/open';

import { TabView, TabBar } from 'react-native-tab-view';
import { analyzeVehicleDamageWithClaude } from '../services/claudeAi';
import { TireLoader } from '../components/UI/loader';
import IssuePopup from '../components/IssuePopup';
import { useDispatch, useSelector } from 'react-redux';
import {
  getVehicleIssues,
  addVehicleIssue,
  removeVehicleIssue,
  updateVehicleIssue,
  VehicleIssue,
  resetAdded,
} from '../services/globalStorage/rudux/slices/vehicleIssueSlice';
import { useLoginContext } from '../services/globalStorage/contextApi/loginContext';

const { COLORS, SPACING, SIZES } = theme;

const InspectScreen = () => {
  const [issueInput, setIssueInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showIssueDetails, setShowIssueDetails] = useState({
    show: false,
    data: {},
  });
  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'newIssues':
        return (
          <NewIssues
            selectedVehicle={selectedVehicle}
            issues={issues}
            handleRemoveIssue={handleRemoveIssue}
            setShowIssueDetails={setShowIssueDetails}
          />
        );
      case 'allIssues':
        return (
          <AllIssues
            vehicleIssues={vehicleIssues}
            setShowIssueDetails={setShowIssueDetails}
            selectedVehicle={selectedVehicle}
          />
        );
      default:
        return null;
    }
  };

  const routes = [
    { key: 'newIssues', title: 'New Issues' },
    { key: 'allIssues', title: 'All Issues' },
  ];
  const {
    base64: cameraBase64,
    openCamera,
    cameraError,
    cameraLoading,
    resetCamera,
  } = useCamera();
  const {
    base64: galleryBase64,
    openGallery,
    galleryError,
    galleryLoading,
    resetGallery,
  } = useGallery();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
  const [showEssuePopup, setShowEssuePopup] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);
  const dispatch = useDispatch();
  const [showSelectVehicleError, setShowSelectVehicleError] = useState(false);
  const { vehicleIssues, added, addLoading } = useSelector(
    (state: any) => state.vehicleIssues,
  );
  const [issues, setIssues] = useState<VehicleIssue[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const layout = useWindowDimensions();
  const {user,loggedIn}=useLoginContext()

  const resetScanState = () => {
    resetCamera();
    resetGallery();
    setAiResults([]);
  };

  useEffect(() => {
    if (selectedVehicle?.vehicleNo) {
      dispatch(getVehicleIssues(selectedVehicle.vehicleNo) as any);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    if (added) {
      setShowEssuePopup(false);
      setIssues([]);
      setIssueInput('');
      dispatch(resetAdded());
    }
  }, [added]);

  console.log('vehicleIssues', vehicleIssues);

  // useEffect(() => {
  //   if (vehicleIssues) {
  //     setIssues(vehicleIssues);
  //   }
  // }, [vehicleIssues]);

  const handleAddIssue = () => {
    if (!selectedVehicle) {
      setShowSelectVehicleError(true);
      return;
    }
    else {
      setShowSelectVehicleError(false);
    }
    if (!user || !loggedIn) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    if (issueInput.trim()) {
      setTabIndex(0);
      const today = new Date();
      const formattedDate = `${String(today.getMonth() + 1).padStart(
        2,
        '0',
      )}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

      const newIssue: VehicleIssue = {
        issueId: '',
        vehicleNo: selectedVehicle.vehicleNo,
        dateOfReport: formattedDate,
        subject: 'Manual Issue1',
        note: issueInput,
        odoRead: '0',
        workshop: user?.loginBranch,
        status: 'Open',
        statusText: 'Open',
        type: 'Manual',

      };
      setIssues(prev => [newIssue, ...prev]);
      setIssueInput('');
      setShowEssuePopup(false);
    }
  };


  const handleAnalyzeImage = async (base64Image: string) => {
    try {
      setLoading(true);
      const result: any = await analyzeVehicleDamageWithClaude(base64Image);
      console.log('result', result);
      if (result && result.damageType && result.damageType.length > 0) {
        setAiResults(
          result.damageType.map((item: any) => ({ ...item, base64Image })),
        );

        setShowEssuePopup(true);
      }
      if (result?.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.log('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAiIssue = (item: {
    subject: string;
    notes: string;
    base64Image: string;
  }) => {
    if (!user || !loggedIn) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    if (selectedVehicle) {
      const today = new Date();
      const formattedDate = `${String(today.getMonth() + 1).padStart(
        2,
        '0',
      )}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

      const newIssue: VehicleIssue = {
        issueId: '',
        vehicleNo: selectedVehicle.vehicleNo,
        dateOfReport: new Date().toISOString().split('T')[0].split('-').reverse().join('/'), // current date in dd/mm/yyyy format
        subject: item.subject.toUpperCase(),
        note: item.notes,
        odoRead: '',
        workshop: user?.loginBranch,
        status: '',
        statusText: '',
        base64Image: item.base64Image,
        type: 'AI',
      };
      setIssues(prev => [newIssue, ...prev]);
    }
    setAiResults(prev =>
      prev.filter(aiItem => aiItem.subject !== item.subject),
    );
  };

  useEffect(() => {
    if (aiResults.length === 0) {
      setShowEssuePopup(false);
    }
  }, [aiResults]);

  const handleAddAllAiIssues = () => {
    if (!user || !loggedIn) {
      Alert.alert('Error', 'User not logged in');
      return;
    } 
    if (selectedVehicle) {
      const today = new Date();
      const formattedDate = `${String(today.getMonth() + 1).padStart(
        2,
        '0',
      )}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

      aiResults.forEach(item => {
        const newIssue: VehicleIssue = {
          issueId: '',
          vehicleNo: selectedVehicle.vehicleNo,
          dateOfReport: new Date().toISOString().split('T')[0].split('-').reverse().join('/'), // current date in dd/mm/yyyy format
          subject: item.subject.toUpperCase(),
          note: item.notes,
          odoRead: '0',
          workshop: user?.loginBranch,
          status: '',
          statusText: '',
          base64Image: item.base64Image,
          type: 'AI',
        };
        setIssues(prev => [newIssue, ...prev]);
      });
    }

    setShowEssuePopup(false);
    setAiResults([]);
  };

  useEffect(() => {
    if (cameraBase64) {
      handleAnalyzeImage(cameraBase64);
    }
    return () => {
      resetCamera();
    };
  }, [cameraBase64]);

  useEffect(() => {
    if (galleryBase64) {
      handleAnalyzeImage(galleryBase64);
    }
    return () => {
      resetGallery();
    };
  }, [galleryBase64]);

  console.log('showOptions', showOptions);
  const handleAiScan = async () => {
    setShowOptions(true);
  };

  const handleRemoveIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.issueId !== issueId));
  };

  const handleSaveInspection = async() => {
    // TODO: Save inspection logic
    if (!selectedVehicle) {
      setShowSelectVehicleError(true);
      return;
    }
    else {
      setShowSelectVehicleError(false);
    }
    if (!user || !loggedIn) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
    if (issues.length === 0) {
      Alert.alert('Error', 'Please add at least one issue');
      return;
    }
   dispatch(addVehicleIssue(issues) as any);

  };

  return (
    <>
      <View style={styles.container}>
        <Header title="Inspect Vehicle" />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.title}>Inspect Vehicle</Text>
          <Text style={styles.subtitle}>
            Add issues manually or use AI camera detection.
          </Text>

          <VehicleDropdown
            selectedVehicle={selectedVehicle}
            onSelect={(vehicle) => { setSelectedVehicle(vehicle); setShowSelectVehicleError(false); }}
          />
          {showSelectVehicleError && (
            <Text style={styles.errorText}>Please select a vehicle</Text>
          )}

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Broken tail light"
              placeholderTextColor={COLORS.textSecondary}
              value={issueInput}
              onChangeText={setIssueInput}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddIssue}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* AI Detect Button */}
          <TouchableOpacity
            disabled={!selectedVehicle}
            onPress={handleAiScan}
            style={[styles.aiButton, { opacity: selectedVehicle ? 1 : 0.5 }]}
          >
            <Camera size={20} color={COLORS.primary} />
            <Text style={styles.aiButtonText}>AI Detect Damage</Text>
          </TouchableOpacity>

          {/* Issues List */}

          <TabView
            navigationState={{ index: tabIndex, routes }}
            renderScene={renderScene}
            onIndexChange={setTabIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={props => (
              <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: COLORS.primary }}
                style={{
                  backgroundColor: COLORS.background,
                  elevation: 0,
                  shadowOpacity: 0,
                }}
                activeColor={COLORS.primary}
                inactiveColor={COLORS.textSecondary}
              />
            )}
            style={{
              height: 500, // Explicit height needed inside ScrollView
              backgroundColor: COLORS.background,
            }}
          />
        </ScrollView>

        {/* Save Button */}

        <TouchableOpacity
          disabled={!selectedVehicle || issues.length === 0}
          style={styles.saveButton}
          onPress={handleSaveInspection}
        >
          <Text
            style={[
              styles.saveButtonText,
              {
                opacity:
                  !selectedVehicle || issues.length === 0 || addLoading
                    ? 0.5
                    : 1,
              },
            ]}
          >
            {addLoading && <TireLoader size={20} color={COLORS.primary} />}Save
            Inspection
          </Text>
        </TouchableOpacity>
      </View>

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
            <TouchableWithoutFeedback onPress={() => {}}>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Show all essue popup */}
      <Modal
        visible={showEssuePopup}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEssuePopup(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEssuePopup(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {aiResults.length > 0 ? 'Detected Damage' : 'Add Issue'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowEssuePopup(false)}>
                    <X color={COLORS.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>

                {aiResults.length > 0 ? (
                  <View>
                    <ScrollView style={{ maxHeight: 300 }}>
                      {aiResults.map((item, index) => (
                        <View key={index} style={styles.aiResultItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.aiResultType}>
                              {item.subject.toUpperCase()}
                            </Text>
                            <View style={styles.aiResultDesc}>
                              {item.base64Image && (
                                <Image
                                  source={{
                                    uri: `data:image/jpeg;base64,${item.base64Image}`,
                                  }}
                                  style={styles.issueImage}
                                />
                              )}
                              <Text style={{ width: '80%' }}>{item.notes}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.aiAddButton}
                            onPress={() => handleAddAiIssue(item)}
                          >
                            <Text style={styles.aiAddButtonText}>Add</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.addAllButton}
                      onPress={handleAddAllAiIssues}
                    >
                      <Text style={styles.addAllButtonText}>Add All Items</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View >
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Broken tail light"
                      placeholderTextColor={COLORS.textSecondary}
                      value={issueInput}
                      onChangeText={setIssueInput}
                    />
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={handleAddIssue}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Issue details centered Model */}
      <IssuePopup
        visible={showIssueDetails.show}
        onClose={() => setShowIssueDetails({ show: false, data: {} })}
        data={showIssueDetails.data}
        onSave={data => {
          setShowIssueDetails({ show: false, data: {} });
          // Update the issues list logic if needed, currently just closing to match behavior of "Done"
          if ((data as any).issueId) {
            dispatch(updateVehicleIssue(data as VehicleIssue) as any);
          }
        }}
      />




      {loading && (
        <View style={styles.loadingOverlay}>
          <TireLoader text="Analyzing Damage..." />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  issueDetailsContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.sm,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
    marginTop: -SPACING.sm,
  },
  issueImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: SPACING.md,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  aiButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  issuesContainer: {
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  issueText: {
    fontSize: SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  saveButton: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#0084D0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
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
  aiResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiResultType: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
    letterSpacing: 1,
  },
  aiResultDesc: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: SIZES.sm,
    color: COLORS.text,
  },
  aiAddButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    marginLeft: SPACING.md,
  },
  aiAddButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  addAllButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  addAllButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default InspectScreen;

export const NewIssues = ({
  selectedVehicle,
  issues,
  handleRemoveIssue,
  setShowIssueDetails,
  isAllIssues,
}: any) => {
  return (
    <View style={{ paddingVertical: SPACING.sm }}>
      {selectedVehicle ? (
        <View style={styles.issuesContainer}>
          {issues.length > 0 ? (
            issues.map((issue: any) => (
              <View key={issue?.issueId} style={styles.issueItem}>
                {issue?.base64Image && (
                  <TouchableOpacity
                    onPress={() =>
                      setShowIssueDetails({
                        show: true,
                        data: issue,
                      })
                    }
                  >
                    <Image
                      source={{
                        uri: issue?.base64Image?.startsWith('data:')
                          ? issue.base64Image
                          : `data:image/jpeg;base64,${issue?.base64Image}`,
                      }}
                      style={styles.issueImage}
                    />
                  </TouchableOpacity>
                )}
                <Text
                  style={styles.issueText}
                  onPress={() =>
                    setShowIssueDetails({
                      show: true,
                      data: issue,
                    })
                  }
                >
                  {issue?.note}
                </Text>
                {!isAllIssues && <TouchableOpacity
                  onPress={() => handleRemoveIssue(issue?.issueId)}
                >
                  <Trash2 size={18} color={COLORS.error} />
                </TouchableOpacity>}
              </View>
            ))
          ) : (
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 40,
              }}
            >
              <Info size={32} color={COLORS.textSecondary} />
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: SIZES.md,
                  marginTop: 10,
                }}
              >
                No issues found
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
          }}
        >
          <Info size={32} color={COLORS.textSecondary} />
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: SIZES.md,
              marginTop: 10,
            }}
          >
            Please select a vehicle to see issues
          </Text>
        </View>
      )}
    </View>
  );
};

export const AllIssues = ({
  vehicleIssues,
  setShowIssueDetails,
  selectedVehicle,
}: any) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >
      {/* You can map through vehicleIssues here similarly to NewIssues */}
      {/* {vehicleIssues && vehicleIssues.length > 0 ? ( */}
      <NewIssues
        selectedVehicle={selectedVehicle}
        issues={vehicleIssues}
        handleRemoveIssue={() => {}}
        setShowIssueDetails={setShowIssueDetails}
        isAllIssues={true}
      />
      {/* ) : selectedVehicle ? (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
          }}
        >
          <Info size={32} color={COLORS.textSecondary} />
          <Text style={{ color: COLORS.textSecondary, marginTop: 10 }}>
            No history found
          </Text>
        </View>
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
          }}
        >
          <Info size={32} color={COLORS.textSecondary} />
          <Text style={{ color: COLORS.textSecondary, marginTop: 10 }}>
            Please select a vehicle to see issues
          </Text>
        </View>
      )} */}
    </View>
  );
};
