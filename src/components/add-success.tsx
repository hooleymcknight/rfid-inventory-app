import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ButtonSet } from '@/components/button-set';
import BasicButton from '@/components/basic-button';
import { ContainerObj } from '@/constants/db-interface';
import { ThemedView } from './themed-view';
import { ScreenContainer } from './screen-container';
import { Spacing } from '@/constants/theme';

type Props = {
    container: ContainerObj;
    inputName: string;
    scannedInput: string;
    onAddMore: (scannedInput: string) => void;       // same bin, new item
    onAddElsewhere: () => void;  // new bin, new item
};

const btnStyles = {
    fontSize: 20,
    // lineHeight: 24,
    margin: 0
}

export default function AddedSuccess({ container, inputName, scannedInput, onAddMore, onAddElsewhere } : Props) {
    const router = useRouter();

    const viewBin = () => {
        router.push({ pathname: '/browse', params: { defaultBin: String(container.storage_id) } });
    }

    const addMoreSubmitHandler = () => {
        // there was absolutely a plan for this... I will leave it here in case I remember.
    }
    
    return (
        <ScreenContainer>
            <ThemedView style={[styles.titleContainer, { paddingBottom: 36}]}>
                <ThemedText type="subtitle">{inputName} successfully added to {container.container}</ThemedText>
                <ThemedText type="small">{scannedInput}</ThemedText>
            </ThemedView>
            <ThemedView>
                <ButtonSet justifyContent='center'>
                    <BasicButton text="Go to container" submitHandler={viewBin} customTextStyles={btnStyles} />
                    <BasicButton text="Add more to this bin" submitHandler={() => { addMoreSubmitHandler(); onAddMore(scannedInput); }} customTextStyles={btnStyles} />
                    <BasicButton text="Add to another bin" submitHandler={onAddElsewhere} customTextStyles={btnStyles} />
                </ButtonSet>
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