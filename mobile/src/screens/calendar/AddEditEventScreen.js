import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export default function AddEditEventScreen({ route, navigation }) {
  const { mode } = route.params;
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [alertDaysBefore, setAlertDaysBefore] = useState('1');
  const [repeatsYearly, setRepeatsYearly] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{mode === 'add' ? 'Add Event' : 'Edit Event'}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Event title"
          placeholderTextColor={colors.slate}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Event Date *</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.slate}
          value={eventDate}
          onChangeText={setEventDate}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Alert Days Before</Text>
        <TextInput
          style={styles.input}
          placeholder="Number of days"
          placeholderTextColor={colors.slate}
          value={alertDaysBefore}
          onChangeText={setAlertDaysBefore}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Repeats Yearly</Text>
          <Switch
            value={repeatsYearly}
            onValueChange={setRepeatsYearly}
            trackColor={{ true: colors.signalAmber, false: colors.slate }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Event</Text>
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: colors.signalAmber,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
});
