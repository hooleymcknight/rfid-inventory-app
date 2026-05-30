import React, { useState, useEffect, useCallback } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/screen-container';
import { LocationAccordion } from '@/components/location-accordion';
import { BinDetail } from '@/components/bin-detail';
import { Spacing } from '@/constants/theme';
import { useInventory } from '@/store/inventory';
import { sortUnfixed } from '@/constants/helpers';

export default function BrowseScreen() {
    const { defaultBin } = useLocalSearchParams<{ defaultBin?: string }>();
    const defaultStorageBin = defaultBin ? Number(defaultBin) : null;

    const [selectedStorageId, setSelectedStorageId] = useState<number | null>(defaultStorageBin);
    const { data, isLoading, isError } = useInventory();

    useFocusEffect(
        useCallback(() => {
            // stuff here runs when screen gains focus — optional

            return () => setSelectedStorageId(defaultStorageBin);
        }, [defaultStorageBin])
    );

    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (selectedStorageId !== null) {
                setSelectedStorageId(null);
                return true;
            }
            return false;
        });
        return () => sub.remove();
    }, [selectedStorageId]);

    if (isLoading) return <ScreenContainer><ThemedText>Loading…</ThemedText></ScreenContainer>;
    if (isError || !data) return <ScreenContainer><ThemedText>Error. Please close and reopen the app.</ThemedText></ScreenContainer>;

    // Detail view — items inside the tapped bin.
    if (selectedStorageId !== null || defaultStorageBin !== null) {
        const container = data.containers.find((c) => c.storage_id === selectedStorageId);
        const items = data.items.filter((i) => i.storage_id === selectedStorageId);

        return (
            <ScreenContainer style={{ paddingHorizontal: 8 }}>
                <BinDetail
                    container={container}
                    items={items}
                    onBack={() => {setSelectedStorageId(null)}}
                />
            </ScreenContainer>
        );
    }

    const storageSelectHandler = (locationId: number, categoryId: number, storageId: number) => {
        // there was a reason to do this, I just can't remember it right now. it'll come around.
        setSelectedStorageId(storageId);
    }

    // List view — locations with accordion of bins.
    return (
        <ScreenContainer>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="subtitle">Browse</ThemedText>
                <ThemedText style={styles.centerText} themeColor="textSecondary">
                    Click a location below to explore containers and inventory there.
                </ThemedText>
            </ThemedView>

            <ThemedView style={{ paddingHorizontal: '2.5%' }}>
                {sortUnfixed(data?.locations).map((loc) => (
                    <LocationAccordion
                        key={loc.location_id}
                        loc={loc}
                        containers={data.containers.filter(
                            (c) => c.location_id === loc.location_id
                        )}
                        onStoragePress={storageSelectHandler}
                    />
                ))}
            </ThemedView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        gap: Spacing.three,
        alignItems: 'center',
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.six,
    },
    centerText: {
        textAlign: 'center',
    },
});
