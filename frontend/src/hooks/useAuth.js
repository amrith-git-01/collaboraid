import { useSelector, useDispatch } from "react-redux";
import {
    login,
    register,
    logout,
    setUser,
} from '../store/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, isLoading, error, authChecked } = useSelector((state) => state.auth);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        authChecked,
        login: (credentials) => dispatch(login(credentials)),
        register: (credentials) => dispatch(register(credentials)),
        logout: () => dispatch(logout()),
        setUser: (user) => dispatch(setUser(user)),
    }
}

