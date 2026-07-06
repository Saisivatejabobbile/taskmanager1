import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export default function WeeklySummaryScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Summary</Text>
      <Text style={styles.subtitle}>Your productivity this week</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Completion Rate</Text>
        <Text style={styles.bigNumber}>85%</Text>
        <Text style={styles.cardDesc}>Tasks completed on time</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Most Productive Time</Text>
        <Text style={styles.bigNumber}>10 AM</Text>
        <Text style={styles.cardDesc}>Peak performance hour</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Spending Category</Text>
        <Text style={styles.bigNumber}>Food</Text>
        <Text style={styles.cardDesc}>$245 this week</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Focus Sessions</Text>
        <Text style={styles.bigNumber}>12</Text>
        <Text style={styles.cardDesc}>Total sessions completed</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: 'bold',
    color: colors.ink,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.slate,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: 8,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.sizes.base,
    color: colors.slate,
    marginBottom: spacing.md,
  },
  bigNumber: {
    fontSize: 48,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.signalAmber,
  },
  cardDesc: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginTop: spacing.sm,
  },
});
