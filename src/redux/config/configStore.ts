import { configureStore } from "@reduxjs/toolkit"; // Import configureStore to configure the Redux store
import globalReducer from "../slice/global"; // Import the global slice reducer
import userReducer from "../slice/user";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"; // Import necessary hooks from react-redux
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist"; // Import redux-persist
import storage from "redux-persist/lib/storage"; // Import local storage as the default storage engine

// Persist configuration
const persistConfig = {
  key: "root", // Key for the root reducer
  storage, // Use local storage to persist the state
};

// Wrap the global reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, userReducer);

// Configure the Redux store
export const store = configureStore({
  reducer: {
    global: globalReducer, // Add your persisted global reducer to the store
    user: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER], // Ignore these actions for serializable state check
      },
    }),
});

// Create the persistor
export const persistor = persistStore(store);

// Define types for the root state and app dispatch
// RootState type is inferred by using store.getState to get the state structure
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch type is inferred from store.dispatch
export type AppDispatch = typeof store.dispatch;

// Create and export custom hooks for dispatch and selector
// useAppDispatch is a wrapper around useDispatch to give it the correct AppDispatch type
export const useAppDispatch: () => AppDispatch = useDispatch;
// useAppSelector is a wrapper around useSelector to give it the correct RootState type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
