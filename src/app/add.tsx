import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AddScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const theme = useTheme();

    const insets = {
        ...safeAreaInsets,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };

    const contentPlatformStyle = Platform.select({
        android: {
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
        },
        web: {
            paddingTop: Spacing.six,
            paddingBottom: Spacing.four,
        },
    });

    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
        >
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <SymbolView
                        name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                        size={48}
                        tintColor="#22c55e"
                    />
                    <ThemedText type="subtitle" style={styles.title}>
                        Add Transaction
                    </ThemedText>
                </View>

                <ThemedView type="backgroundElement" style={styles.card}>
                    <ThemedText type="default" style={styles.comingSoon}>
                        Transaction form coming soon...
                    </ThemedText>
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    container: {
        maxWidth: MaxContentWidth,
        flexGrow: 1,
        padding: Spacing.four,
    },
    header: {
        alignItems: 'center',
        gap: Spacing.three,
        marginBottom: Spacing.six,
        marginTop: Spacing.four,
    },
    title: {
        textAlign: 'center',
    },
    card: {
        padding: Spacing.four,
        borderRadius: Spacing.three,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
    },
    comingSoon: {
        textAlign: 'center',
        fontSize: 16,
    },
});
