import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { format, differenceInDays } from 'date-fns';

export default function TodayStrip({ tasks, events }) {
  const upcomingItems = [
    ...tasks.slice(0, 2).map(t => ({ type: 'task', ...t })),
    ...events.slice(0, 2).map(e => ({ type: 'event', ...e })),
  ]
    .sort((a, b) => {
      const dateA = new Date(a.dueDate || a.eventDate);
      const dateB = new Date(b.dueDate || b.eventDate);
      return dateA - dateB;
    })
    .slice(0, 4);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {upcomingItems.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyText}>Nothing due today</Text>
          </View>
        ) : (
          upcomingItems.map((item, index) => {
            const date = new Date(item.dueDate || item.eventDate);
            const daysUntil = differenceInDays(date, new Date());
            const isToday = daysUntil === 0;

            return (
              <View key={index} style={styles.card}>
                <Text style={styles.cardType}>
                  {item.type === 'task' ? '✓' : '📅'}
                </Text>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardDate}>
                  {isToday ? 'Today' : `${daysUntil}d`}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.paper,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.ink,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.paper,
    padding: spacing.lg,
    borderRadius: 8,
    marginLeft: spacing.lg,
    minWidth: 120,
    gap: spacing.sm,
  },
  cardType: {
    fontSize: typography.sizes.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    color: colors.ink,
    fontWeight: '500',
  },
  cardDate: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.mono,
    color: colors.signalAmber,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
});
