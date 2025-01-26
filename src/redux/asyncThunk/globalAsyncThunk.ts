// Importing necessary methods from Redux Toolkit, Firebase, and date-fns-tz libraries
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection, // To refer to Firestore collections
  deleteDoc, // To delete documents from Firestore
  doc, // To refer to specific documents in Firestore
  getDocs, // To retrieve documents from Firestore
  updateDoc, // To update documents in Firestore
} from "firebase/firestore";
import { auth, db } from "../../firebase"; // Firebase database instance
import { signInWithEmailAndPassword } from "firebase/auth";

// Thunk to delete a video from Firestore
export const deleteVideo = createAsyncThunk(
  "global/deleteVideo", // Action type
  async (videoId: string, { rejectWithValue }) => {
    try {
      // Reference to the 'videos' document to be deleted
      const videoRef = doc(db, "videos", videoId);

      // Delete the video document from Firestore
      await deleteDoc(videoRef);

      // Reference to the 'history' collection to update relevant records
      const historyCollection = collection(db, "history");

      // Query the 'history' collection to find documents with the matching videoId
      const querySnapshot = await getDocs(historyCollection);
      const matchingDocs = querySnapshot.docs.filter(
        (doc) => doc.data().videoId === videoId // Check if videoId matches
      );

      // Loop through the matching documents and update their status to 'deleted'
      for (const docSnapshot of matchingDocs) {
        const historyRef = doc(db, "history", docSnapshot.id);
        // Update the status and add the deletedAt timestamp
        await updateDoc(historyRef, {
          status: "deleted", // Mark the status as 'deleted'
          deletedAt: new Date(), // Set the 'deletedAt' timestamp to the current date
        });
      }

      // Return the ID of the deleted video
      return videoId;
    } catch (error) {
      // If an error occurs, return a rejection with an error message
      return rejectWithValue("Failed to delete the video.");
    }
  }
);

export const getVideoHistory = createAsyncThunk<any[]>(
  "global/getVideoHistory", // Action type
  async () => {
    // Fetch all documents from the 'history' collection in Firestore
    const querySnapshot = await getDocs(collection(db, "history"));
    const history: any[] = []; // Array to store the video history and associated data

    // Iterate over each document in the querySnapshot
    querySnapshot.forEach((doc) => {
      const data = doc.data(); // Get the data of each document

      // Convert Firestore Timestamp to JavaScript Date for 'createdAt'
      if (data.createdAt && data.createdAt.seconds) {
        const createdAtDate = new Date(data.createdAt.seconds * 1000);
        data.createdAt = createdAtDate.toISOString(); // Convert to ISO string
      }

      // Convert Firestore Timestamp to JavaScript Date for 'deletedAt'
      if (data.deletedAt && data.deletedAt.seconds) {
        const deletedAtDate = new Date(data.deletedAt.seconds * 1000);
        data.deletedAt = deletedAtDate.toISOString(); // Convert to ISO string
      }

      // Convert 'lastUpdated' if it exists and is a Firestore Timestamp
      if (data.lastUpdated && data.lastUpdated.seconds) {
        const lastUpdatedDate = new Date(data.lastUpdated.seconds * 1000);
        data.lastUpdated = lastUpdatedDate.toISOString(); // Convert to ISO string
      }

      // Add the document's data along with its ID to the history array
      if (data.url) {
        history.push({ id: doc.id, ...data });
      }
    });

    // Return the populated array containing all the video history data
    return history;
  }
);

// Create an async thunk to fetch video URLs from Firestore
export const getVideoUrls = createAsyncThunk<any[]>(
  "global/getVideoUrls", // Action type
  async () => {
    // Fetch all documents from the 'videos' collection in Firestore
    const querySnapshot = await getDocs(collection(db, "videos"));
    const urls: any[] = []; // Array to store the video URLs and other data

    // Iterate over each document in the querySnapshot
    querySnapshot.forEach((doc) => {
      const data = doc.data(); // Get data of each document

      // Check if the 'createdAt' field exists and contains seconds
      if (data.createdAt && data.createdAt.seconds) {
        // Convert Firestore Timestamp to JavaScript Date
        const createdAtDate = new Date(data.createdAt.seconds * 1000);
        // Format the Date object to an ISO string format
        data.createdAt = createdAtDate.toISOString();
      }

      // Check if the 'url' field exists in the document
      if (data.url) {
        // Add the document's data along with its ID to the urls array
        urls.push({ id: doc.id, ...data });
      }
    });

    // Return the populated array containing all the video URLs and their associated data
    return urls;
  }
);

// Define the asyncThunk
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken(); // Retrieve the ID token
      return token; // Return the token instead of accessToken
    } catch (error: any) {
      return rejectWithValue(error.message); // Handle error
    }
  }
);
