import { Button, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import type { ContainerObj, ItemObj } from '@/constants/db-interface';

type Props = {
    container: ContainerObj | undefined;
    items: ItemObj[];
    onBack: () => void;
};

export function BinDetail({ container, items, onBack }: Props) {
    return (
        <>
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle">
                    {container?.container ?? 'Bin'}
                </ThemedText>
            </ThemedView>

            <ThemedView>
                {items.length === 0 ? (
                    <ThemedText themeColor="textSecondary">
                        There are no items in this container.
                    </ThemedText>
                ) : (
                    items.map(item => (
                        <ThemedView key={item.item_id} style={styles.itemRow}>
                            <ThemedText>{item.item}</ThemedText>
                            {item.description ? (
                                <ThemedText type="small" themeColor="textSecondary">
                                    {item.description}
                                </ThemedText>
                            ) : null}
                        </ThemedView>
                    ))
                )}
            </ThemedView>

            <Button onPress={onBack} title="Go back" />
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: Spacing.four,
        alignItems: 'center',
    },
    itemRow: {
        paddingVertical: Spacing.two,
    },
});
