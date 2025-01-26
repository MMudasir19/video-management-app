import { createAsyncThunk } from "@reduxjs/toolkit";
import { getLiveTime, getMonthName } from "../../utils/utils";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export const addVideo = createAsyncThunk(
  "global/addVideo", // Action type
  async (newUrl: { url: string; deleteLoad: string }, { rejectWithValue }) => {
    try {
      // Validate inputs: Ensure URL is provided
      if (!newUrl.url) {
        throw new Error("Video URL is required.");
      }

      // Get the current time in Israel using getLiveTime
      const liveTime = getLiveTime(new Date()); // Pass current date
      const customDate = new Date(
        liveTime.year,
        liveTime.month - 1, // Months are 0-indexed in JavaScript Date
        liveTime.day,
        liveTime.hour,
        liveTime.minute
      );

      // Prepare stats for the video in a structured format
      const newStats = {
        year: {
          year: liveTime.year,
          totalLoads: 0, // Initialize total loads for the year
          months: [
            {
              month: getMonthName(liveTime.month - 1), // Use liveTime.month - 1 for correct month name
              totalLoads: 0, // Initialize total loads for the month
              weeks: [
                {
                  weekNumber: liveTime.week, // Store the week number
                  totalLoads: 0, // Initialize total loads for the week
                  days: [
                    {
                      date: `${liveTime.year}-${String(liveTime.month).padStart(
                        2,
                        "0"
                      )}-${String(liveTime.day).padStart(2, "0")}`,
                      totalLoads: 0, // Initialize total loads for the day
                      hours: [
                        {
                          hour: liveTime.hour, // Store the hour
                          totalLoads: 0, // Initialize total loads for the hour
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      // Add the new video document to the 'videos' collection in Firestore
      const docRef = await addDoc(collection(db, "videos"), {
        url: newUrl.url, // Store the video URL
        deleteLoad: newUrl.deleteLoad ? Number(newUrl.deleteLoad) : null, // Store the delete load if provided
        createdAt: customDate, // Store the video creation time in Israel timezone
      });

      // Update the document with its auto-generated ID
      await updateDoc(doc(db, "videos", docRef.id), { id: docRef.id });

      // Prepare the history document with stats and other details

      const historyDoc = {
        url: newUrl.url,
        deleteLoad: newUrl.deleteLoad ? Number(newUrl.deleteLoad) : null, // Store delete load if provided
        createdAt: customDate, // Store video creation time
        status: "added", // Mark the video as 'added' in history
        loadCount: 0, // Initialize load count
        videoId: docRef.id, // Store the video ID
        stats: [newStats.year], // Include the stats for the year
        lastUpdated: customDate, // Store the custom timestamp for the last update
      };

      // Add the history document to the 'history' collection in Firestore
      const historyRef = await addDoc(collection(db, "history"), historyDoc);
      // Update the history document with its auto-generated ID
      await updateDoc(doc(db, "history", historyRef.id), { id: historyRef.id });

      // Fetch the updated list of videos and history from Firestore
      const [videoSnapshot, historySnapshot] = await Promise.all([
        getDocs(collection(db, "videos")),
        getDocs(collection(db, "history")),
      ]);

      // Map over the videos and update the 'createdAt' field
      const updatedUrls = videoSnapshot.docs.map((doc) => {
        const data = doc.data();

        // Handle createdAt field if it's present
        if (data.createdAt) {
          let createdAtDate;
          // If createdAt is a Firestore Timestamp, convert it to a Date object
          if (data.createdAt.seconds) {
            createdAtDate = data.createdAt.toDate();
          } else {
            createdAtDate = new Date(data.createdAt); // If it's a regular Date string, use it
          }

          // Check if the createdAt field is a valid date
          if (!isNaN(createdAtDate.getTime())) {
            data.createdAt = createdAtDate.toISOString(); // Convert to ISO string
          } else {
            console.error("Invalid date format for createdAt:", data.createdAt);
            data.createdAt = new Date().toISOString(); // Fallback to current date if invalid
          }
        }
        if (data.lastUpdated) {
          let lastUpdatedDate;
          // If createdAt is a Firestore Timestamp, convert it to a Date object
          if (data.lastUpdated.seconds) {
            lastUpdatedDate = data.lastUpdated.toDate();
          } else {
            lastUpdatedDate = new Date(data.lastUpdated); // If it's a regular Date string, use it
          }

          // Check if the createdAt field is a valid date
          if (!isNaN(lastUpdatedDate.getTime())) {
            data.lastUpdated = lastUpdatedDate.toISOString(); // Convert to ISO string
          } else {
            console.error(
              "Invalid date format for lastUpdatedDate:",
              data.lastUpdatedDate
            );
            data.lastUpdated = new Date().toISOString(); // Fallback to current date if invalid
          }
        }

        return data;
      });

      // Map over the history and update the 'createdAt' and 'deletedAt' fields
      const updatedHistory = historySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Handle createdAt field if it's present
        if (data.createdAt) {
          let createdAtDate;
          if (data.createdAt.seconds) {
            createdAtDate = data.createdAt.toDate();
          } else {
            createdAtDate = new Date(data.createdAt);
          }

          if (!isNaN(createdAtDate.getTime())) {
            data.createdAt = createdAtDate.toISOString();
          } else {
            console.error("Invalid date format for createdAt:", data.createdAt);
            data.createdAt = new Date().toISOString();
          }
        }

        // Handle deletedAt field if it's present
        if (data.deletedAt) {
          let deletedAtDate;
          if (data.deletedAt.seconds) {
            deletedAtDate = data.deletedAt.toDate();
          } else {
            deletedAtDate = new Date(data.deletedAt);
          }

          if (!isNaN(deletedAtDate.getTime())) {
            data.deletedAt = deletedAtDate.toISOString();
          } else {
            console.error("Invalid date format for deletedAt:", data.deletedAt);
            data.deletedAt = new Date().toISOString();
          }
        }

        if (data.lastUpdated) {
          let lastUpdatedDate;
          // If createdAt is a Firestore Timestamp, convert it to a Date object
          if (data.lastUpdated.seconds) {
            lastUpdatedDate = data.lastUpdated.toDate();
          } else {
            lastUpdatedDate = new Date(data.lastUpdated); // If it's a regular Date string, use it
          }

          // Check if the createdAt field is a valid date
          if (!isNaN(lastUpdatedDate.getTime())) {
            data.lastUpdated = lastUpdatedDate.toISOString(); // Convert to ISO string
          } else {
            console.error(
              "Invalid date format for lastUpdatedDate:",
              data.lastUpdatedDate
            );
            data.lastUpdated = new Date().toISOString(); // Fallback to current date if invalid
          }
        }

        return data;
      });

      // Return the updated lists of video URLs and history
      return { updatedUrls, updatedHistory };
    } catch (error) {
      // Log error and return a rejection message if any error occurs
      console.error("Error adding video:", error);
      return rejectWithValue("Failed to add the video and update history.");
    }
  }
);
