import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockEvents } from '../../data/mockData';
import { differenceInDays } from 'date-fns';

export default function EventsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {mockEvents.map(event => {
          const daysUntil = differenceInDays(new Date(event.eventDate), new Date());
          return (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                {event.repeatsYearly && (
                  <View style={styles.repeatBadge}>
                    <Text style={styles.repeatText}>Yearly</Text>
                  </View>
                )}
              </View>
              <Text style={styles.eventDate}>
                {new Date(event.eventDate).toLocaleDateString()}
              </Text>
              <View style={styles.countdownBadge}>
                <Text style={styles.countdownNumber}>{daysUntil}</Text>
                <Text style={styles.countdownLabel}>days</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditEvent', { mode: 'add' })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  eventCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  eventTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.ink,
    flex: 1,
  },
  repeatBadge: {
    backgroundColor: colors.focusTeal,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  repeatText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: '500',
  },
  eventDate: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginBottom: spacing.md,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  countdownNumber: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.signalAmber,
  },
  countdownLabel: {
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.signalAmber,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '300',
  },
});
