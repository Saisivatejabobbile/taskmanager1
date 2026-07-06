import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockTasks, mockEvents } from '../../data/mockData';
import TodayStrip from '../../components/TodayStrip';

export default function HomeScreen({ navigation }) {
  const todayTasks = mockTasks.filter(t => t.status === 'pending').slice(0, 5);

  return (
    <View style={styles.container}>
      <TodayStrip tasks={todayTasks} events={mockEvents} />
      <ScrollView style={styles.content}>
        <Text style={styles.greeting}>Good morning</Text>
        <Text style={styles.subtitle}>Here's what's happening today</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Tasks Due</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Days to Event</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>$450</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          {todayTasks.map(task => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            >
              <View style={styles.taskLeft}>
                <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                <View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDue}>{new Date(task.dueDate).toLocaleDateString()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.summaryButton}
          onPress={() => navigation.navigate('WeeklySummary')}
        >
          <Text style={styles.summaryButtonText}>View Weekly Summary</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return colors.alertCoral;
    case 'medium': return colors.signalAmber;
    case 'low': return colors.focusTeal;
    default: return colors.slate;
  }
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
  greeting: {
    fontSize: typography.sizes.xxxl,
    fontWeight: 'bold',
    color: colors.ink,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.slate,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.signalAmber,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginTop: spacing.xs,
  },
  taskCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskTitle: {
    fontSize: typography.sizes.base,
    color: colors.ink,
    fontWeight: '500',
  },
  taskDue: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginTop: spacing.xs,
  },
  summaryButton: {
    backgroundColor: colors.signalAmber,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  summaryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: '600',
  },
});
