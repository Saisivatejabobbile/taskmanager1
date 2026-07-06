import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockTasks, mockEvents } from '../../data/mockData';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export default function CalendarScreen({ navigation }) {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const allItems = [
    ...mockTasks.map(t => ({ ...t, type: 'task', date: new Date(t.dueDate) })),
    ...mockEvents.map(e => ({ ...e, type: 'event', date: new Date(e.eventDate) })),
  ].sort((a, b) => a.date - b.date);

  return (
    <View style={styles.container}>
      <View style={styles.weekView}>
        {weekDays.map((day, index) => {
          const isToday = isSameDay(day, today);
          return (
            <View key={index} style={[styles.dayCard, isToday && styles.dayCardToday]}>
              <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                {format(day, 'EEE')}
              </Text>
              <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                {format(day, 'd')}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.eventsButton}
          onPress={() => navigation.navigate('Events')}
        >
          <Text style={styles.eventsButtonText}>View All Events</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Timeline</Text>
        {allItems.map((item, index) => (
          <TouchableOpacity
            key={`${item.type}-${item.id}`}
            style={styles.timelineItem}
            onPress={() => {
              if (item.type === 'task') {
                navigation.navigate('TaskDetail', { taskId: item.id });
              }
            }}
          >
            <View style={styles.timelineLeft}>
              <Text style={styles.timelineDate}>{format(item.date, 'MMM d')}</Text>
              <Text style={styles.timelineType}>{item.type}</Text>
            </View>
            <View style={styles.timelineRight}>
              <Text style={styles.timelineTitle}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  weekView: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    gap: spacing.sm,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
  },
  dayCardToday: {
    backgroundColor: colors.signalAmber,
  },
  dayName: {
    fontSize: typography.sizes.xs,
    color: colors.slate,
    marginBottom: spacing.xs,
  },
  dayNameToday: {
    color: colors.white,
  },
  dayNumber: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.ink,
  },
  dayNumberToday: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  eventsButton: {
    backgroundColor: colors.signalAmber,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  eventsButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  timelineItem: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineDate: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.mono,
    color: colors.signalAmber,
    fontWeight: 'bold',
  },
  timelineType: {
    fontSize: typography.sizes.xs,
    color: colors.slate,
    marginTop: spacing.xs,
  },
  timelineRight: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: typography.sizes.base,
    color: colors.ink,
    fontWeight: '500',
  },
});
