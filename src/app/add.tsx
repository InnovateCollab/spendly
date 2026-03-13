import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, Pressable, Modal, Platform, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES } from '@/constants/categories';
import { database } from '@/database';
import type { Category } from '@/schemas';

export default function AddScreen() {
    const safeAreaInsets = useSafeAreaInsets();
    const theme = useTheme();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [note, setNote] = useState('');
    const [labels, setLabels] = useState<string[]>([]);
    const [labelInput, setLabelInput] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastOpacity] = useState(new Animated.Value(0));

    const showToastNotification = (message: string, duration = 1500) => {
        setToastMessage(message);
        setShowToast(true);
        Animated.sequence([
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(toastOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setShowToast(false));
    };

    const insets = {
        ...safeAreaInsets,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };



    const addLabel = () => {
        if (labelInput.trim() && !labels.includes(labelInput.trim())) {
            setLabels([...labels, labelInput.trim()]);
            setLabelInput('');
        }
    };

    const removeLabel = (label: string) => {
        setLabels(labels.filter(l => l !== label));
    };

    const getDateString = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };



    return (
        <ScrollView
            style={[styles.scrollView, { backgroundColor: theme.background }]}
            contentInset={insets}
            contentContainerStyle={styles.contentContainer}
        >
            <ThemedView style={styles.container}>
                <ThemedText type="subtitle" style={styles.pageTitle}>
                    Add Transaction
                </ThemedText>

                {/* Amount Section */}
                <ThemedView type="backgroundElement" style={styles.section}>
                    <View style={styles.amountRow}>
                        <Pressable
                            onPress={() => setShowCategoryPicker(true)}
                            style={({ pressed }) => [styles.categoryButton, pressed && { opacity: 0.7 }]}
                        >
                            <View style={styles.categoryDisplay}>
                                {selectedCategory ? (
                                    <>
                                        <SymbolView
                                            name={selectedCategory.icon}
                                            size={28}
                                            tintColor={selectedCategory.color}
                                        />
                                        <ThemedText type="small" style={styles.categoryName}>
                                            {selectedCategory.name}
                                        </ThemedText>
                                    </>
                                ) : (
                                    <>
                                        <SymbolView
                                            name={{ ios: 'dollarsign.circle.fill', android: 'attach_money', web: 'attach_money' }}
                                            size={32}
                                            tintColor="#22c55e"
                                        />
                                        <ThemedText type="small" style={styles.categoryPlaceholder}>
                                            Select
                                        </ThemedText>
                                    </>
                                )}
                            </View>
                        </Pressable>
                        <TextInput
                            style={[styles.amountInput, { color: theme.text }]}
                            placeholder="Amount"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                </ThemedView>

                {/* Category Picker Modal */}
                <Modal
                    visible={showCategoryPicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowCategoryPicker(false)}
                >
                    <ThemedView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <ThemedText type="subtitle">Select Category</ThemedText>
                            <Pressable onPress={() => setShowCategoryPicker(false)}>
                                <ThemedText type="small" style={styles.closeButton}>
                                    Close
                                </ThemedText>
                            </Pressable>
                        </View>
                        <View style={styles.categoryGrid}>
                            {Object.values(CATEGORIES).map((category) => (
                                <Pressable
                                    key={category.name}
                                    onPress={() => {
                                        setSelectedCategory(category);
                                        setShowCategoryPicker(false);
                                    }}
                                    style={({ pressed }) => [
                                        styles.categoryOption,
                                        selectedCategory?.name === category.name && styles.categoryOptionSelected,
                                        pressed && { opacity: 0.7 },
                                    ]}
                                >
                                    <SymbolView
                                        name={category.icon}
                                        size={36}
                                        tintColor={category.color}
                                    />
                                    <ThemedText type="small" style={styles.categoryOptionName}>
                                        {category.name}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </ThemedView>
                </Modal>

                {/* Date Section */}
                <ThemedView type="backgroundElement" style={styles.section}>
                    <View style={styles.row}>
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            style={({ pressed }) => [styles.dateButton, pressed && { opacity: 0.7 }]}
                        >
                            <View style={styles.rowLeft}>
                                <SymbolView
                                    name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
                                    size={24}
                                    tintColor={theme.text}
                                />
                                <ThemedText type="small">{getDateString(selectedDate)}</ThemedText>
                            </View>
                        </Pressable>

                    </View>
                </ThemedView>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            if (Platform.OS === 'android') {
                                setShowDatePicker(false);
                                if (date) {
                                    setSelectedDate(date);
                                }
                            } else if (event.type === 'set' && date) {
                                setSelectedDate(date);
                                setShowDatePicker(false);
                            } else if (event.type === 'dismissed') {
                                setShowDatePicker(false);
                            }
                        }}
                    />
                )}

                {/* Note Section */}
                <ThemedView type="backgroundElement" style={styles.section}>
                    <View style={styles.rowVertical}>
                        <View style={styles.rowLeft}>
                            <SymbolView
                                name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                                size={24}
                                tintColor={theme.text}
                            />
                            <ThemedText type="small">Note</ThemedText>
                        </View>
                        <TextInput
                            style={[styles.noteInput, { color: theme.text, borderColor: theme.textSecondary }]}
                            placeholder="Add a note (optional)"
                            placeholderTextColor={theme.textSecondary}
                            value={note}
                            onChangeText={setNote}
                            multiline
                        />
                    </View>
                </ThemedView>

                {/* Labels Section */}
                <ThemedView type="backgroundElement" style={styles.section}>
                    <View style={styles.rowLeft}>
                        <SymbolView
                            name={{ ios: 'tag.fill', android: 'local_offer', web: 'local_offer' }}
                            size={24}
                            tintColor="#FBBF24"
                        />
                        <ThemedText type="small">Labels</ThemedText>
                    </View>

                    {/* Label Input */}
                    <View style={styles.labelInputContainer}>
                        <TextInput
                            style={[styles.labelInputField, { color: theme.text, borderColor: theme.textSecondary }]}
                            placeholder="Add a label"
                            placeholderTextColor={theme.textSecondary}
                            value={labelInput}
                            onChangeText={setLabelInput}
                        />
                        <Pressable
                            style={({ pressed }) => [styles.addLabelButton, pressed && { opacity: 0.7 }]}
                            onPress={addLabel}
                        >
                            <ThemedText type="small" style={styles.addLabelText}>
                                Add
                            </ThemedText>
                        </Pressable>
                    </View>

                    {/* Display Labels */}
                    {labels.length > 0 && (
                        <View style={styles.labelsDisplay}>
                            {labels.map((label, idx) => (
                                <Pressable
                                    key={idx}
                                    style={styles.labelTag}
                                    onPress={() => removeLabel(label)}
                                >
                                    <ThemedText type="small" style={styles.labelTagText}>
                                        {label} ✕
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </ThemedView>

                {/* Add Button */}
                <Pressable
                    style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
                    onPress={async () => {
                        // Validate required fields
                        if (!amount.trim()) {
                            showToastNotification('Please enter an amount');
                            return;
                        }

                        if (!selectedCategory) {
                            showToastNotification('Please select a category');
                            return;
                        }

                        try {
                            // Parse amount to number
                            const parsedAmount = parseFloat(amount);
                            if (isNaN(parsedAmount)) {
                                showToastNotification('Please enter a valid amount');
                                return;
                            }

                            // Calculate final amount based on category type (negative for expenses)
                            const finalAmount =
                                selectedCategory.type === 'income'
                                    ? parsedAmount
                                    : -parsedAmount;

                            // Insert transaction into database
                            const transactionId = await database.insertTransaction({
                                categoryId: selectedCategory.id,
                                amount: finalAmount,
                                date: selectedDate,
                                note: note || null,
                                labels: labels.length > 0 ? labels : null,
                            });

                            // Reset form
                            setAmount('');
                            setSelectedCategory(null);
                            setSelectedDate(new Date());
                            setNote('');
                            setLabels([]);
                            setLabelInput('');

                            // Show success toast and navigate
                            showToastNotification('Transaction added! ✓', 1200);
                            setTimeout(() => {
                                router.push('/timeline');
                            }, 1500);
                        } catch (error) {
                            console.error('Error adding transaction:', error);
                            showToastNotification('Failed to add transaction');
                        }
                    }}
                >
                    <ThemedText type="small" style={styles.addButtonText}>
                        Add Transaction
                    </ThemedText>
                </Pressable>
            </ThemedView>

            {/* Toast Notification */}
            {showToast && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        {
                            opacity: toastOpacity,
                            transform: [
                                {
                                    translateY: toastOpacity.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <ThemedText style={styles.toastText}>{toastMessage}</ThemedText>
                </Animated.View>
            )}
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
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.four,
        gap: Spacing.three,
    },
    pageTitle: {
        textAlign: 'center',
        paddingTop: Spacing.two,
        paddingBottom: Spacing.two,
    },
    section: {
        padding: Spacing.three,
        borderRadius: Spacing.two,
        gap: Spacing.two,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        justifyContent: 'space-between',
    },
    rowVertical: {
        gap: Spacing.two,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        flex: 1,
    },
    rowRight: {
        marginLeft: 'auto',
        color: '#007AFF',
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        paddingVertical: Spacing.one,
        textAlign: 'right',
    },
    noteInput: {
        borderWidth: 1,
        borderRadius: Spacing.one,
        padding: Spacing.two,
        minHeight: 80,
        fontSize: 14,
    },
    labelInputContainer: {
        flexDirection: 'row',
        gap: Spacing.one,
        alignItems: 'center',
    },
    labelInputField: {
        flex: 1,
        borderWidth: 1,
        borderRadius: Spacing.one,
        padding: Spacing.two,
        fontSize: 14,
    },
    addLabelButton: {
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
        backgroundColor: '#22c55e',
        borderRadius: Spacing.one,
    },
    addLabelText: {
        color: '#fff',
        fontWeight: '600',
    },
    labelsDisplay: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.one,
        marginTop: Spacing.one,
    },
    labelTag: {
        backgroundColor: '#FFE66D',
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
        borderRadius: Spacing.two,
    },
    labelTagText: {
        color: '#000',
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#22c55e',
        paddingVertical: Spacing.three,
        borderRadius: Spacing.two,
        alignItems: 'center',
        marginTop: Spacing.two,
        marginBottom: Spacing.three,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    categoryButton: {
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
    },
    categoryDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.one,
        minWidth: 120,
    },
    categoryName: {
        fontWeight: '600',
        fontSize: 12,
    },
    categoryPlaceholder: {
        fontSize: 12,
        color: '#999',
    },
    modalContainer: {
        flex: 1,
        paddingTop: Spacing.six,
        paddingHorizontal: Spacing.four,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.four,
    },
    closeButton: {
        color: '#007AFF',
        fontWeight: '600',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.three,
        justifyContent: 'flex-start',
    },
    categoryOption: {
        width: '30%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Spacing.two,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        gap: Spacing.one,
        padding: Spacing.two,
    },
    categoryOptionSelected: {
        borderColor: '#22c55e',
        borderWidth: 2,
    },
    categoryOptionName: {
        textAlign: 'center',
        fontSize: 11,
        fontWeight: '600',
    },
    dateButton: {
        flex: 1,
    },
    toastContainer: {
        position: 'absolute',
        bottom: 100,
        left: Spacing.three,
        right: Spacing.three,
        backgroundColor: '#22c55e',
        borderRadius: Spacing.two,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
