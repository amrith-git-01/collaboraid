import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/authService";
import { tokenStorage } from "../utils/tokenStorage";
import { authStorage } from "../utils/authStorage";

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const data = await authService.login(credentials);
        return data;
    }
    catch (error) {
        if (error.response?.data?.message) {
            return rejectWithValue(error.response.data.message);
        }
        else if (error.message) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue('Login failed. Please try again.');
        }
    }
});

export const register = createAsyncThunk('auth/register', async (credentials, { rejectWithValue }) => {
    try {
        const data = await authService.register(credentials);
        return data;
    }
    catch (error) {
        if (error.response?.data?.message) {
            return rejectWithValue(error.response.data.message);
        }
        else if (error.message) {
            return rejectWithValue(error.message);
        }
        else {
            return rejectWithValue('Signup failed. Please try again.');
        }
    }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        const data = await authService.logout();
        // Ensure token is removed even if API call fails
        tokenStorage.removeToken();
        return data;
    }
    catch (error) {
        // Even if logout fails, we still want to clear local state
        tokenStorage.removeToken();
        return { success: true };
    }
});

// Initialize state with token check
const getInitialState = () => {
    const hasToken = tokenStorage.hasToken();
    const storedUser = authStorage.getUser();
    return {
        user: storedUser,
        isAuthenticated: !!(hasToken && storedUser),
    isLoading: false,
    error: null,
        authChecked: !hasToken, // If no token, auth is already checked
    };
};

const initialState = getInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthState: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            // Clear token from storage
            tokenStorage.removeToken();
            authStorage.removeUser();
        },
        setUser: (state, action) => {
            // Only update if user data actually changed
            if (JSON.stringify(state.user) !== JSON.stringify(action.payload)) {
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
                state.authChecked = true;
                // Persist user for reloads
                if (action.payload) {
                    authStorage.setUser(action.payload);
                } else {
                    authStorage.removeUser();
                }
            }
        },
        markAuthChecked: (state) => {
            state.authChecked = true;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                state.authChecked = true; // Mark auth check as complete
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                // Ensure user and isAuthenticated remain false
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                state.authChecked = true; // Mark auth check as complete
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
                state.authChecked = true; // Mark auth check as complete
                // Token is already removed in logout thunk
            })
            .addCase(logout.rejected, (state) => {
                // Even if logout fails, clear state
                state.user = null;
                state.isAuthenticated = false;
                state.error = null;
                state.authChecked = true;
                tokenStorage.removeToken();
                authStorage.removeUser();
            })
            // Handle rehydration from persistence
            .addMatcher(
                (action) => action.type === 'persist/REHYDRATE',
                (state) => {
                    // If we have persisted user data, mark auth as checked
                    if (state.user) {
                        state.authChecked = true;
                    } else {
                        // If no persisted user, still mark auth as checked
                        state.authChecked = true;
                    }
                }
            )
    }
});

export const { clearAuthState, setUser, markAuthChecked } = authSlice.actions;
export default authSlice.reducer;