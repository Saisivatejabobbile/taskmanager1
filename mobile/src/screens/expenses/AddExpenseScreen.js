import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockCategories, mockAccounts } from '../../data/mockData';

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState('debit');
  const [categoryId, setCategoryId] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [note, setNote] = useState('');

  const expenseCategories = mockCategories.filter(c => c.type === 'expense');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[styles.typeButton, direction === 'debit' && styles.typeButtonActiveDebit]}
            onPress={() => setDirection('debit')}
          >
            <Text style={[styles.typeButtonText, direction === 'debit' && styles.typeButtonTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, direction === 'credit' && styles.typeButtonActiveCredit]}
            onPress={() => setDirection('credit')}
          >
            <Text style={[styles.typeButtonText, direction === 'credit' && styles.typeButtonTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Amount *</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.slate}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {expenseCategories.map(cat => (
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
        <Text style={styles.label}>Account</Text>
        {mockAccounts.map(acc => (
          <TouchableOpacity
            key={acc.id}
            style={[styles.accountButton, accountId === acc.id && styles.accountButtonActive]}
            onPress={() => setAccountId(acc.id)}
          >
            <Text style={[styles.accountButtonText, accountId === acc.id && styles.accountButtonTextActive]}>
              {acc.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Add a note..."
          placeholderTextColor={colors.slate}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
  },
  typeButtonActiveDebit: {
    backgroundColor: colors.alertCoral,
    borderColor: colors.alertCoral,
  },
  typeButtonActiveCredit: {
    backgroundColor: colors.focusTeal,
    borderColor: colors.focusTeal,
  },
  typeButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.ink,
    fontWeight: '500',
  },
  typeButtonTextActive: {
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
  accountButton: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  accountButtonActive: {
    backgroundColor: colors.signalAmber,
  },
  accountButtonText: {
    fontSize: typography.sizes.base,
    color: colors.ink,
    fontWeight: '500',
  },
  accountButtonTextActive: {
    color: colors.white,
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
