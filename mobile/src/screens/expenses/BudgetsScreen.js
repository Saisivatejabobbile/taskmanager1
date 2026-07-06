import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockBudgets, mockCategories, mockExpenses } from '../../data/mockData';

export default function BudgetsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Budgets</Text>

      {mockBudgets.map(budget => {
        const category = mockCategories.find(c => c.id === budget.categoryId);
        const spent = mockExpenses
          .filter(e => e.categoryId === budget.categoryId && e.direction === 'debit')
          .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const percentage = (spent / budget.monthlyLimit) * 100;
        const isOverBudget = spent > budget.monthlyLimit;

        return (
          <View key={budget.id} style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetCategory}>{category?.name}</Text>
              <Text style={[styles.budgetStatus, isOverBudget && styles.budgetStatusOver]}>
                {isOverBudget ? 'Over Budget' : 'On Track'}
              </Text>
            </View>
            <View style={styles.budgetAmounts}>
              <Text style={styles.budgetSpent}>
                ${spent.toFixed(2)}
              </Text>
              <Text style={styles.budgetLimit}>
                of ${budget.monthlyLimit}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(percentage, 100)}%` },
                  isOverBudget && styles.progressFillOver,
                ]}
              />
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Budget</Text>
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
  budgetCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  budgetCategory: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.ink,
  },
  budgetStatus: {
    fontSize: typography.sizes.xs,
    color: colors.focusTeal,
    fontWeight: '500',
  },
  budgetStatusOver: {
    color: colors.alertCoral,
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  budgetSpent: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.ink,
  },
  budgetLimit: {
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.paper,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.focusTeal,
  },
  progressFillOver: {
    backgroundColor: colors.alertCoral,
  },
  addButton: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.signalAmber,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: colors.signalAmber,
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
});
