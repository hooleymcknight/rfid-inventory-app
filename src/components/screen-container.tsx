import { Platform, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from './themed-view';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type Props = {
    children: React.ReactNode;
    style?: ViewStyle;
};

export function ScreenContainer({ children, style }: Props) {
    const safeAreaInsets = useSafeAreaInsets();
    const theme = useTheme();

    const insets = {
        ...safeAreaInsets,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };

    const platformPadding = Platform.select({
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

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentContainerStyle={[platformPadding, style]}
        >
            <ThemedView style={styles.container}>{children}</ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    container: {
        maxWidth: MaxContentWidth,
        width: '100%',
        alignSelf: 'center',  // centers the column on wide screens
        flexGrow: 1,
    },
});