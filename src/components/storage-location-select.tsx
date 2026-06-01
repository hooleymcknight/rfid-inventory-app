import { ThemedView } from "./themed-view";
import { ThemedText } from "./themed-text";
import { StyleSheet, TextInput, Platform } from "react-native";
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { ContainerObj } from "@/constants/db-interface";
import { capitalizeWords } from "@/constants/helpers";

type slSchema = { location_id: number; location_name: string; containers: ContainerObj[]; };

type Props = {
    storageContainerId: string;
    activeLocationObj: slSchema | null;
    storageLocationsArr: slSchema[];
    pushContainerUpdate: (container: string, location?: string | null) => void;
};

const slExample = [
    { location_id: 200, location_name: 'front room', containers: [] },
    { location_id: 300, location_name: 'garage', containers: [] }
]

const getLocFromContainer = (sl: slSchema[], contVal: any) => {
    return sl.find(l => l.containers.map(c => c.storage_id).includes(Number(contVal)));
}

export function StorageLocationSelect({ storageContainerId, activeLocationObj, storageLocationsArr, pushContainerUpdate }: Props) {

    return (
        <>
            <ThemedView style={styles.inputRow}>
                <ThemedText style={styles.textLabel}>
                    Location
                </ThemedText>
                <Picker
                    selectedValue={activeLocationObj?.location_id}
                    onValueChange={(val) => { pushContainerUpdate(storageLocationsArr.find(l => l.location_id === Number(val))?.containers[0].storage_id.toString() ?? '', val.toString()) }}
                    style={styles.textInput}
                >
                    {storageLocationsArr.map(l => 
                        <Picker.Item label={l.location_name} value={l.location_id} key={l.location_id} />
                    )}
                </Picker>

            </ThemedView>

            <ThemedView style={styles.inputRow}>
                <ThemedText style={styles.textLabel}>
                    Container
                </ThemedText>

                {activeLocationObj && activeLocationObj.containers ?
                    <Picker
                        selectedValue={storageContainerId}
                        onValueChange={(val) => { pushContainerUpdate(val) }}
                        style={styles.textInput}
                    >
                        {activeLocationObj.containers.map(c => // map the active location's containers out here 
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
        // textAlign: 'right',
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