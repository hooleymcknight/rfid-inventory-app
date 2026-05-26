import { Button, StyleSheet, Pressable, PressableStateCallbackType, Text } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import type { ContainerObj, ItemObj } from '@/constants/db-interface';
import { toRFID, capitalizeWords } from '@/constants/helpers';

type Props = {
    container: ContainerObj | undefined;
    items: ItemObj[];
    onBack: () => void;
};

export function BinDetail({ container, items, onBack }: Props) {
    return (
        <>
            <ThemedView style={styles.header}>
                { container && container != null ?
                    <>
                        <ThemedText type="subtitle">
                            {capitalizeWords(container.container)}
                        </ThemedText>
                        <ThemedText type="small">
                            { toRFID(container.location_id, container?.category_id, container?.storage_id) }
                        </ThemedText>
                    </>
                : <ThemedText type="subtitle">Bin</ThemedText>}
            </ThemedView>

            <ThemedView>
                {items.length === 0 ? (
                    <ThemedText themeColor="textSecondary">
                        There are no items in this container.
                    </ThemedText>
                ) : (
                    <ThemedView>
                        {items.map(item => (
                            <ThemedView key={item.item_id} style={styles.itemRow}>
                                <ThemedText>{item.item}</ThemedText>
                                {item.description ? (
                                    <ThemedText type="small" themeColor="textSecondary">
                                        {item.description}
                                    </ThemedText>
                                ) : null}
                            </ThemedView>
                        ))}
                    </ThemedView>
                )}

                <Pressable
                    style={({ hovered, pressed }: PressableStateCallbackType) => [
                        styles.btn,
                        hovered && styles.btnHovered,
                        pressed && styles.btnPressed,
                    ]}
                    onPress={onBack}
                >
                    <Text style={styles.btnText}>Go back</Text>
                </Pressable>
            </ThemedView>
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
    btnText: {
        fontSize: 18,
        marginBottom: 5,
        color: '#fff',
        maxHeight: 40,
        marginTop: 5
    },
    btn: {
        backgroundColor: '#2932b7',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 24,
        width: 'auto',
        maxHeight: 40,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    btnHovered: {
        backgroundColor: '#565cb3'
    },
    btnPressed: {
        backgroundColor: '#565cb3'
    },
});