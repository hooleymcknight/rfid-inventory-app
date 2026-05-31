import { ThemedView } from "./themed-view";
import { ThemedText } from "./themed-text";
import { StyleSheet, TextInput, Platform } from "react-native";
import { useState, useEffect } from 'react';

type Props = {
    label: string;
    incomingValue: string | number | null;
    multiline?: boolean;
};

export function ItemValueRow({ label, incomingValue, multiline = false }: Props) {
    const [value, setValue] = useState<string>(incomingValue?.toString() ?? '');

    // const changeHandler = (val: string) => {
    //     console.log(val);
    //     setValue(val);
    // }

    useEffect(() => {
        setValue(incomingValue?.toString() ?? '');
    }, [incomingValue]);

    return (
        <ThemedView style={styles.inputRow}>
            <ThemedText style={styles.textLabel}>
                {label}
            </ThemedText>
            <TextInput
                style={styles.textInput}
                value={value}
                onChangeText={setValue}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
            />
        </ThemedView>
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