import { useState, useCallback } from 'react';

const useNotification = () => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'info', duration = 3000) => {
        setNotification({ message, type, duration });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return {
        notification,
        showNotification,
        hideNotification
    };
};

export default useNotification;
