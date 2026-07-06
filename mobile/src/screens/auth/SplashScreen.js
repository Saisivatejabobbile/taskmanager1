import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DayFlow</Text>
      <Text style={styles.tagline}>Your day, your flow</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.sizes.lg,
    color: colors.slate,
    marginBottom: spacing.xxl * 2,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.signalAmber,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.signalAmber,
  },
  secondaryButtonText: {
    color: colors.signalAmber,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
});
