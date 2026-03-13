import { SymbolView } from 'expo-symbols';
import { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    TextInput,
    Pressable,
    Modal,
    Platform,
    Animated,
    KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES } from '@/constants/categories';
import { database } from '@/database';
import type { Category, TransactionUI } from '@/schemas';

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editTransaction?: TransactionUI;
}

export const AddTransactionModal = ({
    visible,
    onClose,
    onSuccess,
    editTransaction,
}: AddTransactionModalProps) => {
    const theme = useTheme();
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
    const [isLoading, setIsLoading] = useState(false);

    // Populate form when editing a transaction
    useEffect(() => {
        if (editTransaction && visible) {
            const category = Object.values(CATEGORIES).find(
                (c) => c.name === editTransaction.category.name
            );
            setSelectedCategory(category || null);
            setAmount(Math.abs(editTransaction.amount).toString());
            setSelectedDate(new Date(editTransaction.date));
            setNote(editTransaction.note || '');
            setLabels(editTransaction.labels || []);
        } else if (!editTransaction && visible) {
            resetForm();
        }
    }, [editTransaction, visible]);

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

    const addLabel = () => {
        if (labelInput.trim() && !labels.includes(labelInput.trim())) {
            setLabels([...labels, labelInput.trim()]);
            setLabelInput('');
        }
    };

    const removeLabel = (label: string) => {
        setLabels(labels.filter((l) => l !== label));
    };

    const getDateString = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const resetForm = () => {
        setAmount('');
        setSelectedCategory(null);
        setSelectedDate(new Date());
        setNote('');
        setLabels([]);
        setLabelInput('');
    };

    const handleAddTransaction = async () => {
        // Validate required fields
        if (!amount.trim()) {
            showToastNotification('Please enter an amount');
            return;
        }

        if (!selectedCategory) {
            showToastNotification('Please select a category');
            return;
        }

        setIsLoading(true);
        try {
            // Parse amount to number
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount)) {
                showToastNotification('Please enter a valid amount');
                setIsLoading(false);
                return;
            }

            // Calculate final amount based on category type (negative for expenses)
            const finalAmount =
                selectedCategory.type === 'income' ? parsedAmount : -parsedAmount;

            if (editTransaction) {
                // Update existing transaction
                await database.updateTransaction(editTransaction.id, {
                    categoryId: selectedCategory.id,
                    amount: finalAmount,
                    date: selectedDate,
                    note: note || undefined,
                    labels: labels.length > 0 ? labels : undefined,
                });

                // Reset form
                resetForm();

                // Show success toast
                showToastNotification('Transaction updated! ✓', 1200);
                setTimeout(() => {
                    setIsLoading(false);
                    onClose();
                    onSuccess?.();
                }, 1200);
            } else {
                // Insert new transaction
                await database.insertTransaction({
                    categoryId: selectedCategory.id,
                    amount: finalAmount,
                    date: selectedDate,
                    note: note || undefined,
                    labels: labels.length > 0 ? labels : undefined,
                });

                // Reset form
                resetForm();

                // Show success toast
                showToastNotification('Transaction added! ✓', 1200);
                setTimeout(() => {
                    setIsLoading(false);
                    onClose();
                    onSuccess?.();
                }, 1200);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            showToastNotification('Failed to save transaction');
            setIsLoading(false);
        }
    };

    const handleDeleteTransaction = async () => {
        if (!editTransaction) return;

        setIsLoading(true);
        try {
            await database.deleteTransaction(editTransaction.id);

            // Reset form
            resetForm();

            // Show success toast
            showToastNotification('Transaction deleted! ✓', 1200);
            setTimeout(() => {
                setIsLoading(false);
                onClose();
                onSuccess?.();
            }, 1200);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showToastNotification('Failed to delete transaction');
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ThemedView style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <ThemedText type="subtitle" style={styles.headerTitle}>
                            {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
                        </ThemedText>
                        {editTransaction ? (
                            <Pressable
                                onPress={handleDeleteTransaction}
                                disabled={isLoading}
                                style={({ pressed }) => pressed && { opacity: 0.7 }}
                            >
                                <SymbolView
                                    name={{ ios: 'trash.fill', android: 'delete', web: 'delete' }}
                                    size={24}
                                    tintColor="#ef4444"
                                />
                            </Pressable>
                        ) : (
                            <Pressable onPress={onClose} style={({ pressed }) => pressed && { opacity: 0.7 }}>
                                <ThemedText style={styles.closeIcon}>✕</ThemedText>
                            </Pressable>
                        )}
                    </View>

                    {/* Form Content */}
                    <ScrollView
                        style={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContentContainer}
                    >
                        {/* Amount Section */}
                        <ThemedView type="backgroundElement" style={styles.section}>
                            <View style={styles.amountRow}>
                                <Pressable
                                    onPress={() => setShowCategoryPicker(true)}
                                    style={({ pressed }) => [
                                        styles.categoryButton,
                                        pressed && { opacity: 0.7 },
                                    ]}
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
                                                    name={{
                                                        ios: 'square.grid.2x2',
                                                        android: 'dashboard',
                                                        web: 'dashboard',
                                                    }}
                                                    size={32}
                                                    tintColor="#22c55e"
                                                />
                                                <ThemedText type="small" style={styles.categoryPlaceholder}>
                                                    Select Category
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
                                    editable={!isLoading}
                                />
                            </View>
                        </ThemedView>

                        {/* Category Picker Modal */}
                        <Modal
                            visible={showCategoryPicker}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setShowCategoryPicker(false)}
                        >
                            <View style={styles.categoryPickerOverlay}>
                                <Pressable
                                    style={styles.categoryPickerBackdrop}
                                    onPress={() => setShowCategoryPicker(false)}
                                />
                                <View style={[styles.categoryPickerSheet, { backgroundColor: theme.background }]}>
                                    <View style={styles.categorySheetHeader}>
                                        <ThemedText type="subtitle">Select Category</ThemedText>
                                        <Pressable onPress={() => setShowCategoryPicker(false)}>
                                            <ThemedText style={styles.categoryCloseButton}>Close</ThemedText>
                                        </Pressable>
                                    </View>
                                    <ScrollView
                                        style={styles.categoryScrollView}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.categoryGridContainer}
                                    >
                                        {Object.values(CATEGORIES).map((category) => (
                                            <Pressable
                                                key={category.name}
                                                onPress={() => {
                                                    setSelectedCategory(category);
                                                    setShowCategoryPicker(false);
                                                }}
                                                style={({ pressed }) => [
                                                    styles.categoryOption,
                                                    pressed && { opacity: 0.7 },
                                                ]}
                                            >
                                                <View
                                                    style={[
                                                        styles.categoryIconCircle,
                                                        selectedCategory?.name === category.name &&
                                                        styles.categoryIconCircleSelected,
                                                    ]}
                                                >
                                                    <SymbolView
                                                        name={category.icon}
                                                        size={32}
                                                        tintColor={category.color}
                                                    />
                                                </View>
                                                <ThemedText type="small" style={styles.categoryOptionName}>
                                                    {category.name}
                                                </ThemedText>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
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
                                            name={{
                                                ios: 'calendar',
                                                android: 'calendar_today',
                                                web: 'calendar_today',
                                            }}
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
                                    editable={!isLoading}
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
                                    style={[
                                        styles.labelInputField,
                                        { color: theme.text, borderColor: theme.textSecondary },
                                    ]}
                                    placeholder="Add a label"
                                    placeholderTextColor={theme.textSecondary}
                                    value={labelInput}
                                    onChangeText={setLabelInput}
                                    editable={!isLoading}
                                />
                                <Pressable
                                    style={({ pressed }) => [styles.addLabelButton, pressed && { opacity: 0.7 }]}
                                    onPress={addLabel}
                                    disabled={isLoading}
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
                                            disabled={isLoading}
                                        >
                                            <ThemedText type="small" style={styles.labelTagText}>
                                                {label} ✕
                                            </ThemedText>
                                        </Pressable>
                                    ))}
                                </View>
                            )}
                        </ThemedView>
                    </ScrollView>

                    {/* Add Button */}
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.addButton,
                                pressed && { opacity: 0.8 },
                                isLoading && { opacity: 0.6 },
                            ]}
                            onPress={handleAddTransaction}
                            disabled={isLoading}
                        >
                            <ThemedText type="small" style={styles.addButtonText}>
                                {isLoading ? (editTransaction ? 'Updating...' : 'Adding...') : (editTransaction ? 'Update Transaction' : 'Add Transaction')}
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [
                                styles.cancelButton,
                                pressed && { opacity: 0.8 },
                            ]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <ThemedText type="small" style={styles.cancelButtonText}>
                                Cancel
                            </ThemedText>
                        </Pressable>
                    </View>

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
                </ThemedView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        paddingTop: Spacing.two,
        paddingHorizontal: Spacing.four,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.two,
        paddingHorizontal: Spacing.one,
        marginBottom: Spacing.two,
    },
    headerTitle: {
        textAlign: 'center',
        flex: 1,
    },
    closeIcon: {
        fontSize: 24,
        fontWeight: '600',
        color: '#666',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: Spacing.three,
        gap: Spacing.three,
    },
    section: {
        padding: Spacing.three,
        borderRadius: Spacing.two,
        gap: Spacing.two,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e8e8e8',
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
        backgroundColor: '#f9f9f9',
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
        backgroundColor: '#f9f9f9',
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
    categoryPickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    categoryPickerBackdrop: {
        flex: 1,
    },
    categoryPickerSheet: {
        minHeight: '50%',
        borderTopLeftRadius: Spacing.three,
        borderTopRightRadius: Spacing.three,
        paddingHorizontal: Spacing.two,
        paddingTop: Spacing.three,
        paddingBottom: Spacing.three,
    },
    categorySheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.three,
        paddingBottom: Spacing.two,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    categoryCloseButton: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 14,
    },
    categoryScrollView: {
        flex: 1,
    },
    categoryGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.two,
        justifyContent: 'flex-start',
        paddingBottom: Spacing.three,
        paddingHorizontal: Spacing.one,
    },
    categoryOption: {
        width: '22%',
        alignItems: 'center',
        gap: Spacing.two,
    },
    categoryIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIconCircleSelected: {
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    categoryOptionName: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '600',
        marginTop: Spacing.one,
    },
    dateButton: {
        flex: 1,
    },
    buttonContainer: {
        gap: Spacing.two,
        paddingBottom: Spacing.three,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: Spacing.two,
    },
    addButton: {
        backgroundColor: '#22c55e',
        paddingVertical: Spacing.three,
        borderRadius: Spacing.two,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: Spacing.three,
        borderRadius: Spacing.two,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    toastContainer: {
        position: 'absolute',
        bottom: 80,
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
