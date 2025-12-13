import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export const useToastNavigation = () => {
    const navigate = useNavigate();
    const { isAnyToastVisible, showToast } = useToast();

    const navigateWithToastCheck = useCallback((path, options = {}) => {
        if (isAnyToastVisible()) {
            showToast('Please wait for the current action to complete', 'warning');
            return false; // Navigation blocked
        }

        navigate(path, options);
        return true; // Navigation allowed
    }, [navigate, isAnyToastVisible, showToast]);

    const navigateIfNoToast = useCallback((path, options = {}) => {
        return navigateWithToastCheck(path, options);
    }, [navigateWithToastCheck]);

    return {
        navigateIfNoToast,
        canNavigate: !isAnyToastVisible(),
    };
};