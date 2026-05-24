import React, { useState, useEffect } from 'react';
import { BackHandler, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/screen-container';
import { LocationAccordion } from '@/components/location-accordion';
import { BinDetail } from '@/components/bin-detail';
import { Spacing } from '@/constants/theme';
import { useInventory } from '@/store/inventory';
import type { LocationObj, ContainerObj } from '@/constants/db-interface';

// drop this somewhere temporary, like at the top of BrowseScreen
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect } from 'react';



export default function BrowseScreen() {
    const [openLocationId, setOpenLocationId] = useState<number | null>(null);
    const [selectedStorageId, setSelectedStorageId] = useState<number | null>(null);
    const { data, isLoading, isError } = useInventory();

    // Android back button: pop out of detail view first, then exit screen.
    // useEffect(() => {
    //     const sub = BackHandler.addEventListener('hardwareBackPress', () => {
    //         if (selectedStorageId !== null) {
    //             setSelectedStorageId(null);
    //             return true;
    //         }
    //         return false;
    //     });
    //     return () => sub.remove();
    // }, [selectedStorageId]);

    useEffect(() => {
        AsyncStorage.clear().then(() => console.log('cache cleared'));
    }, []);

    if (isLoading) return <ThemedText>Loading…</ThemedText>;
    if (isError || !data) return <ThemedText>Error. Please close and reopen the app.</ThemedText>;

    // Detail view — items inside the tapped bin.
    if (selectedStorageId !== null) {
        const container = data.containers.find((c: any) => c.storage_id === selectedStorageId);
        console.log(data.items)
        const items = data.items.filter((i: any) => i.storage_id === selectedStorageId);
        console.log('container:', container);
        console.log('items', items);
        return (
            <ScreenContainer>
                <BinDetail
                    container={container}
                    items={items}
                    onBack={() => setSelectedStorageId(null)}
                />
            </ScreenContainer>
        );
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

            <ThemedView>
                {data.locations.map((loc: LocationObj) => (
                    <LocationAccordion
                        key={loc.location_id}
                        loc={loc}
                        containers={data.containers.filter(
                            (c: ContainerObj) => c.location_id === loc.location_id
                        )}
                        onStoragePress={setSelectedStorageId}
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
