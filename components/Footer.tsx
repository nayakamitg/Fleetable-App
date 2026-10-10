import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../constants/theme';

const Footer = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
      <Text style={styles.text}>© 2025 Fleetable Inc.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
  },
  text: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default Footer;
