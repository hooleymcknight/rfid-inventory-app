import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import React, { useEffect } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInputSubmitEditingEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
// import { ScanInput } from '@/components/scan-input';
import { TextInput } from 'react-native';

const receiveCode = (e: KeyboardEvent) => {
    const input = document.querySelector('input')
    if (e.key && input !== document.activeElement) {
        input?.focus();
    }
}

export default function TabTwoScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const insets = {
        ...safeAreaInsets,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };
    const theme = useTheme();

    const contentPlatformStyle = Platform.select({
        android: {
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
        },
        web: {
            paddingTop: Spacing.six,
            paddingBottom: Spacing.four,
        },
    });

    useEffect(() => {
        window.addEventListener('keydown', receiveCode);
        return () => window.removeEventListener('keydown', receiveCode);
    }, []);

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        >
            <ThemedView style={styles.container}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="subtitle">Scan</ThemedText>
                    <ThemedText style={styles.centerText} themeColor="textSecondary">
                        Use the scanner to input a code.
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.sectionsWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Input code here"
                        submitBehavior="submit"
                        onSubmitEditing={(e: TextInputSubmitEditingEvent) => {
                            // console.log(e)
                        }}
                    />
                </ThemedView>
                {Platform.OS === 'web' && <WebBadge />}
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    container: {
        maxWidth: MaxContentWidth,
        flexGrow: 1,
    },
    titleContainer: {
        gap: Spacing.three,
        alignItems: 'center',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.six,
    },
    centerText: {
        textAlign: 'center',
    },
    pressed: {
        opacity: 0.7,
    },
    linkButton: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.two,
        borderRadius: Spacing.five,
        justifyContent: 'center',
        gap: Spacing.one,
        alignItems: 'center',
    },
    sectionsWrapper: {
        gap: Spacing.five,
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.three,
    },
    collapsibleContent: {
        alignItems: 'center',
    },
    imageTutorial: {
        width: '100%',
        aspectRatio: 296 / 171,
        borderRadius: Spacing.three,
        marginTop: Spacing.two,
    },
    imageReact: {
        width: 100,
        height: 100,
        alignSelf: 'center',
    },
    input: {
        backgroundColor: '#fafafa',
        padding: 8,
        borderRadius: '4px',
        width: 'auto',
        marginHorizontal: 'auto',
        marginTop: 0,
        marginBottom: 24,
        minWidth: 300,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        color: 'rgba(0, 0, 0, 0.6)',
    },
});
