import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

import { ThemedView } from '../ui/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

interface TabListContainerProps extends ViewProps {
    children?: React.ReactNode;
}

export function TabListContainer({ children, ...props }: TabListContainerProps) {
    return (
        <View {...props} style={styles.tabListContainer}>
            <ThemedView type="backgroundElement" style={styles.innerContainer}>
                {children}
            </ThemedView>
        </View>
    );
}

const styles = StyleSheet.create({
    tabListContainer: {
        position: 'absolute',
        width: '100%',
        padding: Spacing.three,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    innerContainer: {
        paddingVertical: Spacing.two,
        paddingHorizontal: Spacing.five,
        borderRadius: Spacing.five,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.two,
        maxWidth: MaxContentWidth,
    },
});
