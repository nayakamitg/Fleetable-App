import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';

const Home = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Welcome to Fleetable</Text>
        <Text style={styles.subheading}>Your fleet management solution</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.body}>
          Manage your vehicles, drivers, and deliveries all in one place.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  content: {
    padding: SPACING.md,
  },
  body: {
    fontSize: SIZES.md,
    lineHeight: SIZES.xl,
    color: COLORS.text,
  },
});

export default Home;
