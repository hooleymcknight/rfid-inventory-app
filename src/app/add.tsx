import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TextInput, View, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/screen-container';
import { useFocusEffect } from 'expo-router';

import { Spacing } from '@/constants/theme';
import { useInventory, useAddToInventory } from '@/store/inventory';
import { parseRFID } from '@/constants/helpers';
import AddedSuccess from '@/components/add-success';
import BasicButton from '@/components/basic-button';

export default function AddScreen() {
    const [selectedStorageId, setSelectedStorageId] = useState<number | null>(null);
    const [inputName, setInputName] = useState<string>('');
    const [inputDesc, setInputDesc] = useState<string>('');
    const [scannedInput, setScannedInput] = useState<string>('');
    const [addSuccess, setAddSuccess] = useState<string | null>(null);
    const [containerTag, setContainerTag] = useState<string | null>(null);
    
    const addInventory = useAddToInventory();
    const { data, isLoading, isError } = useInventory();

    useFocusEffect(
        useCallback(() => {
            // stuff here runs when screen gains focus — optional

            return () => {
                setSelectedStorageId(null);
                setInputName('');
                setInputDesc('');
                setScannedInput('');
                setAddSuccess(null);
            };
        }, [])
    );

    const isValidId = (input: string) => {
        if (!data) return false;
        const match = parseRFID(data, input);
        return data.containers.some(c => c.storage_id === match?.storage_id);
    }

    const canSubmit = inputName.trim().length > 0 && isValidId(scannedInput);

    const handleClear = () => setScannedInput('');

    const handleScanChange = (val: string) => {
        const digitsOnly = val.replace(/\D/g, '');
        setScannedInput(digitsOnly);
    };
    
    const submitHandler = () => {
        if (!data) return;
        // pull the digits you're gonna split by.
        const match = parseRFID(data, scannedInput);

        
        if (!match) {
            setSelectedStorageId(null); //
            return;
        }

        addInventory.mutate({
            item: inputName,
            description: inputDesc || null,
            storage_id: match.storage_id,
        }, {
            onSuccess: () => {
                setInputDesc('');
                setSelectedStorageId(match.storage_id);
                setAddSuccess(scannedInput);
            },
        });

        handleClear();
    }

    useEffect(() => {
        if (Platform.OS !== 'web') return;
        let buffer = '';
        let lastKeyTime = 0;
        const SCAN_GAP_MS = 50; // keys faster than this = scanner

        const onKeyDown = (e: KeyboardEvent) => {
            const now = performance.now();
            const gap = now - lastKeyTime;
            lastKeyTime = now;

            // Too slow → abandon any in-progress scan buffer
            if (gap > SCAN_GAP_MS) buffer = '';

            if (e.key === 'Enter' && /^\d{10}$/.test(buffer)) {
                // setContainerTag(buffer);
                setContainerTag('rfid');
                setScannedInput(buffer);
                buffer = '';
                e.preventDefault(); // don't let Enter submit whatever input had focus
            } else if (/^\d$/.test(e.key)) {
                buffer += e.key;
            }
        };

        window.addEventListener('keydown', onKeyDown, true); // capture phase

        // back button handler
        // const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        //     if (selectedStorageId !== null) {
        //         setSelectedStorageId(null);
        //         return true;
        //     }
        //     return false;
        // });

        return () => {
            window.removeEventListener('keydown', onKeyDown, true);
            // sub.remove();
        }
    }, []);

    if (isLoading) return <ScreenContainer><ThemedText>Loading…</ThemedText></ScreenContainer>;
    if (isError || !data) return <ScreenContainer><ThemedText>Error. Please close and reopen the app.</ThemedText></ScreenContainer>;

    if (selectedStorageId !== null && addSuccess !== null) {
        const container = data.containers.find(c => c.storage_id === selectedStorageId);
        if (!container) return null;
        return (<AddedSuccess
            container={container}
            inputName={inputName}
            scannedInput={addSuccess}
            onAddMore={(sameBinId) => { setScannedInput(sameBinId); setInputName(''); setAddSuccess(null); }}
            onAddElsewhere={() => { setScannedInput(''); setSelectedStorageId(null); setAddSuccess(null); }}
        />)
    };

    // add view
    return (
        <ScreenContainer>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="subtitle">Add</ThemedText>
                <ThemedText style={styles.centerText} themeColor="textSecondary">
                    Enter the info for a new item.
                </ThemedText>
            </ThemedView>

            <ThemedView>
                <View style={styles.inputBtnContainer}>
                    <TextInput
                        style={[styles.input]}
                        placeholderTextColor="rgba(0, 0, 0, 0.6)"
                        placeholder="item name"
                        submitBehavior="blurAndSubmit"
                        value={inputName}
                        onChangeText={setInputName}
                        onSubmitEditing={submitHandler}
                    />

                    <TextInput
                        style={[styles.input]}
                        placeholderTextColor="rgba(0, 0, 0, 0.6)"
                        placeholder="item description"
                        submitBehavior="blurAndSubmit"
                        value={inputDesc}
                        onChangeText={setInputDesc}
                        onSubmitEditing={submitHandler}
                    />

                    <TextInput
                        style={[styles.input]}
                        placeholderTextColor="rgba(0, 0, 0, 0.6)"
                        keyboardType="numeric"
                        placeholder="scan tag to get RFID"
                        submitBehavior="blurAndSubmit"
                        value={scannedInput}
                        onChangeText={handleScanChange}
                        onSubmitEditing={submitHandler}
                        autoFocus={containerTag === 'rfid'}
                    />

                    <BasicButton
                        text="&#8594;"
                        submitHandler={submitHandler}
                        canSubmit={canSubmit}
                    />
                </View>
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
    input: {
        backgroundColor: '#fafafa',
        padding: 8,
        borderRadius: 4,
        width: 'auto',
        // marginHorizontal: 'auto',
        marginTop: 0,
        // marginBottom: 24,
        minWidth: 300,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        height: 40,
        color: 'black',
    },
    inputBtnContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 16,
        width: 'auto',
        marginHorizontal: 'auto',
        marginBottom: 24,
    },
});
