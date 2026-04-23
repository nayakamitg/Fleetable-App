import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  ChevronDown,
  MoreVertical,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Camera,
  ImageIcon,
  CameraIcon,
  Check,
} from 'lucide-react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { Vehicle } from '../store/fleetStore';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../services/globalStorage/rudux/store';
import { TireLoader } from './UI/loader';
import {
  addVehicle,
  getVehicles,
  removeVehicle,
} from '../services/globalStorage/rudux/slices/vehiclesSlice';
import { useCamera, useGallery } from './Others/open';
import { analyzeNumberPlateWithClaude } from '../services/claudeAi';

interface VehicleDropdownProps {
  onSelect: (vehicle: Vehicle) => void;
  selectedVehicle?: Vehicle;
  ref?: React.RefObject<View>;
}

const VehicleDropdown = ({
  onSelect,
  selectedVehicle,
  ref,
}: VehicleDropdownProps) => {
  const {
    vehicles = [],
    loading: vehiclesLoading,
    error: vehiclesError,
  } = useSelector((state: RootState) => state.vehicles);

  const [modalVisible, setModalVisible] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const {
    openCamera,
    resetCamera,
    base64: cameraBase64,
    cameraLoading,
    cameraError,
  } = useCamera();
  const {
    openGallery,
    resetGallery,
    base64: galleryBase64,
    galleryLoading,
    galleryError,
  } = useGallery();
  const [loading, setLoading] = useState(false);
  const [selectedVehicleForAction, setSelectedVehicleForAction] =
    useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formErrors, setFormErrors] = useState({
    number: '',
    brand: '',
    tireCount: '',
  });
  const [newVehicle, setNewVehicle] = useState({
    number: '',
    brand: '',
    type: 'Truck',
    tireCount: '6',
  });

  const dispatch = useDispatch();

  // Analyze number plate when image is captured
  const analyzeNumberPlate = async (base64Image: string) => {
    setLoading(true);
    try {
      const result = await analyzeNumberPlateWithClaude(base64Image);
      if (result.numberPlate) {
        setSearchQuery(result.numberPlate);
      }
      if (result.error) {
        console.error('Number plate analysis error:', result.error);
      }
    } catch (error) {
      console.log('Error analyzing number plate:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(getVehicles());
  }, []);

  // Handle camera/gallery image capture
  useEffect(() => {
    if (cameraBase64) {
      analyzeNumberPlate(cameraBase64);
    }
  }, [cameraBase64]);

  useEffect(() => {
    if (galleryBase64) {
      analyzeNumberPlate(galleryBase64);
    }
  }, [galleryBase64]);

  const handleAddVehicle = () => {
    if (!newVehicle.number) {
      setFormErrors({ ...formErrors, number: 'Vehicle number is required' });
    }
    if (!newVehicle.brand) {
      setFormErrors({ ...formErrors, brand: 'Brand is required' });
    }
    if (!newVehicle.tireCount) {
      setFormErrors({ ...formErrors, tireCount: 'Tire count is required' });
    }
    if (
      parseInt(newVehicle.tireCount) < 2 ||
      parseInt(newVehicle.tireCount) > 50
    ) {
      setFormErrors({
        ...formErrors,
        tireCount: 'Please enter a valid tire count (2-50)',
      });
    }

    if (formErrors.brand || formErrors.number || formErrors.tireCount) {
      return;
    }

    const vehicle: Vehicle = {
      ...newVehicle,
      id: `vehicle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      vehicleNo: newVehicle.number,
      vehicleType: newVehicle.type,
      tyres: newVehicle.tireCount,
      tires: Array.from({ length: parseInt(newVehicle.tireCount) }, (_, i) => ({
        id: `tire-${Date.now()}-${i}`,
        position: `P${i + 1}`,
        pressure: '0 PSI',
        type: 'Standard',
        makeModel: 'Brand New',
      })),
    } as any; // Cast as any for compatibility during transition if needed, but we should aim for full interface support

    dispatch(addVehicle(vehicle));
    onSelect(vehicle);
    setShowAddForm(false);
    setModalVisible(false);
    setNewVehicle({ number: '', brand: '', type: 'Truck', tireCount: '6' });
    setSearchQuery('');
  };

  const filteredVehicles = vehicles.filter(
    vehicle =>
      vehicle.vehicleNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.tyres?.toString().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (item: Vehicle) => {
    setActionSheetVisible(false);
    setSelectedVehicleForAction(null);
    
    // Add your edit logic here
  };

  const handleDelete = (item: Vehicle) => {
    setActionSheetVisible(false);
    setSelectedVehicleForAction(null);
    
    dispatch(removeVehicle(item.id));
  };

  const openActionSheet = (vehicle: Vehicle) => {
    setSelectedVehicleForAction(vehicle);
    setActionSheetVisible(true);
  };

  const resetScanState = () => {
    resetCamera();
    resetGallery();
  };

  return (
    <View ref={ref} style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedVehicle
            ? `${selectedVehicle.vehicleNo}`
            : 'Select Vehicle'}
        </Text>
       {selectedVehicle && <X size={23} color={COLORS.error} style={{paddingVertical:SPACING.sm,paddingHorizontal:SPACING.md,borderRadius:10}} onPress={() => onSelect(undefined)} />}
        <ChevronDown size={23} color={COLORS.text} />
      </TouchableOpacity>

      {/* Main Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setShowAddForm(false);
          setSearchQuery('');
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(false);
            setShowAddForm(false);
            setSearchQuery('');
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {showAddForm ? 'Add Vehicle' : 'Select Vehicle'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (showAddForm) {
                        setFormErrors({
                          number: '',
                          brand: '',
                          tireCount: '',
                        });
                        setNewVehicle({
                          number: '',
                          brand: '',
                          type: 'Truck',
                          tireCount: '6',
                        });
                        setShowAddForm(false);
                      }
                      setShowAddForm(!showAddForm);
                      setSearchQuery('');
                    }}
                  >
                    {/* {showAddForm ? (
                      <Text style={styles.backButton}>Back</Text>
                    ) : (
                      <Plus size={24} color={COLORS.primary} />
                    )} */}
                  </TouchableOpacity>
                </View>

                {showAddForm ? (
                  <View style={styles.addForm}>
                    <TextInput
                      style={styles.input}
                      placeholder="Vehicle Number"
                      placeholderTextColor={COLORS.textSecondary}
                      value={newVehicle.number}
                      onChangeText={text => {
                        setNewVehicle({ ...newVehicle, number: text });
                        setFormErrors({ ...formErrors, number: '' });
                      }}
                    />
                    {formErrors.number && (
                      <Text style={styles.errorText}>{formErrors.number}</Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Brand"
                      placeholderTextColor={COLORS.textSecondary}
                      value={newVehicle.brand}
                      onChangeText={text => {
                        setNewVehicle({ ...newVehicle, brand: text });
                        setFormErrors({ ...formErrors, brand: '' });
                      }}
                    />
                    {formErrors.brand && (
                      <Text style={styles.errorText}>{formErrors.brand}</Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Tire Count"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="numeric"
                      maxLength={2}
                      value={newVehicle.tireCount}
                      onChangeText={text => {
                        setNewVehicle({ ...newVehicle, tireCount: text });
                        setFormErrors({ ...formErrors, tireCount: '' });
                      }}
                    />
                    {formErrors.tireCount && (
                      <Text style={styles.errorText}>
                        {formErrors.tireCount}
                      </Text>
                    )}
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={handleAddVehicle}
                    >
                      <Text style={styles.addButtonText}>Add Vehicle</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: SPACING.sm,
                      }}
                    >
                      <View style={styles.searchContainer}>
                        <Search size={20} color={COLORS.textSecondary} />
                        <TextInput
                          style={styles.searchInput}
                          placeholder="Search vehicles..."
                          placeholderTextColor={COLORS.textSecondary}
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                          <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                           
                          >
                            <X size={20} color={COLORS.error} />
                          </TouchableOpacity>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => setShowOptions(true)}
                        style={styles.scanContainer}
                      >
                        <CameraIcon size={20} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>

                    {vehiclesLoading || loading ? (
                      <View style={styles.loaderContainer}>
                        <TireLoader text="Loading vehicles..." />
                      </View>
                    ) : (
                      <FlatList
                        data={filteredVehicles}
                        ListEmptyComponent={
                          <Text style={styles.emptyText}>
                            No vehicles found
                          </Text>
                        }
                        keyExtractor={(item, index) =>
                          `vehicle-${item.id}-${index}`
                        }
                        renderItem={({ item, index }) => (
                          <View
                            style={styles.vehicleItem}
                            key={`item-wrapper-${item.id}-${index}`}
                          >
                            <TouchableOpacity
                              style={styles.vehicleItemLeft}
                              onPress={() => {
                                onSelect(item);
                                setModalVisible(false);
                                setSearchQuery('');
                                setShowAddForm(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <View>  

                              <Text style={styles.vehicleItemText}>
                                {item.vehicleNo}
                              </Text>
                              <Text style={styles.vehicleItemSub}>
                                {item.vehicleType} • {item.tyres} Tires
                              </Text>
                              </View>
                             {item.vehicleNo === selectedVehicle?.vehicleNo && <Check size={20} color={COLORS.primary} />}
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                              style={styles.vehicleItemRight}
                              onPress={() => openActionSheet(item)}
                              hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                              }}
                            >
                              <MoreVertical
                                size={20}
                                style={{ margin: SPACING.sm }}
                                color={COLORS.textSecondary}
                              />
                            </TouchableOpacity> */}
                          </View>
                        )}
                      />
                    )}
                  </>
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    setShowAddForm(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Action Sheet Modal */}
      <Modal
        visible={actionSheetVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setActionSheetVisible(false);
          setSelectedVehicleForAction(null);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setActionSheetVisible(false);
            setSelectedVehicleForAction(null);
          }}
        >
          <View style={styles.actionSheetOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.actionSheetContent}>
                <View style={styles.actionSheetHeader}>
                  <Text style={styles.actionSheetTitle}>
                    {selectedVehicleForAction?.vehicleNo}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setActionSheetVisible(false);
                      setSelectedVehicleForAction(null);
                    }}
                  >
                    <X size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.actionSheetItem}
                  onPress={() =>
                    selectedVehicleForAction &&
                    handleEdit(selectedVehicleForAction)
                  }
                >
                  <Edit2 size={20} color={COLORS.primary} />
                  <Text style={styles.actionSheetItemText}>Edit Vehicle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionSheetItem}
                  onPress={() =>
                    selectedVehicleForAction &&
                    handleDelete(selectedVehicleForAction)
                  }
                >
                  <Trash2 size={20} color={COLORS.error} />
                  <Text
                    style={[
                      styles.actionSheetItemText,
                      { color: COLORS.error },
                    ]}
                  >
                    Delete Vehicle
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/*Camera and Gallery Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowOptions(false);
            resetScanState();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.cameraModalContent}>
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
                    style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}
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
                    style={[styles.optionIcon, { backgroundColor: '#F3E5F5' }]}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButton: {
    fontSize: SIZES.md,
    color: COLORS.primary,
  },
  dropdownText: {
    fontSize: SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  errorText: {
    fontSize: SIZES.sm,
    color: COLORS.error,
    marginTop: -10,
    marginBottom: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    padding: SPACING.lg,
  },
  cameraModalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: '80%',
    minHeight: 500,
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
  loaderContainer: {
    flex: 1,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    flex: 1,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    width: '85%',
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.text,
    padding: 0,
  },
  vehicleItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleItemText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  vehicleItemSub: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  addForm: {
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
    backgroundColor: COLORS.surface,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: SIZES.md,
  },
  closeButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    padding: SPACING.md,
  },
  closeButtonText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: SIZES.md,
  },
  vehicleItemLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SPACING.md,
  },
  vehicleItemRight: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  // Action Sheet Styles
  actionSheetOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  actionSheetContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    width: '80%',
    maxWidth: 400,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionSheetTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  actionSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
  },
  actionSheetItemText: {
    fontSize: SIZES.md,
    marginLeft: SPACING.md,
    color: COLORS.text,
    fontWeight: '500',
  },
});

export default VehicleDropdown;
