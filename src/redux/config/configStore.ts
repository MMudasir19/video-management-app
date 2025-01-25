import { configureStore } from "@reduxjs/toolkit"; // Import configureStore to configure the Redux store
import globalReducer from "../slice/global"; // Import the global slice reducer
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"; // Import necessary hooks from react-redux

// Configure the Redux store
export const store = configureStore({
  reducer: {
    global: globalReducer, // Add your global slice reducer to the store
  },
});

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
