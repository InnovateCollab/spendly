import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { Spacing } from '@/constants/theme';

export function AddButton() {
    const router = useRouter();

    return (
        <Pressable
            onPress={() => router.push('/add' as any)}
            style={({ pressed }) => pressed && styles.pressed}
        >
            <ThemedView type="backgroundElement" style={[styles.addButtonView, { backgroundColor: '#22c55e' }]}>
                <ThemedText style={styles.addButtonText}>+</ThemedText>
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.7,
    },
    addButtonView: {
        paddingVertical: Spacing.one,
        paddingHorizontal: Spacing.two,
        borderRadius: Spacing.three,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
    },
});
