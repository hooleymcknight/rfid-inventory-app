import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, PressableStateCallbackType, Text, Image, Alert, Platform } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { ContainerObj, ItemObj, ItemUpdate, slSchema } from '@/constants/db-interface';
import { toRFID, capitalizeWords, padInput, fixFieldType } from '@/constants/helpers';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ItemValueRow } from './item-value-row';
import { StorageLocationSelect } from './storage-location-select';
import BasicButton from './basic-button';

type Props = {
    container: ContainerObj | undefined;
    items: ItemObj[];
    storageLocations?: { location_id: number; location_name: string; containers: ContainerObj[]; }[];
    onBack: () => void;
    updateInventory?: any; // this is an object / class on which we call mutate
    deleteItem?: any // update this
};

const numberFields = ['id', 'location', 'container'];

const areIdentical = (original: ItemObj | null, active: ItemObj | null) => {
    const orig = {...original};
    const curr = {...active};
    for (const key of Object.keys(orig)) {
        const partA = (orig as Record<string, string | number | null>)[key];
        const partB = (curr as Record<string, string | number | null>)[key];
        // console.log('orig:', partA, 'new:', partB);
        if (partA !== partB) {
            return false;
        }
    };
    return true;
}

export function BinDetail({ container, items, storageLocations, onBack, updateInventory, deleteItem }: Props) {
    const [isEditing, setIsEditing] = useState<boolean | number>(false);
    const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);
    const [originalItemState, setOriginalItemState] = useState<ItemObj | null>(null);

    const getActiveItem = () => { return items.find(i => i.item_id === isEditing) ?? null }
    const [editingLocation, setEditingLocation] = useState<slSchema | null>(storageLocations?.find(l => l.containers.filter(c => c.storage_id === getActiveItem()?.storage_id)[0]) ?? null);
    const [editingContainer, setEditingContainer] = useState<string | null>(String(getActiveItem()?.storage_id));
    const [activeItem, setActiveItem] = useState<ItemObj | null>(getActiveItem());

    useEffect(() => {
        const startingActiveItem = activeItem ?? getActiveItem() ?? null;
        if (!startingActiveItem) return;
        setEditingLocation(storageLocations?.find(l => l.containers.filter(c => c.storage_id === startingActiveItem.storage_id)[0]) ?? null);
        setEditingContainer(String(startingActiveItem.storage_id));
        setActiveItem(startingActiveItem);
        if (originalItemState === null) setOriginalItemState(startingActiveItem);
    }, [isEditing, activeItem]);

    if (isEditing && !!storageLocations) {

        const fieldChangeHandler = (fieldName: string, fieldVal: string | number | null) => {
            const base = activeItem ?? getActiveItem();
            if (!base || fieldName.toLowerCase() === 'id') return;

            let outputType = numberFields.includes(fieldName.toLowerCase()) ? 'number' : 'string';

            let newFieldValue = fixFieldType(fieldVal, outputType);
            
            const updatedItem = {...base};
            if (fieldName.toLowerCase() !== 'description' && newFieldValue === null) {
                newFieldValue = '';
            }
            (updatedItem as Record<string, string | number | null>)[fieldName] = newFieldValue;
            setActiveItem(updatedItem);
        }

        const editSubmitHandler = (activeItem: ItemObj | null, storageId: string | null) => {
            if (activeItem == null || storageId == null) {
                setUpdateSuccess(false);
                console.error('something is null');
                return;
            };

            try {
                let submissionData: ItemUpdate = {
                    item_id: activeItem.item_id,
                }
                if (activeItem.item) submissionData.item = activeItem.item;
                if (activeItem.storage_id) submissionData.storage_id = activeItem.storage_id;
                if (items.filter(i => i.item_id === activeItem.item_id)[0].description !== activeItem.description) submissionData.description = activeItem.description;

                updateInventory.mutate({
                    item_id: activeItem.item_id,
                    item: activeItem.item || null,
                    description: activeItem.description || null,
                    storage_id: storageId || null,
                }, {
                    onSuccess: () => {
                        setUpdateSuccess(true);
                    },
                });
            }
            catch (err) {
                console.error(err);
                setUpdateSuccess(false);
            }
        }

        const exitEditMode = () => {
            setIsEditing(false);
            setOriginalItemState(null);
            setEditingLocation(null);
            setEditingContainer(null);
            setActiveItem(null);
            setUpdateSuccess(null);
        }

        const deleteHandler = (id: number) => {
            try {
                deleteItem.mutate({
                    item_id: id,
                }, {
                    onSuccess: () => {
                        exitEditMode();
                    },
                })
            }
            catch (err) {
                console.error(err);
                setUpdateSuccess(false);
            }
        }

        const fireDeleteAlert = () => {
            if (!activeItem?.item_id) return;
            
            if (Platform.OS === 'web') {
                const ok = window.confirm("Delete item? This cannot be undone! You'll have to make it again!");
                if (ok) deleteHandler(activeItem.item_id);
                return;
            }
            
            Alert.alert('Delete item?', 'This cannot be undone! You\'ll have to make it again!',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => {deleteHandler(activeItem?.item_id)}}
                ]
            )
        }

        return (
            <ThemedView style={styles.header}>
                <ThemedText type="subtitle" style={{ marginBottom: 40 }}>
                    {activeItem?.item}
                </ThemedText>
                <ThemedText type={updateSuccess ? 'success' : updateSuccess === false ? 'fail' : 'smallBold'}>
                    { updateSuccess ? 'Edits saved!' : updateSuccess === false ? 'Edits failed. Please try again.' : String('\u00A0') }
                </ThemedText>

                <ItemValueRow label="ID"
                    incomingValue={activeItem?.item_id ?? null}
                    onUpdate={(val) => { fieldChangeHandler('item_id', val) }}
                />
                <ItemValueRow label="Name"
                    incomingValue={activeItem?.item ?? null}
                    onUpdate={(val) => { fieldChangeHandler('item', val) }}
                />
                <ItemValueRow label="Description" multiline={true}
                    incomingValue={activeItem?.description ?? null}
                    onUpdate={(val) => { fieldChangeHandler('description', val) }}
                />
                
                <StorageLocationSelect
                    storageContainerId={editingContainer ?? ''}
                    activeLocationObj={editingLocation}
                    storageLocationsArr={storageLocations}
                    pushContainerUpdate={(storageId, locationId = null) => {
                        setEditingContainer(storageId);
                        if (locationId) setEditingLocation(storageLocations.find(l => l.location_id === Number(locationId)) ?? null)
                    }} // these come back as strings
                />

                <ThemedView style={styles.editButtons}>
                    <BasicButton text="Delete" submitHandler={fireDeleteAlert} />
                    <BasicButton canSubmit={originalItemState !== null && !areIdentical(originalItemState, activeItem)} text="Submit" submitHandler={() => {editSubmitHandler(activeItem, editingContainer)}} />
                </ThemedView>

                <Pressable
                    style={({ hovered, pressed }: PressableStateCallbackType) => [
                        styles.btn,
                        hovered && styles.btnHovered,
                        pressed && styles.btnPressed,
                        {marginTop: 40}
                    ]}
                    onPress={exitEditMode}
                >
                    <Text style={styles.btnText}>Go back</Text>
                </Pressable>
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
                                <Pressable onPress={() => {setIsEditing(item.item_id)}} style={{ padding: 6 }}>
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
        paddingVertical: 8,
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