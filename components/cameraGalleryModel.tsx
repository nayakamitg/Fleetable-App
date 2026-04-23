import { CameraIcon, ImageIcon, View, X } from "lucide-react-native";
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { COLORS, SIZES, SPACING } from "../constants/theme";
import { useCamera, useGallery } from "./Others/open";


const CameraGalleryModel = (props:any) => {
    const {showOptions,setShowOptions} = props;
const {openCamera,resetCamera}=useCamera();
const {openGallery,resetGallery}=useGallery();

const resetScanState = () => {
    resetCamera();
    resetGallery();
  };
    
    return (
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
        
    );
};

const styles = StyleSheet.create({
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
});

export default CameraGalleryModel;