import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from "./authSlice";
import eventsReducer from "./eventsSlice";
import filtersReducer from "./filtersSlice";
import organizationReducer from "./organizationSlice";
import notificationsReducer from "./notificationsSlice";
import { notificationsMiddleware } from "./notificationsMiddleware";

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'isAuthenticated', 'authChecked'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        organization: organizationReducer,
        events: eventsReducer,
        filters: filtersReducer,
        notifications: notificationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(notificationsMiddleware),
});

export const persistor = persistStore(store);
