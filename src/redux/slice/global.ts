// globalSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"; // Importing necessary utilities from Redux Toolkit
import {
  addVideo,
  deleteVideo,
  getVideoHistory,
  getVideoUrls,
} from "../asyncThunk/globalAsyncThunk"; // Importing asyncThunk actions

// Define the shape of the global state in the application
interface GlobalState {
  password: string; // Store password for validation
  error: string; // Store error messages
  showModal: boolean; // Flag to show/hide modal
  selectedVideo: any; // Store the selected video object
  videoUrls?: any; // Store video URLs
  videoHistory?: any; // Store video history
  loading: boolean; // Flag to indicate loading state
  newUrl: { url: string; deleteLoad: string }; // New URL object containing URL and delete load data
}

const initialState: GlobalState = {
  password: "",
  error: "",
  showModal: false,
  selectedVideo: null,
  videoUrls: [], // Initially empty array for video URLs
  loading: false, // Initially not loading
  newUrl: { url: "", deleteLoad: "" }, // Initialize newUrl with empty string
  videoHistory: [], // Initially empty array for video history
};

// Define the global slice with actions and reducers
const globalSlice = createSlice({
  name: "global", // Name of the slice
  initialState, // Initial state of the slice
  reducers: {
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload; // Set the password in the state
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload; // Set error message in the state
    },
    setNewUrl: (state, action: PayloadAction<any>) => {
      state.newUrl = action.payload; // Update newUrl in the state
    },
    setShowModal: (state, action: PayloadAction<boolean>) => {
      state.showModal = action.payload; // Toggle showModal flag in the state
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload; // Toggle loading state
    },
    setSelectedVideo: (state, action: PayloadAction<any>) => {
      state.selectedVideo = action.payload; // Set selected video in the state
    },
    setVideoUrls: (state, action: PayloadAction<any>) => {
      state.videoUrls = action.payload; // Update videoUrls in the state
    },
    setVideoHistory: (state, action: PayloadAction<any>) => {
      state.videoHistory = action.payload; // Update videoHistory in the state
    },
    clearState: (state) => {
      // Clear the state (reset all properties to their initial values)
      state.password = "";
      state.error = "";
      state.showModal = false;
      state.selectedVideo = null;
      state.loading = false;
      state.newUrl = { url: "", deleteLoad: "" };
    },
    validatePassword: (state, action: PayloadAction<string>) => {
      // Validate password against the environment variable
      if (action.payload === import.meta.env.VITE_PASSWORD) {
        state.error = "";
        state.showModal = false;
        state.password = "";
      } else {
        state.error = "Invalid password"; // Set error if password is incorrect
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling getVideoUrls action (Fetching video URLs)
      .addCase(getVideoUrls.pending, (state) => {
        state.loading = true; // Set loading to true when the request is pending
      })
      .addCase(getVideoUrls.fulfilled, (state, action) => {
        state.loading = false; // Set loading to false once the request is fulfilled
        state.videoUrls = action.payload; // Update videoUrls with fetched data
      })
      .addCase(getVideoUrls.rejected, (state, action) => {
        state.loading = false; // Set loading to false if the request fails
        state.error = action.error.message || "Failed to fetch video URLs"; // Set error message
      })
      // Handling getVideoHistory action (Fetching video history)
      .addCase(getVideoHistory.pending, (state) => {
        state.loading = true; // Set loading to true when the request is pending
      })
      .addCase(getVideoHistory.fulfilled, (state, action) => {
        state.loading = false; // Set loading to false once the request is fulfilled
        state.videoHistory = action.payload; // Update videoHistory with fetched data
      })
      .addCase(getVideoHistory.rejected, (state, action) => {
        state.loading = false; // Set loading to false if the request fails
        state.error = action.error.message || "Failed to fetch video history"; // Set error message
      })
      // Handling addVideo action (Adding new video)
      .addCase(addVideo.fulfilled, (state, action) => {
        state.videoUrls = action.payload.updatedUrls; // Update video URLs with the response
        state.videoHistory = action.payload.updatedHistory; // Update video history with the response
        state.newUrl = { url: "", deleteLoad: "" }; // Reset newUrl
        state.error = ""; // Clear error on successful addition
      })
      .addCase(addVideo.rejected, (state) => {
        state.error = "something went wrong!"; // Set error message if adding video fails
      })
      // Handling deleteVideo action (Deleting a video)
      .addCase(deleteVideo.fulfilled, (state, action) => {
        // Remove the deleted video from the local state by filtering the videoUrls array
        state.videoUrls = state.videoUrls.filter(
          (video: any) => video.id !== action.payload
        );
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        // Set error message if deleting video fails
        state.error = action.payload as string;
      });
  },
});

// Exporting the actions for use in components or elsewhere in the app
export const {
  setPassword,
  setError,
  setShowModal,
  setSelectedVideo,
  validatePassword,
  clearState,
  setVideoUrls,
  setNewUrl,
  setLoading,
} = globalSlice.actions;

// Exporting the reducer to be used in the Redux store
export default globalSlice.reducer;
