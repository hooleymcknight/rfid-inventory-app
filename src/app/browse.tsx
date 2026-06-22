import React, { useState, useEffect, useCallback } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/screen-container';
import { LocationAccordion } from '@/components/location-accordion';
import { BinDetail } from '@/components/bin-detail';
import { Spacing } from '@/constants/theme';
import { useInventory, useUpdateInventory, useDeleteInventory } from '@/store/inventory';
import { sortUnfixed } from '@/constants/helpers';

export default function BrowseScreen() {
    const router = useRouter();

    const { defaultBin } = useLocalSearchParams<{ defaultBin?: string }>();
    const defaultStorageBin = defaultBin ? Number(defaultBin) : null;

    // selectedStorageId is the single source of truth for which view we're in.
    // Seeds from the URL param on mount so a cold-start deep link paints the bin
    // immediately instead of flashing the list for a frame.
    const [selectedStorageId, setSelectedStorageId] = useState<number | null>(defaultStorageBin);

    const updateInventory = useUpdateInventory();
    const deleteInventory = useDeleteInventory();
    const { data, isLoading, isError } = useInventory();

    const backFromBinDetail = () => {
        setSelectedStorageId(null); // closes the detail view synchronously
    };

    useFocusEffect(
        useCallback(() => {
            // Runs on every focus, including "go to container" from /add — even when
            // the browse tab is already mounted and the bin value repeats.
            //
            // Consume the param by setting it to '' (NOT undefined): setting a param
            // to undefined is buggy in expo-router (it can come back as the string
            // "undefined"). '' is a real change (so it registers) and is falsy (so
            // defaultStorageBin reads as null), which means a later focus won't
            // reopen the bin — only a fresh "go to container" will.
            if (defaultStorageBin !== null) {
                setSelectedStorageId(defaultStorageBin);
                router.setParams({ defaultBin: '' });
            }
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

    let container;
    let items;
    const storageLocationsArr = [];
    // Detail view — items inside the tapped bin.
    if (selectedStorageId !== null) {
        container = data.containers.find((c) => c.storage_id === selectedStorageId);
        items = data.items.filter((i) => i.storage_id === selectedStorageId);

        for (const loc of data.locations) {
            const theseContainers = data.containers.filter(c => c.location_id === loc.location_id);
            storageLocationsArr.push({
                location_id: loc.location_id,
                location_name: loc.location_name,
                containers: theseContainers, // containerObj[]
            });
        }
    }

    const storageSelectHandler = (locationId: number, categoryId: number, storageId: number) => {
        // there was a reason to do this, I just can't remember it right now. it'll come around.
        setSelectedStorageId(storageId);
    };

    // List view stays mounted underneath so scroll position + open accordions
    // survive a dead-end bin tap. The detail overlay is stacked on top when active.
    return (
        <>
            {items && container ? (
                <View
                    style={{
                        position: 'absolute', // 'fixed' is web-only; 'absolute' + inset 0 covers the screen on Android too
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 20,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#fff',
                        paddingTop: 64,
                    }}
                >
                    <BinDetail
                        container={container}
                        items={items}
                        storageLocations={storageLocationsArr}
                        onBack={backFromBinDetail}
                        updateInventory={updateInventory}
                        deleteItem={deleteInventory}
                    />
                </View>
            ) : null}

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
        </>
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