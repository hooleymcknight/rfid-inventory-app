import { ThemedView } from "./themed-view";
import { ThemedText } from "./themed-text";
import { StyleSheet, TextInput, Platform } from "react-native";
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { ContainerObj } from "@/constants/db-interface";
import { capitalizeWords } from "@/constants/helpers";

type slSchema = { location_id: number; location_name: string; containers: ContainerObj[]; };

type Props = {
    // incomingValue: string | number | null;
    storageContainerVal: string;
    activeLocation: slSchema | null;
    storageLocations: slSchema[];
    pushContainerUpdate: (container: string, location?: string | null) => void;
};

const example = [
    { location_id: 200, location_name: 'front room', containers: [] },
    { location_id: 300, location_name: 'garage', containers: [] }
]

const getLocFromContainer = (sl: slSchema[], contVal: any) => {
    return sl.find(l => l.containers.map(c => c.storage_id).includes(Number(contVal)));
}

// export function StorageLocationSelect({ incomingValue, storageLocations }: Props) {
//     const [value, setValue] = useState<string>(incomingValue?.toString() ?? '');
//     const [activeLocation, setActiveLocation] = useState<LocationObj>()

//     const activeLocContainers = storageLocations.find(l => l.id === Number(activeLocation?.location_id))?.containers;

// export function StorageLocationSelect({ incomingValue, storageLocations }: Props) {
export function StorageLocationSelect({ storageContainerVal, activeLocation, storageLocations, pushContainerUpdate }: Props) {
    // const [storageContainerVal, setStorageContainerVal] = useState<string>(incomingValue?.toString() ?? '');
    // const [activeLocation, setActiveLocation] = useState<slSchema | null>(getLocFromContainer(storageLocations, storageContainerVal) ?? null);

    const activeLocContainers = storageLocations.find(l => l.location_id === Number(activeLocation?.location_id))?.containers;

    const locationChangeHandler = (locationId: string) => {
        const newActiveLoc = storageLocations.find(sl => sl.location_id === Number(locationId));
        const containerId = String(newActiveLoc?.containers[0].storage_id) ?? null;
        pushContainerUpdate(containerId, locationId);
    }

    // const pushState = () => {

    // }

    /*
    useEffect(() => {
        setStorageContainerVal(incomingValue?.toString() ?? '');
    }, [incomingValue]);
    */

    return (
        <>
            <ThemedView style={styles.inputRow}>
                <ThemedText style={styles.textLabel}>
                    Location
                </ThemedText>
                <Picker
                    selectedValue={String(activeLocation?.location_id)}
                    onValueChange={(locationId) => {locationChangeHandler(locationId)}}
                    style={styles.textInput}
                >
                    {storageLocations.map(l => 
                        <Picker.Item label={l.location_name} value={l.location_id} key={l.location_id} />
                    )}
                </Picker>

            </ThemedView>

            <ThemedView style={styles.inputRow}>
                <ThemedText style={styles.textLabel}>
                    Container
                </ThemedText>

                {activeLocation && activeLocContainers ?
                    <Picker
                        selectedValue={String(storageContainerVal)}
                        // onValueChange={(contVal) => {setStorageContainerVal(contVal)}}
                        onValueChange={(container) => {pushContainerUpdate(container)}}
                        style={styles.textInput}
                    >
                        {activeLocContainers.map(c => 
                            <Picker.Item label={c.container} value={c.storage_id} key={c.storage_id} />
                        )}
                    </Picker>
                : null}

            </ThemedView>
        </>
    )
}

const styles = StyleSheet.create({
    inputRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '95%',
        maxWidth: 400,
    },
    textLabel: {
        width: 140,
        marginRight: 20,
    },
    textInput: {
        flexGrow: 1,
        textAlign: 'right',
        backgroundColor: '#fafafa',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 4,
        width: 'auto',
        marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        color: '#000',
    }
})