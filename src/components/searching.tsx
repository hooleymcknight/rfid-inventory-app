import Fuse from 'fuse.js';
import { Pressable, PressableStateCallbackType, Text, StyleSheet } from 'react-native';
import { ThemedView } from './themed-view';

type Props = {
    data: Array<any>;
    searchString: string;
    onBack: () => void;
};

export default function SearchScreen({ data, searchString, onBack}: Props) {

    const fuse = new Fuse(data, {
        keys: []
    });

    const results = fuse.search(searchString);

    return (
        <ThemedView>
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
    )
}

const styles = StyleSheet.create({
    btnText: {
        fontSize: 18,
        marginBottom: 5,
        color: '#fff',
        maxHeight: 40,
        marginTop: 5
    },
    btn: {
        backgroundColor: '#2932b7',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 24,
        width: 'auto',
        maxHeight: 40,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    btnHovered: {
        backgroundColor: '#565cb3'
    },
    btnPressed: {
        backgroundColor: '#565cb3'
    },
});