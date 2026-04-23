import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { Tire, Vehicle } from '../store/fleetStore';
import {
  getTyresPossition,
} from '../services/globalStorage/rudux/slices/tyreSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../services/globalStorage/rudux/store';
import { Divider } from 'react-native-paper';

interface TireLayoutProps {
  vehicle: Vehicle;
  onTirePress: (tire: Tire) => void;
  inspectedTireIds: string[];
}

interface NewInspection {
  tyreId: number;
  nsd: string;
  nsdAt: string;
  truckNo: string;
  tyrePosition: string;
  nsdDate: string;
  leftNsd: string;
  rightNsd: string;
  truckOdo: string;
  psi: string;
  valveCap: string;
  remark1: string;
  remark2: string;
  tyrePics: string;
  odometerId: string;
}

const TireLayout = ({
  vehicle,
  onTirePress,
  inspectedTireIds,
}: TireLayoutProps) => {
  const tireCount = parseInt(vehicle.tyres) || 0;
  const dispatch = useDispatch<AppDispatch>();
  const { tyresPossition } = useSelector((state: RootState) => state.tyres);

  useEffect(() => {
    dispatch(getTyresPossition(vehicle.vehicleNo));
  }, [vehicle.vehicleNo, dispatch]);

  const isDisabled = (name: string) => {
    return !tyresPossition.some(
      (item: any) => item.divisionId.replace('div', '') === name,
    );
  };

  const handleTirePress = (name: string) => {
    const tire = tyresPossition.find(
      (item: any) => item.divisionId.replace('div', '') === name,
    );
    if (tire) {
      onTirePress({ ...tire, id: tire.tyreId });
    }
  };

  const isInspected = (tyreId: string) => {
    return inspectedTireIds.includes(tyreId);
  };

  const renderTireItem = (positionCode: string) => {
    const tire = tyresPossition.find(
      (t: any) => t.divisionId === 'div' + positionCode,
    );
    const inspected = tire ? isInspected(tire.tyreId) : false;

    return (
      <TouchableOpacity
        key={positionCode}
        disabled={isDisabled(positionCode)}
        style={[
          styles.tire,
          { opacity: isDisabled(positionCode) ? 0 : 1 },
          inspected && styles.tireInspected,
        ]}
        onPress={() => handleTirePress(positionCode)}
      >
        <Text style={styles.tireText}>{tire?.positionCode}</Text>
      </TouchableOpacity>
    );
  };

  const renderTiresLeft = () => (
    <View style={styles.tiresColumnRight}>
      <View style={styles.tiresGridLeft}>
        {renderTireItem('L2')}
        {renderTireItem('L1')}
      </View>
      <View style={styles.tiresGridLeft}>
        {renderTireItem('L4')}
        {renderTireItem('L3')}
      </View>
      <View style={styles.tiresGridLeft}>
        {['L8', 'L7', 'L6', 'L5'].map(renderTireItem)}
      </View>
      <View style={styles.tiresGridLeft}>
        {['L12', 'L11', 'L10', 'L9'].map(renderTireItem)}
      </View>
      <View style={styles.tiresGridLeft}>
        {['L16', 'L15', 'L14', 'L13'].map(renderTireItem)}
      </View>
      <View style={styles.tiresGridLeft}>
        {['L20', 'L19', 'L18', 'L17'].map(renderTireItem)}
      </View>
    </View>
  );

  const renderTiresRight = () => (
    <View style={styles.tiresColumnLeft}>
      <View style={styles.tiresGridRight}>
        {renderTireItem('R1')}
        {renderTireItem('R2')}
      </View>
      <View style={styles.tiresGridRight}>
        {renderTireItem('R3')}
        {renderTireItem('R4')}
      </View>
      <View style={styles.tiresGridRight}>
        {['R5', 'R6', 'R7', 'R8'].map(renderTireItem)}
      </View>
      <View style={styles.tiresGridRight}>
        {['R9', 'R10', 'R11', 'R12'].map(renderTireItem)}
      </View>
      <View style={styles.tiresGridRight}>
        {['R13', 'R14', 'R15', 'R16'].map(renderTireItem)}
      </View>
      <View style={styles.tiresGridRight}>
        {['R17', 'R18', 'R19', 'R20'].map(renderTireItem)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visual Tire Layout ({tireCount} tires)</Text>
      <View style={styles.layoutContainer}>
        <View style={styles.vehicleBody2}>
        <Text style={styles.sectionTitle}>Front</Text>
          <View style={styles.vehicleBody}>
            <View style={styles.tiresGridLeftContainer}>
              {renderTiresLeft()}
            </View>
            <View style={styles.tiresGridCenter}></View>
            <View style={styles.tiresGridRightContainer}>
              {renderTiresRight()}
            </View>
          </View>
          <Text style={styles.sectionTitle}>Back</Text>
          <View style={styles.stefny}>
            {[1, 2, 3].map(item => renderTireItem('S' + item))}
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendBox, { backgroundColor: COLORS.border }]}
          />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendBox, { backgroundColor: COLORS.success }]}
          />
          <Text style={styles.legendText}>Inspected</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  layoutContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  vehicleBody: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleBody2: {
    width: '100%',
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
    padding: SPACING.sm,
    minHeight: 200,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiresGridLeftContainer: {
    width: '45%',
    alignItems: 'flex-end',
  },
  tiresGridRightContainer: {
    width: '45%',
    alignItems: 'flex-start',
  },
  tiresColumnLeft: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'flex-start',
  },
  tiresColumnRight: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'flex-end',
  },
  tiresGridLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 3,
    width: '100%',
  },
  tiresGridRight: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 3,
    width: '100%',
  },
  tiresGridCenter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 5,
    borderRadius: 12,
    paddingVertical: 10,
    height: '100%',
    marginHorizontal: 3,
  },
  stefny: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  tire: {
    minWidth: 40,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tireInspected: {
    backgroundColor: COLORS.success,
    borderColor: '#248a3d',
  },
  tireText: {
    color: '#fff',
    fontSize: SIZES.sm,
    fontWeight: 'bold',
  },
  tireTextInspected: {
    color: '#fff',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default TireLayout;
