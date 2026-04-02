import { Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { Spacing } from '@/constants/theme';
import { useAddTransaction } from '@/contexts/add-transaction-context';

export function AddButton() {
    const router = useRouter();
    const { openAddTransaction } = useAddTransaction();

    const handlePress = () => {
        if (Platform.OS === 'web') {
            openAddTransaction();
        } else {
            router.push('/transaction' as any);
        }
    };

    return (
        <Pressable
            onPress={handlePress}
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
