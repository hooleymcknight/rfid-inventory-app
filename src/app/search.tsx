import { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, TextInput, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Fuse from 'fuse.js';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenContainer } from '@/components/screen-container';

import { useInventory } from '@/store/inventory';
import { ItemObj } from '@/constants/db-interface';
import { Spacing } from '@/constants/theme';
import BasicButton from '@/components/basic-button';

export default function SearchScreen() {
    const [noResults, setNoResults] = useState<boolean>(false);
    const [searchString, setSearchString] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Array<ItemObj>>([]);
    const { data, isLoading, isError } = useInventory();

    useFocusEffect(
        useCallback(() => {
            // stuff here runs when screen gains focus — optional

            return () => {
                setNoResults(false);
                setSearchString('');
                setSearchResults([]);
            };
        }, [])
    );

    const changeHandler = (val: string) => {
        setNoResults(false);
        setSearchString(val);
    }

    if (isLoading) return <ScreenContainer><ThemedText>Loading… {data}</ThemedText></ScreenContainer>;
    if (isError || !data) return <ScreenContainer><ThemedText>Error. Please close and reopen the app.</ThemedText></ScreenContainer>;

    const fuse = useMemo(
        () => new Fuse(data.items, { keys: ['item', 'description'] }),
        [data.items]
    );

    const submitHandler = () => {
        const results = fuse.search(searchString);
        if (results.length) {
            setSearchResults(results.map(x => x.item));
            setNoResults(false);
        } else {
            setSearchResults([]);
            setNoResults(true);
        }
    }

    return (
        <ScreenContainer>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="subtitle">Search</ThemedText>
                <ThemedText style={styles.centerText} themeColor="textSecondary">
                    Search up an item name below.
                </ThemedText>
            </ThemedView>

            <ThemedView>
                <View style={styles.inputBtnContainer}>
                    <TextInput
                        id="search-input"
                        style={styles.input}
                        placeholderTextColor='rgba(0, 0, 0, 0.6)'
                        placeholder="Search for an item"
                        submitBehavior="submit"
                        onSubmitEditing={submitHandler}
                        value={searchString}
                        onChangeText={changeHandler}
                    />

                    <BasicButton text="&#8594;" submitHandler={submitHandler} />
                </View>

                { searchResults.length > 0 ?
                    <View style={{ paddingHorizontal: Spacing.four }}>
                        {searchResults.map(x => {
                            // this is "an" handler if one of these doesn't exist... it'll render the search result 
                            // and we'll just be confused about where it is.
                            const container = data.containers.find(y => y.storage_id === x.storage_id) ??
                                { container: "unknown", location_id: null };
                            const location = data.locations.find(z => z.location_id === container.location_id) ??
                                { location_name: "unknown" };
                            return (
                                <View key={x.item_id} style={{ marginBottom: 8 }}>
                                    <ThemedText type="largeBold">{x.item}</ThemedText>
                                    {x.description ? <ThemedText>{x.description}</ThemedText> : null}
                                    <ThemedText>Location:  {location.location_name}</ThemedText>
                                    <ThemedText>Container:  {container.container}</ThemedText>
                                </View>
                            );
                        })}
                    </View>
                : noResults ? // pretty sure having no results is different than not having search results
                    <View>
                        <ThemedText>No results.</ThemedText>
                    </View>
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
        padding: 8,
        borderRadius: 4,
        width: 'auto',
        marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
        marginTop: 0,
        minWidth: 300,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.4)',
        color: '#000',
        height: 40,
        flexShrink: 1,
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
