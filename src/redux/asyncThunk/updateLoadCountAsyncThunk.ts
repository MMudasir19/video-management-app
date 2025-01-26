import { createAsyncThunk } from "@reduxjs/toolkit";
import { getLiveTime, getMonthName } from "../../utils/utils";
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";

export const updateLoadCount = createAsyncThunk(
  "global/updateLoadCount",
  async (_, { rejectWithValue }) => {
    try {
      // Get the current time in Israel using getLiveTime
      const liveTime = getLiveTime(new Date());
      const customDate = new Date(
        liveTime.year,
        liveTime.month - 1, // Months are 0-indexed in JavaScript Date
        liveTime.day,
        liveTime.hour,
        liveTime.minute
      );

      // Extract the year, month, and week number
      const monthName = getMonthName(liveTime.month - 1); // Convert index to month name

      // Fetch all videos from the Firestore "videos" collection
      const videosSnapshot = await getDocs(collection(db, "videos"));

      // Start a batch operation for efficient updates
      const batch = writeBatch(db);

      // Prepare a list of updates for later commit
      const batchOperations: {
        ref: DocumentReference<DocumentData, DocumentData>;
        data: { stats: any; loadCount: any; lastUpdated: Date };
      }[] = [];

      // Loop over videos and process stats updates in bulk
      for (const videoDoc of videosSnapshot.docs) {
        const videoId = videoDoc.id;

        // Query all history entries related to the current video
        const historyQuery = query(
          collection(db, "history"),
          where("videoId", "==", videoId)
        );
        const historySnapshot = await getDocs(historyQuery);

        // Iterate over each history entry and update the stats
        historySnapshot.docs.forEach(async (historyDoc) => {
          const historyRef = doc(db, "history", historyDoc.id);
          const historyData = historyDoc.data();
          const stats = historyData.stats || [];

          // Initialize year, month, week, day, and hour stats
          let yearStats = stats.find(
            (stat: { year: number }) => stat.year === liveTime.year
          );
          if (!yearStats) {
            yearStats = { year: liveTime.year, totalLoads: 0, months: [] };
            stats.push(yearStats);
          }

          let monthStats = yearStats.months.find(
            (month: { month: string }) => month.month === monthName
          );
          if (!monthStats) {
            monthStats = { month: monthName, totalLoads: 0, weeks: [] };
            yearStats.months.push(monthStats);
          }

          let weekStats = monthStats.weeks.find(
            (week: { weekNumber: number }) => week.weekNumber === liveTime.week
          );
          if (!weekStats) {
            weekStats = { weekNumber: liveTime.week, totalLoads: 0, days: [] };
            monthStats.weeks.push(weekStats);
          }

          let dayStats = weekStats.days.find(
            (day: { date: string }) =>
              day.date ===
              `${liveTime.year}-${String(liveTime.month).padStart(
                2,
                "0"
              )}-${String(liveTime.day).padStart(2, "0")}`
          );
          if (!dayStats) {
            dayStats = {
              date: `${liveTime.year}-${String(liveTime.month).padStart(
                2,
                "0"
              )}-${String(liveTime.day).padStart(2, "0")}`,
              totalLoads: 0,
              hours: [],
            };
            weekStats.days.push(dayStats);
          }

          let timeStats = dayStats.hours.find(
            (hourData: { hour: number }) => hourData.hour === liveTime.hour
          );
          if (!timeStats) {
            timeStats = {
              hour: liveTime.hour,
              totalLoads: 0,
            };
            dayStats.hours.push(timeStats);
          }

          // Increment load counts at all levels of stats
          timeStats.totalLoads++;
          dayStats.totalLoads++;
          weekStats.totalLoads++;
          monthStats.totalLoads++;
          yearStats.totalLoads++;

          // Increment load count for history document
          const newLoadCount = (historyData.loadCount || 0) + 1;

          // Prepare batch operation update
          batchOperations.push({
            ref: historyRef,
            data: {
              stats,
              loadCount: newLoadCount,
              lastUpdated: customDate,
            },
          });

          // Check batch size and commit if necessary (Firestore batch limit of 500)
          if (batchOperations.length === 500) {
            batchOperations.forEach(({ ref, data }) => batch.update(ref, data));
            await batch.commit(); // Commit the current batch
            batchOperations.length = 0; // Reset the batch
          }
        });
      }

      // Final batch commit if there are remaining operations
      if (batchOperations.length > 0) {
        batchOperations.forEach(({ ref, data }) => batch.update(ref, data));
        await batch.commit();
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating load counts and stats:", error);
      return rejectWithValue("Failed to update load counts and stats.");
    }
  }
);
