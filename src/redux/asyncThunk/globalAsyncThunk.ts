// Importing necessary methods from Redux Toolkit, Firebase, and date-fns-tz libraries
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addDoc, // To add new documents to Firestore collections
  collection, // To refer to Firestore collections
  deleteDoc, // To delete documents from Firestore
  doc, // To refer to specific documents in Firestore
  getDocs, // To retrieve documents from Firestore
  query, // To query Firestore collections based on conditions
  updateDoc, // To update documents in Firestore
  where, // To add query conditions to Firestore queries
  writeBatch, // To perform batch write operations in Firestore
} from "firebase/firestore";
import { db } from "../../firebase"; // Firebase database instance
import { getMonthName, getWeekNumber } from "../../utils/utils"; // Utility functions for month name and week number
import { toZonedTime } from "date-fns-tz"; // Correct method to convert UTC to a specific time zone
import { format } from "date-fns"; // Function to format dates

export const updateLoadCount = createAsyncThunk(
  "global/updateLoadCount",
  async (_, { rejectWithValue }) => {
    try {
      // Step 1: Get current date and time in Israel timezone
      const now = new Date();

      // Convert the current date to Israel timezone using date-fns-tz library
      const israelTime = toZonedTime(now, "Asia/Jerusalem");

      // Get the current timestamp in Israel timezone
      const utcTimestamp = israelTime.getTime();

      // Extract the year, month, week number, and date in Israel timezone
      const year = israelTime.getUTCFullYear();
      const monthIndex = israelTime.getUTCMonth();
      const monthName = getMonthName(monthIndex); // Convert index to month name
      const weekNumber = getWeekNumber(israelTime); // Get the current week number
      const date = israelTime.toISOString().split("T")[0]; // Format date as YYYY-MM-DD in Israel time
      const hour = israelTime.getUTCHours(); // Extract the hour in UTC

      // Step 2: Fetch all videos from the Firestore "videos" collection
      const videosSnapshot = await getDocs(collection(db, "videos"));

      // Step 3: Start a batch operation for efficient updates
      const batch = writeBatch(db);

      // Step 4: Iterate over each video in the collection
      for (const videoDoc of videosSnapshot.docs) {
        const videoId = videoDoc.id;

        // Query all history entries related to the current video
        const historyQuery = query(
          collection(db, "history"),
          where("videoId", "==", videoId)
        );
        const historySnapshot = await getDocs(historyQuery);

        // Step 5: Iterate over each history entry for the current video
        for (const historyDoc of historySnapshot.docs) {
          const historyRef = doc(db, "history", historyDoc.id);
          const historyData = historyDoc.data();

          // If the history data is not found, skip the update
          if (!historyData) continue;

          // Step 6: Initialize or update the stats hierarchy for the current video
          const stats = historyData.stats || [];

          // Find or create the year stats object
          let yearStats = stats.find(
            (stat: { year: number }) => stat.year === year
          );
          if (!yearStats) {
            yearStats = { year, totalLoads: 0, months: [] };
            stats.push(yearStats); // Add new year stats if not found
          }

          // Find or create the month stats for the current year
          let monthStats = yearStats.months.find(
            (month: { month: string }) => month.month === monthName
          );
          if (!monthStats) {
            monthStats = { month: monthName, totalLoads: 0, weeks: [] };
            yearStats.months.push(monthStats); // Add new month stats if not found
          }

          // Find or create the week stats for the current month
          let weekStats = monthStats.weeks.find(
            (week: { weekNumber: number }) => week.weekNumber === weekNumber
          );
          if (!weekStats) {
            weekStats = { weekNumber, totalLoads: 0, days: [] };
            monthStats.weeks.push(weekStats); // Add new week stats if not found
          }

          // Find or create the day stats for the current week
          let dayStats = weekStats.days.find(
            (day: { date: string }) => day.date === date
          );
          if (!dayStats) {
            dayStats = { date, totalLoads: 0, hours: [] };
            weekStats.days.push(dayStats); // Add new day stats if not found
          }

          // Find or create the hour stats for the current day
          let hourStats = dayStats.hours.find(
            (hourData: { hour: number }) => hourData.hour === hour
          );
          if (!hourStats) {
            hourStats = { hour: hour, totalLoads: 0 };
            dayStats.hours.push(hourStats); // Add new hour stats if not found
          }

          // Step 7: Increment load counts at all levels of stats
          hourStats.totalLoads++;
          dayStats.totalLoads++;
          weekStats.totalLoads++;
          monthStats.totalLoads++;
          yearStats.totalLoads++;

          // Step 8: Update the history document with new stats and load count
          batch.update(historyRef, {
            stats,
            loadCount: (historyData.loadCount || 0) + 1, // Increment the total load count
            lastUpdated: utcTimestamp, // Update the timestamp of the last update
          });
        }
      }

      // Step 9: Commit the batch operation to Firestore
      await batch.commit();

      // Step 10: Return success status
      return { success: true };
    } catch (error) {
      // Step 11: Handle any errors during the process
      console.error("Error updating load counts and stats:", error);
      return rejectWithValue("Failed to update load counts and stats.");
    }
  }
);

// Thunk to add a new video and update related history in Firestore
export const addVideo = createAsyncThunk(
  "global/addVideo", // Action type
  async (newUrl: { url: string; deleteLoad: string }, { rejectWithValue }) => {
    try {
      // Validate inputs: Ensure URL is provided
      if (!newUrl.url) {
        throw new Error("Video URL is required.");
      }

      // Get the current date and time in Israel timezone (Asia/Jerusalem)
      const israelTime = toZonedTime(new Date(), "Asia/Jerusalem");

      // Check if the timezone conversion resulted in a valid date
      if (isNaN(israelTime.getTime())) {
        throw new Error("Invalid date created for timezone.");
      }

      // Add the new video document to the 'videos' collection in Firestore
      const docRef = await addDoc(collection(db, "videos"), {
        url: newUrl.url, // Store the video URL
        deleteLoad: newUrl.deleteLoad ? Number(newUrl.deleteLoad) : null, // Store the delete load if provided
        createdAt: israelTime, // Store the video creation time in Israel timezone
      });

      // Update the document with its auto-generated ID
      await updateDoc(doc(db, "videos", docRef.id), { id: docRef.id });

      // Prepare stats for the video in a structured format
      const utcTimestamp = israelTime.getTime(); // Convert Israel time to UTC timestamp
      const year = israelTime.getUTCFullYear();
      const monthIndex = israelTime.getUTCMonth();
      const monthName = getMonthName(monthIndex); // Get the name of the month
      const weekNumber = getWeekNumber(israelTime); // Get the week number of the year
      const date = format(israelTime, "yyyy-MM-dd"); // Format the date to YYYY-MM-DD
      const hour = israelTime.getUTCHours(); // Get the current hour in UTC

      // Create the initial stats structure for the video
      const newStats = {
        year: {
          year,
          totalLoads: 0, // Initialize total loads for the year
          months: [
            {
              month: monthName, // Store the month name
              totalLoads: 0, // Initialize total loads for the month
              weeks: [
                {
                  weekNumber, // Store the week number
                  totalLoads: 0, // Initialize total loads for the week
                  days: [
                    {
                      date, // Store the date
                      totalLoads: 0, // Initialize total loads for the day
                      hours: [
                        {
                          hour, // Store the hour
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

      // Prepare the history document with stats and other details
      const historyDoc = {
        url: newUrl.url,
        deleteLoad: newUrl.deleteLoad ? Number(newUrl.deleteLoad) : null, // Store delete load if provided
        createdAt: israelTime, // Store video creation time
        status: "added", // Mark the video as 'added' in history
        loadCount: 0, // Initialize load count
        videoId: docRef.id, // Store the video ID
        stats: [newStats.year], // Include the stats for the year
        lastUpdated: utcTimestamp, // Store the UTC timestamp for the last update
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

// Create an async thunk to fetch video history from Firestore
export const getVideoHistory = createAsyncThunk<any[]>(
  "global/getVideoHistory", // Action type
  async () => {
    // Fetch all documents from the 'history' collection in Firestore
    const querySnapshot = await getDocs(collection(db, "history"));
    const history: any[] = []; // Array to store the video history and associated data

    // Iterate over each document in the querySnapshot
    querySnapshot.forEach((doc) => {
      const data = doc.data(); // Get the data of each document

      // Check if the 'createdAt' field exists and contains seconds
      if (data.createdAt && data.createdAt.seconds) {
        // Convert Firestore Timestamp to JavaScript Date
        const createdAtDate = new Date(data.createdAt.seconds * 1000);
        // Format the Date object to an ISO string format
        data.createdAt = createdAtDate.toISOString();
      }

      // Check if the 'deletedAt' field exists and contains seconds
      if (data.deletedAt && data.deletedAt.seconds) {
        // Convert Firestore Timestamp to JavaScript Date
        const deletedAtDate = new Date(data.deletedAt.seconds * 1000);
        // Format the Date object to an ISO string format
        data.deletedAt = deletedAtDate.toISOString();
      }

      // Check if the 'url' field exists in the document
      if (data.url) {
        // Add the document's data along with its ID to the history array
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
