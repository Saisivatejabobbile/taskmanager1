import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { mockFocusLinks } from '../../data/mockData';

export default function FocusSessionScreen({ route, navigation }) {
  const { linkId } = route.params;
  const link = mockFocusLinks.find(l => l.id === linkId);

  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    let interval;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.linkName}>{link?.label}</Text>

        <View style={styles.timerCard}>
          <Text style={styles.timerText}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setIsRunning(true)}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={() => setIsRunning(false)}
            >
              <Text style={styles.pauseButtonText}>Pause</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setTime(25 * 60);
              setIsRunning(false);
            }}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Session Notes</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="What did you accomplish?"
            placeholderTextColor={colors.slate}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  linkName: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xxl,
  },
  timerCard: {
    backgroundColor: colors.focusTeal,
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  timerText: {
    fontSize: 72,
    fontFamily: typography.fonts.mono,
    fontWeight: 'bold',
    color: colors.white,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  startButton: {
    backgroundColor: colors.focusTeal,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: 8,
  },
  startButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: colors.signalAmber,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: 8,
  },
  pauseButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.slate,
  },
  resetButtonText: {
    color: colors.slate,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  noteSection: {
    width: '100%',
  },
  noteLabel: {
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    fontSize: typography.sizes.base,
    color: colors.ink,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
