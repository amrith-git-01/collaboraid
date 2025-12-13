import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { organizationService } from "../services/organizationService";

// Async thunks
export const fetchMyOrganization = createAsyncThunk(
    'organization/fetchMyOrganization',
    async (_, { rejectWithValue }) => {
        try {
            const data = await organizationService.getMyOrganization();
            return data;
        } catch (error) {
            if (error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            } else if (error.message) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('Failed to fetch organization. Please try again.');
            }
        }
    }
);

export const createOrganization = createAsyncThunk(
    'organization/createOrganization',
    async (organizationData, { rejectWithValue }) => {
        try {
            const data = await organizationService.createOrganization(organizationData);
            return data;
        } catch (error) {
            if (error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            } else if (error.message) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('Failed to create organization. Please try again.');
            }
        }
    }
);

export const updateOrganization = createAsyncThunk(
    'organization/updateOrganization',
    async ({ id, organizationData }, { rejectWithValue }) => {
        try {
            const data = await organizationService.updateOrganization(id, organizationData);
            return data;
        } catch (error) {
            if (error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            } else if (error.message) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('Failed to update organization. Please try again.');
            }
        }
    }
);

export const deleteOrganization = createAsyncThunk(
    'organization/deleteOrganization',
    async (id, { rejectWithValue }) => {
        try {
            await organizationService.deleteOrganization(id);
            return id;
        } catch (error) {
            if (error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            } else if (error.message) {
                return rejectWithValue(error.message);
            } else {
                return rejectWithValue('Failed to delete organization. Please try again.');
            }
        }
    }
);

const initialState = {
    organization: null,
    loading: false,
    error: null,
    hasOrganization: false,
};

const organizationSlice = createSlice({
    name: 'organization',
    initialState,
    reducers: {
        setOrganization: (state, action) => {
            state.organization = action.payload;
            state.hasOrganization = !!action.payload;
        },
        clearOrganization: (state) => {
            state.organization = null;
            state.hasOrganization = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch My Organization
            .addCase(fetchMyOrganization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyOrganization.fulfilled, (state, action) => {
                state.loading = false;
                state.organization = action.payload.data?.organization || null;
                state.hasOrganization = !!action.payload.data?.organization;
                state.error = null;
            })
            .addCase(fetchMyOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.organization = null;
                state.hasOrganization = false;
            })
            // Create Organization
            .addCase(createOrganization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrganization.fulfilled, (state, action) => {
                state.loading = false;
                state.organization = action.payload.data?.organization || null;
                state.hasOrganization = !!action.payload.data?.organization;
                state.error = null;
            })
            .addCase(createOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Organization
            .addCase(updateOrganization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrganization.fulfilled, (state, action) => {
                state.loading = false;
                state.organization = action.payload.data?.organization || null;
                state.hasOrganization = !!action.payload.data?.organization;
                state.error = null;
            })
            .addCase(updateOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Organization
            .addCase(deleteOrganization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteOrganization.fulfilled, (state) => {
                state.loading = false;
                state.organization = null;
                state.hasOrganization = false;
                state.error = null;
            })
            .addCase(deleteOrganization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setOrganization, clearOrganization, clearError } = organizationSlice.actions;
export default organizationSlice.reducer;
