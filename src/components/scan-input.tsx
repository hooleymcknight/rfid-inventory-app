import React, { type ReactNode } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

type ScanInputProps = {
  title?: string;
  hint?: ReactNode;
};

export function ScanInput({ title = 'Try editing', hint = 'app/index.tsx' }: ScanInputProps) {
  return (
    <View style={styles.stepRow}>
        <TextInput style={styles.input} placeholder="Input code here"></TextInput>
        <ThemedText type="small">{title}</ThemedText>
        <ThemedView type="backgroundSelected" style={styles.codeSnippet}>
            <ThemedText themeColor="textSecondary">{hint}</ThemedText>
        </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
    stepRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    codeSnippet: {
        borderRadius: Spacing.two,
        paddingVertical: Spacing.half,
        paddingHorizontal: Spacing.two,
    },
    input: {
        backgroundColor: '#fafafa',
    },
});
