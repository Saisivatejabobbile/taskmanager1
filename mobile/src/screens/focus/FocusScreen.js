import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockFocusLinks, mockFocusSessions } from '../../data/mockData';

export default function FocusScreen({ navigation }) {
  const currentStreak = 7;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.streakCard}>
        <Text style={styles.streakNumber}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>

      <Text style={styles.sectionTitle}>Focus Links</Text>
      {mockFocusLinks.map(link => (
        <TouchableOpacity
          key={link.id}
          style={styles.linkCard}
          onPress={() => navigation.navigate('FocusSession', { linkId: link.id })}
        >
          <Text style={styles.linkLabel}>{link.label}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Focus Link</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Sessions</Text>
      {mockFocusSessions.map(session => {
        const duration = Math.floor(
          (new Date(session.endedAt) - new Date(session.startedAt)) / (1000 * 60)
        );
        const link = mockFocusLinks.find(l => l.id === session.focusLinkId);
        return (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionLink}>{link?.label}</Text>
              <Text style={styles.sessionDuration}>{duration}m</Text>
            </View>
            {session.note && (
              <Text style={styles.sessionNote}>{session.note}</Text>
            )}
            <Text style={styles.sessionDate}>
              {new Date(session.startedAt).toLocaleString()}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: spacing.lg,
  },
  streakCard: {
    backgroundColor: colors.focusTeal,
    padding: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  streakNumber: {
    fontSize: 64,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.white,
  },
  streakLabel: {
    fontSize: typography.sizes.lg,
    color: colors.white,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  linkCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  linkLabel: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  linkUrl: {
    fontSize: typography.sizes.sm,
    color: colors.focusTeal,
  },
  addButton: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.focusTeal,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: colors.focusTeal,
    fontSize: typography.sizes.base,
    fontWeight: '500',
  },
  sessionCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sessionLink: {
    fontSize: typography.sizes.base,
    fontWeight: '500',
    color: colors.ink,
  },
  sessionDuration: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.focusTeal,
  },
  sessionNote: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginBottom: spacing.sm,
  },
  sessionDate: {
    fontSize: typography.sizes.xs,
    color: colors.slate,
  },
});
