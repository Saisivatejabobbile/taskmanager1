import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockCategories, mockTasks } from '../../data/mockData';

export default function AddEditTaskScreen({ route, navigation }) {
  const { mode, taskId } = route.params;
  const existingTask = mode === 'edit' ? mockTasks.find(t => t.id === taskId) : null;

  const [title, setTitle] = useState(existingTask?.title || '');
  const [notes, setNotes] = useState(existingTask?.notes || '');
  const [dueDate, setDueDate] = useState(existingTask?.dueDate || '');
  const [priority, setPriority] = useState(existingTask?.priority || 'medium');
  const [categoryId, setCategoryId] = useState(existingTask?.categoryId || null);

  const taskCategories = mockCategories.filter(c => c.type === 'task');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{mode === 'add' ? 'Add Task' : 'Edit Task'}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Task title"
          placeholderTextColor={colors.slate}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add notes..."
          placeholderTextColor={colors.slate}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityButtons}>
          <TouchableOpacity
            style={[styles.priorityButton, priority === 'low' && styles.priorityButtonActiveLow]}
            onPress={() => setPriority('low')}
          >
            <Text style={[styles.priorityButtonText, priority === 'low' && styles.priorityButtonTextActive]}>
              Low
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.priorityButton, priority === 'medium' && styles.priorityButtonActiveMedium]}
            onPress={() => setPriority('medium')}
          >
            <Text style={[styles.priorityButtonText, priority === 'medium' && styles.priorityButtonTextActive]}>
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.priorityButton, priority === 'high' && styles.priorityButtonActiveHigh]}
            onPress={() => setPriority('high')}
          >
            <Text style={[styles.priorityButtonText, priority === 'high' && styles.priorityButtonTextActive]}>
              High
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {taskCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                { borderColor: cat.color },
                categoryId === cat.id && { backgroundColor: cat.color },
              ]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={[
                styles.categoryButtonText,
                categoryId === cat.id && styles.categoryButtonTextActive,
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Due Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.slate}
          value={dueDate}
          onChangeText={setDueDate}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Recurrence</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., FREQ=WEEKLY;BYDAY=MO"
          placeholderTextColor={colors.slate}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Subtasks</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Subtask</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Resource Links</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Link</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Task</Text>
      </TouchableOpacity>
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
    fontSize: typography.sizes.xxl,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    fontSize: typography.sizes.base,
    color: colors.ink,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  priorityButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
  },
  priorityButtonActiveLow: {
    backgroundColor: colors.focusTeal,
    borderColor: colors.focusTeal,
  },
  priorityButtonActiveMedium: {
    backgroundColor: colors.signalAmber,
    borderColor: colors.signalAmber,
  },
  priorityButtonActiveHigh: {
    backgroundColor: colors.alertCoral,
    borderColor: colors.alertCoral,
  },
  priorityButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.ink,
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: colors.white,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
  },
  categoryButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.ink,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.white,
  },
  addButton: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.signalAmber,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: colors.signalAmber,
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.signalAmber,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
});
