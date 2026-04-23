import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import {
  Truck,
  Disc,
  Settings2,
  Clock,
  ClipboardCheck,
  Tag,
  LayoutDashboard,
} from 'lucide-react-native';
import theme from '../constants/theme';
import Header from '../components/Header';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../services/globalStorage/rudux/slices/DashboardSlice';
import { useLoginContext } from '../services/globalStorage/contextApi/loginContext';
import { TireLoader } from '../components/UI/loader';

const DashboardCard = React.memo(
  ({
    title,
    value,
    label,
    icon: Icon,
    fullWidth = false,
    customContent,
    color = theme.COLORS.primary,
    cardWidth,
    isTablet,
  }: any) => {
    const calculatedWidth = fullWidth ? '100%' : cardWidth;

    return (
      <Surface
        style={[
          styles.card,
          { width: calculatedWidth, borderLeftColor: color },
        ]}
        elevation={1}
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.iconContainer, { backgroundColor: color + '15' }]}
          >
            <Icon size={isTablet ? 24 : 20} color={color} />
          </View>
          <Text variant="titleSmall" style={styles.cardTitle}>
            {title}
          </Text>
        </View>

        <View style={styles.cardBody}>
          {customContent ? (
            customContent
          ) : (
            <View style={styles.valueContainer}>
              <Text
                variant={isTablet ? 'displayMedium' : 'displaySmall'}
                style={[styles.cardValue, { color: color }]}
              >
                {value}
              </Text>
              <Text variant="bodySmall" style={styles.cardLabel}>
                {label}
              </Text>
            </View>
          )}
        </View>
      </Surface>
    );
  },
);

const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();
  const { statistics, loading, error } = useSelector(
    (state: any) => state.dashboard,
  );
  const { user, loggedIn } = useLoginContext();

  useEffect(() => {
    if (user && user?.loginBranch && loggedIn) {
      dispatch<any>(fetchDashboardData({ branch: user?.loginBranch }));
    }
  }, [user, loggedIn]);

  // Responsive logic - memoized to avoid recalculating on every render
  const { isTablet, cardWidth } = useMemo(() => {
    const tablet = width >= 768;
    const numColumns = tablet ? 3 : 2;
    const spacing = theme.SPACING.md;
    const totalInternalPadding = theme.SPACING.xl * 2;
    const availableWidth = width - totalInternalPadding;
    const cWidth = (availableWidth - (numColumns - 1) * spacing) / numColumns;
    return { isTablet: tablet, cardWidth: cWidth };
  }, [width]);

  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        typeof error === 'string' ? error : 'An unknown error occurred',
      );
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Tyre Dashboard" />
      {loading && (
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: theme.COLORS.surface,
          }}
        >
          <TireLoader
            size={25}
            color={theme.COLORS.primary}
            text="Loading Dashboard..."
          />
        </View>
      )}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.breadcrumb}>
          <LayoutDashboard size={14} color={theme.COLORS.textSecondary} />
          <Text variant="bodySmall" style={styles.breadcrumbText}>
            Dashboard
          </Text>
        </View>

        <View style={styles.gridContainer}>
          <DashboardCard
            title="Total Vehicles"
            value={statistics?.totalVehicles || 0}
            label="Vehicles"
            icon={Truck}
            color="#5856D6"
            cardWidth={cardWidth}
            isTablet={isTablet}
          />
          <DashboardCard
            title="Tyres in Stock"
            value={statistics?.tyresInStock || 0}
            label="Tyres"
            icon={Disc}
            color="#007AFF"
            cardWidth={cardWidth}
            isTablet={isTablet}
          />

          <DashboardCard
            title="Tyre Fitments in Vehicles"
            fullWidth={!isTablet}
            icon={Settings2}
            color="#FF9500"
            cardWidth={cardWidth}
            isTablet={isTablet}
            customContent={
              <View style={styles.multiValueRow}>
                <View style={styles.multiValueItem}>
                  <Text
                    variant={isTablet ? 'headlineLarge' : 'headlineMedium'}
                    style={[styles.multiValueText, { color: '#FF9500' }]}
                  >
                    {statistics?.requiredTyres || 0}
                  </Text>
                  <Text variant="bodySmall" style={styles.cardLabel}>
                    Required
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.multiValueItem}>
                  <Text
                    variant={isTablet ? 'headlineLarge' : 'headlineMedium'}
                    style={[styles.multiValueText, { color: '#34C759' }]}
                  >
                    {statistics?.fittedTyres || 0}
                  </Text>
                  <Text variant="bodySmall" style={styles.cardLabel}>
                    Fitted
                  </Text>
                </View>
              </View>
            }
          />

          {/* <DashboardCard
            title="Pending Fitments"
            value={statistics?.pendingFitments}
            label="Tyres"
            icon={Clock}
            color="#FF3B30"
            cardWidth={cardWidth}
            isTablet={isTablet}
          /> */}
          <DashboardCard
            title="Inspections"
            value={statistics?.totalOpenInspections || 0}
            label="Open"
            icon={ClipboardCheck}
            color="#AF52DE"
            cardWidth={cardWidth}
            isTablet={isTablet}
          />

          {/* <DashboardCard
            title="Sale Tyres"
            value={statistics?.tyreSales}
            label="Tyres"
            icon={Tag}
            color="#FF2D55"
            cardWidth={cardWidth}
            isTablet={isTablet}
          /> */}

          <DashboardCard
            title="Available Slots"
            value={statistics?.availableSlots || 0}
            label="Tyres"
            icon={Tag}
            color="#FF2D55"
            cardWidth={cardWidth}
            isTablet={isTablet}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollContent: {
    padding: theme.SPACING.xl,
    paddingTop: theme.SPACING.md,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.SPACING.lg,
    backgroundColor: '#FFFFFF',
    padding: theme.SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },
  breadcrumbText: {
    marginLeft: 8,
    color: theme.COLORS.textSecondary,
  },
  breadcrumbActive: {
    fontWeight: '600',
    color: theme.COLORS.text,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: theme.SPACING.md,
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    marginBottom: theme.SPACING.md,
    minHeight: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: theme.COLORS.textSecondary,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    alignItems: 'center',
  },
  cardValue: {
    fontWeight: '700',
  },
  cardLabel: {
    color: theme.COLORS.textSecondary,
    marginTop: -4,
  },
  multiValueRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  multiValueItem: {
    alignItems: 'center',
    flex: 1,
  },
  multiValueText: {
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E1E4E8',
  },
});

export default DashboardScreen;
