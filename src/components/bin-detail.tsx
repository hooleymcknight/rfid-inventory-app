import { StyleSheet, Pressable, PressableStateCallbackType, Text, Image } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import type { ContainerObj, ItemObj, slSchema } from '@/constants/db-interface';
import { toRFID, capitalizeWords, padInput } from '@/constants/helpers';
import { useState, useEffect } from 'react';
import { ItemValueRow } from './item-value-row';
import { StorageLocationSelect } from './storage-location-select';
import BasicButton from './basic-button';

type Props = {
    container: ContainerObj | undefined;
    items: ItemObj[];
    storageLocations: { location_id: number; location_name: string; containers: ContainerObj[]; }[];
    onBack: () => void;
};

const getLocFromContainer = (sl: slSchema[], contVal: any) => {
    return sl.find(l => l.containers.map(c => c.storage_id).includes(Number(contVal)));
}

export function BinDetail({ container, items, storageLocations, onBack }: Props) {
    const [isEditing, setIsEditing] = useState<boolean | number>(false);
    const [activeItem, setActiveItem] = useState<ItemObj | null>(items.find(i => i.item_id == isEditing) ?? null)

    const [storageContainerVal, setStorageContainerVal] = useState<string>(activeItem?.storage_id?.toString() ?? '');
    const [activeLocation, setActiveLocation] = useState<slSchema | null>(getLocFromContainer(storageLocations, storageContainerVal) ?? null);

    // useEffect(() => {
    //     console.log('effect. change:', isEditing)
    //     setActiveItem(items.find(i => i.item_id == isEditing) ?? null);
    //     setStorageContainerVal(activeItem?.storage_id?.toString() ?? '');
    //     setActiveLocation(getLocFromContainer(storageLocations, storageContainerVal) ?? null);
    // }, [isEditing]);

    if (isEditing) {
        if (!activeItem) {
            setIsEditing(false);
            return;
        }

        const activeLocContainers = storageLocations.find(l => l.location_id === Number(activeLocation?.location_id))?.containers;

        const submitHandler = () => {
            // try to just log all the values you can find from right here.
        }

        const moveItemHandler = (container: string, location: string | null) => {
            console.log(container) // handle this first, it will always change 
            setStorageContainerVal(container); // this should come in as a string of the ID

            if (!location) return;
            const newActiveLoc = storageLocations.find(sl => sl.location_id === Number(location));
            if (newActiveLoc) {
                setActiveLocation(newActiveLoc);
                setStorageContainerVal(String(newActiveLoc.containers[0].storage_id));
            }
        }

        return (
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle" style={{ marginBottom: 40 }}>
                    {activeItem.item}
                </ThemedText>
                <ItemValueRow label="ID" incomingValue={activeItem.item_id} />
                <ItemValueRow label="Name" incomingValue={activeItem.item} />
                {/* <ItemValueRow label="Storage container" incomingValue={activeItem.storage_id} /> */}
                <ItemValueRow label="Description" incomingValue={activeItem.description} multiline={true} />
                <StorageLocationSelect storageContainerVal={storageContainerVal} activeLocation={activeLocation}
                    storageLocations={storageLocations}
                    pushContainerUpdate={(containerId, locationId = null) => { console.log(containerId); console.log(locationId)}}
                />

                <ThemedView style={styles.editButtons}>
                    <BasicButton text="Delete" submitHandler={() => {}} />
                    <BasicButton text="Submit" submitHandler={() => {submitHandler}} />
                </ThemedView>
            </ThemedView>
        )
    }

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
                    <ThemedText themeColor="textSecondary" style={[styles.centerText, { marginBottom: 5 }]}>
                        There are no items in this container.
                    </ThemedText>
                ) : (
                    <ThemedView>
                        {items.map(item => (
                            <ThemedView key={item.item_id} id={String(padInput(item.item_id, 3))} style={styles.itemRow}>
                                <Pressable onPress={() => { console.log('prev:', isEditing, 'set is editing:', item.item_id); setIsEditing(item.item_id);}} style={{ padding: 6 }}>
                                    <Image
                                        source={require('@/assets/images/edit.png')}
                                        width={60} height={60} alt="edit icon"
                                        style={styles.editIcon}
                                    />
                                </Pressable>
                                <ThemedView>
                                    <ThemedText>{item.item}</ThemedText>
                                    {item.description ? (
                                        <ThemedText type="small" themeColor="textSecondary">
                                            {item.description}
                                        </ThemedText>
                                    ) : null}
                                </ThemedView>
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
    centerText: {
        textAlign: 'center',
    },
    itemRow: {
        paddingVertical: Spacing.two,
        paddingHorizontal: Spacing.four,
        marginBottom: Spacing.two,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20
    },
    btnText: {
        fontSize: 18,
        marginBottom: 5,
        color: '#fff',
        // maxHeight: 40,
        marginTop: 5
    },
    btn: {
        backgroundColor: '#2932b7',
        borderRadius: 4,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: 'auto',
        // maxHeight: 40,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    btnHovered: {
        backgroundColor: '#565cb3'
    },
    btnPressed: {
        backgroundColor: '#565cb3'
    },
    editIcon: {
        width: 20,
        height: 20,
    },
    editButtons: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
        alignItems: 'center',
    }
});