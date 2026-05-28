import { SymbolView } from 'expo-symbols';
import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
 
  return (
        <ThemedView type="backgroundElement" style={{ borderRadius: 32, marginVertical: 10 }}>
            <Pressable
                style={({ pressed }) => [styles.heading, pressed && styles.pressedHeading]}
                onPress={() => setIsOpen((value) => !value)}
            >
                <ThemedView type="backgroundSelected" style={[styles.button, { transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }]}>
                    <SymbolView
                        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                        size={14}
                        weight="bold"
                        tintColor={theme.text}
                    />
                </ThemedView>

                <ThemedText type="small">{title}</ThemedText>
            </Pressable>
            {isOpen && (
                <Animated.View entering={FadeIn.duration(200)}>
                    <ThemedView type="backgroundElement" style={styles.content}>
                        {children}
                    </ThemedView>
                </Animated.View>
            )}
        </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: Spacing.four,
    height: Spacing.four,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgb(224, 225, 230)',
  },
  content: {
    marginTop: Spacing.one,
    borderRadius: Spacing.three,
    marginLeft: Spacing.four,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
});
