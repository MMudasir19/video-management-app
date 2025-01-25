// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"; // Importing necessary utilities from Redux Toolkit
import { loginUser } from "../asyncThunk/globalAsyncThunk"; // Importing asyncThunk actions

// Define the shape of the global state in the application
interface UserState {
  user: any;
  loading: boolean;
  showModal: boolean; // Flag to show/hide modal
  password: { email: string; password: string }; // Store password for validation
  userError: string; // Store error messages
}

const initialState: UserState = {
  user: "",
  loading: false,
  showModal: false,
  password: { email: "", password: "" },
  userError: "",
};

// Define the global slice with actions and reducers
const userSlice = createSlice({
  name: "global", // Name of the slice
  initialState, // Initial state of the slice
  reducers: {
    setPassword: (state, action: PayloadAction<any>) => {
      state.password = action.payload; // Set the password in the state
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload; // Set the password in the state
    },
    setUserError: (state, action: PayloadAction<string>) => {
      state.userError = action.payload; // Set error message in the state
    },
    setShowModal: (state, action: PayloadAction<boolean>) => {
      state.showModal = action.payload; // Toggle showModal flag in the state
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload; // Set error message in the state
    },
    clearUserState: (state) => {
      // Clear the state (reset all properties to their initial values)
      state.password = { email: "", password: "" };
      state.userError = "";
      state.loading = false;
      state.showModal = false;
    },
  },
  extraReducers: (builder) => {
    builder
      //loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.userError = ""; // Reset any previous errors
      })
      .addCase(loginUser.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload; // Set the user data
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.userError = action.payload as string; // Set the error message
      });
  },
});

// Exporting the actions for use in components or elsewhere in the app
export const {
  setPassword,
  setUserError,
  setUser,
  clearUserState,
  setLoading,
  setShowModal,
} = userSlice.actions;

// Exporting the reducer to be used in the Redux store
export default userSlice.reducer;
