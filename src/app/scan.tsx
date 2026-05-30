import React, { useEffect, useState, useRef, useCallback } from 'react';
import { TextInput, StyleSheet, Platform, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ScreenContainer } from '@/components/screen-container';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BinDetail } from '@/components/bin-detail';

import { useInventory } from '@/store/inventory';
import { parseRFID } from '@/constants/helpers';
import BasicButton from '@/components/basic-button';

export default function ScanScreen() {
    const inputRef = useRef<TextInput>(null);
    const [scannedInput, setScannedInput] = useState<string>('');
    const [invalidStorageId, setInvalidStorageId] = useState<boolean>(false);
    const [selectedStorageId, setSelectedStorageId] = useState<number | null>(null);
    const { data, isLoading, isError } = useInventory();

    useFocusEffect(
        useCallback(() => {
            return () => {
                setScannedInput('');
                setInvalidStorageId(false);
                setSelectedStorageId(null);
            };
        }, [])
    );

    const handleClear = () => setScannedInput('');

    const handleScanChange = (val: string) => {
        const digitsOnly = val.replace(/\D/g, '');
        setScannedInput(digitsOnly);
        setInvalidStorageId(false);
    };

    const submitHandler = () => {
        // pull the digits you're gonna split by.
        const match = data ? parseRFID(data, scannedInput) : null;

        handleClear();
        if (!match) {
            setInvalidStorageId(true);
            setSelectedStorageId(null);
            return;
        }
        setSelectedStorageId(match.storage_id);
    }

    useEffect(() => {
        if (Platform.OS !== 'web') return;
        const receiveCode = (e: KeyboardEvent) => {
            setInvalidStorageId(false);
            if (e.key && /^\d$/.test(e.key) && !inputRef.current?.isFocused()) {
                inputRef.current?.focus();
            }
        }

        window.addEventListener('keydown', receiveCode);
        return () => window.removeEventListener('keydown', receiveCode);
    }, []);

    if (isLoading) return <ScreenContainer><ThemedText>Loading…</ThemedText></ScreenContainer>;
    if (isError || !data) return <ScreenContainer><ThemedText>Error. Please close and reopen the app.</ThemedText></ScreenContainer>;

    // Detail view — items inside the tapped bin.
    if (selectedStorageId !== null) {
        const container = data.containers.find(c => c.storage_id === selectedStorageId);
        if (!container) return null;
        const items = data.items.filter(i => i.storage_id === selectedStorageId);
        
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

    return (
        <ScreenContainer>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="subtitle">Scan</ThemedText>
                <ThemedText style={styles.centerText} themeColor="textSecondary">
                    Use the scanner to input a code...
                </ThemedText>
            </ThemedView>

            <ThemedView>
                <View style={styles.inputBtnContainer}>
                    <TextInput
                        id="scan-input"
                        ref={inputRef}
                        style={styles.input}
                        placeholderTextColor="rgba(0, 0, 0, 0.6)"
                        keyboardType='numeric'
                        placeholder="...or type one manually here."
                        submitBehavior="submit"
                        onChangeText={handleScanChange}
                        onSubmitEditing={submitHandler}
                        value={scannedInput}
                    />

                    <BasicButton text="&#8594;" submitHandler={submitHandler} />
                </View>
                
                { invalidStorageId ?
                    <ThemedText style={styles.centerText} themeColor="textSecondary">
                        The code you entered is not valid.
                    </ThemedText>
                : null}
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
        marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        marginTop: 0,
        minWidth: 300,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        color: '#000',
        // height: 40,
        flexShrink: 1
    },
    inputBtnContainer: {
        display: 'flex',
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 16,
        width: 'auto',
        marginHorizontal: 'auto',
        marginBottom: 24,
        maxWidth: '95%',
        flexWrap: 'wrap',
    },
});
