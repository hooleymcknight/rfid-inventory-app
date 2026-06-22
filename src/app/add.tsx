import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, TextInput, View, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { Spacing } from '@/constants/theme';
import { useInventory, useAddToInventory } from '@/store/inventory';
import { parseRFID } from '@/constants/helpers';
import AddedSuccess from '@/components/add-success';
import BasicButton from '@/components/basic-button';

const restoreValue = (el: HTMLInputElement, value: string) => {
    const proto = el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true })); // RN Web → onChangeText
}

export default function AddScreen() {
    const [selectedStorageId, setSelectedStorageId] = useState<number | null>(null);
    const [inputName, setInputName] = useState<string>('');
    const [inputDesc, setInputDesc] = useState<string>('');
    const [scannedInput, setScannedInput] = useState<string>('');
    const [addSuccess, setAddSuccess] = useState<string | null>(null);
    const [containerTag, setContainerTag] = useState<string | null>(null);

    const { toBin } = useLocalSearchParams<{ toBin?: string }>();
    const preselectedStorageBin = toBin ?? null;
    
    const preselectedRef = useRef<string | null>(null);
    const rfidInputRef = useRef<HTMLInputElement | null>(null);
    const addInventory = useAddToInventory();
    const { data, isLoading, isError } = useInventory();

    const isValidId = (input: string) => {
        if (!data) return false;
        const match = parseRFID(data, input);
        return data.containers.some(c => c.storage_id === match?.storage_id);
    }

    const canSubmit = inputName.trim().length > 0 && isValidId(scannedInput) && inputName.trim() !== scannedInput;

    const handleClear = () => {
        setScannedInput('');
    };

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

    useFocusEffect(
        useCallback(() => {
            const reset = () => {
                setSelectedStorageId(null);
                setInputName('');
                setInputDesc('');
                setAddSuccess(null);
                setContainerTag(null);   // clears the sticky autoFocus
            };

            if (Platform.OS !== 'web') {
                return reset;
            }

            let buffer = '';
            let lastKeyTime = 0;
            let scanSnapshot: { el: HTMLInputElement; value: string } | null = null;
            const SCAN_GAP_MS = 50;

            const onKeyDown = (e: KeyboardEvent) => {
                const now = performance.now();
                const gap = now - lastKeyTime;
                lastKeyTime = now;

                if (gap > SCAN_GAP_MS) {
                    buffer = '';
                    scanSnapshot = null;
                }

                if (e.key === 'Enter') {
                    if (/^\d{10}$/.test(buffer)) {
                        setContainerTag('rfid');
                        setScannedInput(buffer);
                        // undo the stray first digit that leaked into the focused field,
                        // unless that field was the RFID input itself (we overwrite it anyway)
                        if (scanSnapshot && scanSnapshot.el !== rfidInputRef.current) {
                            restoreValue(scanSnapshot.el, scanSnapshot.value);
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    buffer = '';
                    scanSnapshot = null;
                    return;
                }

                if (/^\d$/.test(e.key)) {
                    if (gap <= SCAN_GAP_MS) {
                        // burst digits 2–10 → swallow before they reach any field
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        // buffer was just cleared above → this is the first digit.
                        // can't yet know if it's a scan, so let it through but snapshot
                        // the field's clean value (insertion hasn't happened yet)
                        const el = document.activeElement as HTMLInputElement | null;
                        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                            scanSnapshot = { el, value: el.value };
                        }
                    }
                    buffer += e.key;
                }
            };

            window.addEventListener('keydown', onKeyDown, true); // capture phase            

            return () => {
                window.removeEventListener('keydown', onKeyDown, true);
                reset();
            };
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            if (preselectedStorageBin && preselectedRef.current !== preselectedStorageBin) {
                setScannedInput(preselectedStorageBin);
                preselectedRef.current = preselectedStorageBin;
            }

            return () => {
                setScannedInput(''); // only reset this when you lose focus entirely.
            };
        }, [preselectedStorageBin])
    );

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
                        ref={rfidInputRef as any}
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
        paddingHorizontal: 8,
        paddingVertical: 14,
        borderRadius: 4,
        width: 'auto',
        // marginHorizontal: 'auto',
        marginTop: 0,
        // marginBottom: 24,
        minWidth: 300,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        // height: 40,
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
