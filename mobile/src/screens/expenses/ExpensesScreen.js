import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockExpenses, mockCategories, mockBudgets } from '../../data/mockData';

export default function ExpensesScreen({ navigation }) {
  const totalExpenses = mockExpenses
    .filter(e => e.direction === 'debit')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  
  const totalIncome = mockExpenses
    .filter(e => e.direction === 'credit')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, styles.income]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, styles.expense]}>
              ${totalExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.netRow}>
          <Text style={styles.netLabel}>Net</Text>
          <Text style={styles.netAmount}>
            ${(totalIncome - totalExpenses).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Budgets')}
        >
          <Text style={styles.actionButtonText}>Budgets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Accounts')}
        >
          <Text style={styles.actionButtonText}>Accounts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {mockExpenses.map(expense => {
          const category = mockCategories.find(c => c.id === expense.categoryId);
          return (
            <View key={expense.id} style={styles.expenseCard}>
              <View style={styles.expenseLeft}>
                <Text style={styles.expenseNote}>
                  {expense.note || 'No description'}
                </Text>
                <View style={styles.expenseMeta}>
                  {category && (
                    <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                      <Text style={styles.categoryText}>{category.name}</Text>
                    </View>
                  )}
                  <Text style={styles.expenseDate}>
                    {new Date(expense.occurredAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.expenseAmount,
                expense.direction === 'credit' ? styles.incomeAmount : styles.expenseAmount
              ]}>
                {expense.direction === 'credit' ? '+' : '-'}${expense.amount}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense')}
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
  summaryCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.paper,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
  },
  income: {
    color: colors.focusTeal,
  },
  expense: {
    color: colors.alertCoral,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.paper,
  },
  netLabel: {
    fontSize: typography.sizes.base,
    color: colors.slate,
  },
  netAmount: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.ink,
  },
  quickActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.signalAmber,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.md,
  },
  expenseCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: {
    flex: 1,
  },
  expenseNote: {
    fontSize: typography.sizes.base,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  expenseMeta: {
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
  expenseDate: {
    fontSize: typography.sizes.xs,
    color: colors.slate,
  },
  expenseAmount: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.alertCoral,
  },
  incomeAmount: {
    color: colors.focusTeal,
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
