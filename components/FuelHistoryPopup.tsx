import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { History, X, Calendar, Fuel, TrendingUp } from 'lucide-react-native';
import { styles } from '../screens/FuelEntryScreen';
import { COLORS } from '../constants/theme';

// Memoized Components
const HistoryModalHeader = memo(({ onClose }: any) => (
  <View style={styles.historyModalHeader}>
    <View style={styles.historyHeaderTitleRow}>
      <History color={COLORS.primary} size={24} />
      <Text style={styles.historyModalTitle}>Fuel History</Text>
    </View>
    <TouchableOpacity
      onPress={onClose}
      style={styles.closeButton}
      accessibilityLabel="Close history"
      accessibilityRole="button"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <X color={COLORS.textSecondary} size={24} />
    </TouchableOpacity>
  </View>
));

const DetailItem = memo(({ label, value, icon }: any) => (
  <View style={styles.historyDetailItem}>
    <Text style={styles.historyDetailLabel}>{label}</Text>
    <View style={styles.historyValueRow}>
      {icon}
      <Text style={styles.historyValue}>{value}</Text>
    </View>
  </View>
));

const HistoryItem = memo(({ item, index }: any) => {
  const formatDate = (dateString: string) => {
    return dateString?.split('T')[0] || '';
  };

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyItemHeader}>
        <View style={styles.historyDateRow}>
          <Calendar color={COLORS.textSecondary} size={14} />
          <Text style={styles.historyDate}>
            {item?.dateFormatted || formatDate(item?.date)}
          </Text>
        </View>
        <View style={styles.historyBadge}>
          <Text style={styles.historyBadgeText}>
            {item?.fuelType || 'Diesel'}
          </Text>
        </View>
      </View>

      <View style={styles.historyDetailsContainer}>
        <DetailItem
          label="Fuel"
          value={`${item?.fuel || 0} Ltrs`}
          icon={<Fuel color={COLORS.primary} size={16} />}
        />
        <DetailItem
          label="Amount"
          value={`₹${item?.amount || 0}`}
          icon={<TrendingUp color="#4CAF50" size={16} />}
        />
      </View>
    </View>
  );
});

const EmptyState = memo(({ message }: any) => (
  <View style={styles.historyEmptyContainer}>
    <Fuel color={COLORS.border} size={48} />
    <Text style={styles.historyEmptyText}>{message}</Text>
  </View>
));

const LoadingState = memo(() => (
  <View style={styles.historyEmptyContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
));

// Main Component
const FuelHistoryModal = ({
  showHistory,
  setShowHistory,
  selectedVehicle,
  historyData,
  historyLoading,
}: any) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Handle modal animation completion
  useEffect(() => {
    if (showHistory) {
      setIsAnimating(true);
      // Wait for modal animation to complete
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 350); // Match with modal animation duration
      return () => clearTimeout(timer);
    }
  }, [showHistory]);

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false);
  }, [setShowHistory]);

  const renderHistoryItem = useCallback(
    ({ item, index }: any) => <HistoryItem item={item} index={index} />,
    []
  );

  const keyExtractor = useCallback(
    (item: any, index: any) => item?.fuelId?.toString() || `history-${index}`,
    []
  );

  // Pre-calculate item layout for smooth scrolling
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: 120, // Approximate height of each item (adjust based on your actual item height)
      offset: 120 * index,
      index,
    }),
    []
  );

  const renderContent = () => {
    if (historyLoading) {
      return <LoadingState />;
    }

    if (!historyData || historyData.length === 0) {
      return <EmptyState message="No fuel history found for this vehicle" />;
    }

    return (
      <FlatList
        ref={flatListRef}
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.historyListContent}
        style={styles.historyList}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={7}
        initialNumToRender={8}
        updateCellsBatchingPeriod={50}
        // CRITICAL: Smooth scrolling optimizations
        scrollEventThrottle={16}
        decelerationRate="normal"
        // Disable scrolling during modal animation
        scrollEnabled={!isAnimating}
      />
    );
  };

  return (
    <Modal
      visible={showHistory}
      transparent
      animationType="fade"
      onRequestClose={handleCloseHistory}
      statusBarTranslucent
      hardwareAccelerated={true} // Enable hardware acceleration
    >
      <TouchableWithoutFeedback onPress={handleCloseHistory}>
        <View style={styles.historyModalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.historyModalContainer}>
              <HistoryModalHeader onClose={handleCloseHistory} />

              <Text style={styles.historyVehicleNo}>
                Vehicle: {selectedVehicle?.vehicleNo || 'N/A'}
              </Text>

              {renderContent()}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FuelHistoryModal;