import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';

const Footer = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2025 Fleetable Inc.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    height: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  text: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default Footer;
