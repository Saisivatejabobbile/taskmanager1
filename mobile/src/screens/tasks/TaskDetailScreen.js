import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockTasks, mockCategories } from '../../data/mockData';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  const task = mockTasks.find(t => t.id === taskId);
  const category = mockCategories.find(c => c.id === task?.categoryId);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddEditTask', { mode: 'edit', taskId })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {task.notes && (
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <Text style={styles.value}>{task.notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Due Date</Text>
        <Text style={styles.value}>
          {new Date(task.dueDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Priority</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
        </View>
      </View>

      {category && (
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
            <Text style={styles.categoryText}>{category.name}</Text>
          </View>
        </View>
      )}

      {task.recurrenceRule && (
        <View style={styles.section}>
          <Text style={styles.label}>Repeats</Text>
          <Text style={styles.value}>{task.recurrenceRule}</Text>
        </View>
      )}

      {task.subtasks && task.subtasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Subtasks</Text>
          {task.subtasks.map(subtask => (
            <View key={subtask.id} style={styles.subtaskItem}>
              <View style={[styles.subtaskCheckbox, subtask.done && styles.subtaskCheckboxDone]}>
                {subtask.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.subtaskText, subtask.done && styles.subtaskTextDone]}>
                {subtask.title}
              </Text>
            </View>
          ))}
        </View>
      )}

      {task.resourceLinks && task.resourceLinks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Resources</Text>
          {task.resourceLinks.map((link, index) => (
            <TouchableOpacity key={index} style={styles.linkItem}>
              <Text style={styles.linkText}>{link.label || link.url}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete Task</Text>
      </TouchableOpacity>
    </ScrollView>
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
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: 'bold',
    color: colors.ink,
    flex: 1,
  },
  editButton: {
    backgroundColor: colors.signalAmber,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  value: {
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
  priorityText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
  categoryText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  subtaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.slate,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskCheckboxDone: {
    backgroundColor: colors.focusTeal,
    borderColor: colors.focusTeal,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  subtaskText: {
    fontSize: typography.sizes.base,
    color: colors.ink,
    flex: 1,
  },
  subtaskTextDone: {
    textDecorationLine: 'line-through',
    color: colors.slate,
  },
  linkItem: {
    padding: spacing.md,
    backgroundColor: colors.paper,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  linkText: {
    fontSize: typography.sizes.sm,
    color: colors.focusTeal,
  },
  deleteButton: {
    backgroundColor: colors.alertCoral,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: '600',
  },
});
