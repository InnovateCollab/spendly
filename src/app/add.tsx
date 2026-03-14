import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { AddTransactionModal } from '@/components/modals/add-transaction-modal';

export default function Add() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // Show modal only when user navigates to this screen
            setShowModal(true);
            return () => {
                // Optional: hide modal when screen loses focus
                // setShowModal(false);
            };
        }, [])
    );

    const handleCloseModal = () => {
        // Close the modal first
        setShowModal(false);
        // Then navigate back
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push('/timeline');
        }
    };

    return (
        <AddTransactionModal
            visible={showModal}
            onClose={handleCloseModal}
        />
    );
}
