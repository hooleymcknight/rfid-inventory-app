import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 60 * 6,       // 6 hours — won't refetch unless older
            gcTime: 1000 * 60 * 60 * 24 * 7,     // keep cache 7 days
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
    },
});

const persister = createAsyncStoragePersister({ storage: AsyncStorage });

export default function TabLayout() {
    // DEV ONLY — wipes persisted cache on every mount so schema/shape
    // changes don't surface as stale data while iterating.
    // Remove (and bump the `buster` string instead) before shipping.
    // AsyncStorage.clear().then(() => console.log('cache cleared'));

    const colorScheme = useColorScheme();
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
        >
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <AnimatedSplashOverlay />
                <AppTabs />
            </ThemeProvider>
        </PersistQueryClientProvider>
    );
}
