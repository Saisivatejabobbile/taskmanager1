import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockTasks, mockCategories } from '../../data/mockData';

export default function TasksScreen({ navigation }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = mockTasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor={colors.slate}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>Add your first task to get started</Text>
          </View>
        ) : (
          filteredTasks.map(task => {
            const category = mockCategories.find(c => c.id === task.categoryId);
            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              >
                <View style={styles.taskLeft}>
                  <TouchableOpacity style={styles.checkbox} />
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.notes && (
                      <Text style={styles.taskNotes} numberOfLines={1}>{task.notes}</Text>
                    )}
                    <View style={styles.taskMeta}>
                      {category && (
                        <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                          <Text style={styles.categoryText}>{category.name}</Text>
                        </View>
                      )}
                      <Text style={styles.taskDate}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditTask', { mode: 'add' })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.paper,
  },
  searchInput: {
    backgroundColor: colors.paper,
    padding: spacing.md,
    borderRadius: 8,
    fontSize: typography.sizes.base,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.paper,
  },
  filterButtonActive: {
    backgroundColor: colors.signalAmber,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    color: colors.ink,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  taskCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.slate,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.sizes.base,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  taskNotes: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginBottom: spacing.sm,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: '500',
  },
  taskDate: {
    fontSize: typography.sizes.xs,
    color: colors.slate,
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
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
