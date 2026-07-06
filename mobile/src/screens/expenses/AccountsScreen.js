import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockAccounts } from '../../data/mockData';

export default function AccountsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Accounts</Text>

      {mockAccounts.map(account => (
        <View key={account.id} style={styles.accountCard}>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountType}>{account.type}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Account</Text>
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
  accountCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  accountName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  accountType: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    textTransform: 'capitalize',
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
