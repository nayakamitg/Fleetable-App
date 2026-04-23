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
} from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';

interface IssueData {
  issueId?: string;
  type?: string;
  subject?: string;
  description?: string; // Kept for compatibility if needed, but subject is primary
  base64Image?: string | null;
  note?: string;
  odoRead?: string;
  workshop?: string;
}

interface IssuePopupProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: IssueData) => void;
  data: any;
}

const IssuePopup = ({ visible, onClose, onSave, data }: IssuePopupProps) => {
  const [subject, setSubject] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible && data) {
      setSubject(data.subject || '');
      setNote(data.note || data.description || '');
    }
  }, [visible, data]);

  const handleSave = () => {
    onSave({
      ...data,
      subject,
      note,
    });
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Issue Details</Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.photoSection}>
                {data?.base64Image ? (
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${data.base64Image}`,
                    }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.emptyPhoto}>
                    <Text style={styles.emptyText}>No Image Available</Text>
                  </View>
                )}
              </View>

              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                editable={false}
                value={subject}
                onChangeText={text => {
                  setSubject(text);
                }}
                placeholder="Subject"
              />

              <Text style={styles.label}>Note</Text>
              <TextInput
                editable={false}
                style={[styles.input, { textAlignVertical: 'top' }]}
                value={note}
                onChangeText={text => {
                  setNote(text);
                }}
                multiline
                placeholder="Note"
              />

              {/* <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity> */}
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
  label: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
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
    marginBottom: SPACING.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: SPACING.md,
    resizeMode: 'cover',
  },
  emptyPhoto: {
    width: '100%',
    height: 150,
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
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: SIZES.md,
    fontWeight: 'bold',
  },
});

export default IssuePopup;
