import {
  deleteVideo,
  getVideoHistory,
} from "../redux/asyncThunk/globalAsyncThunk";
import { updateLoadCount } from "../redux/asyncThunk/updateLoadCountAsyncThunk";

// Function to extract video ID from a YouTube URL
const extractVideoId = (url: string) => {
  // Regex pattern to match YouTube video IDs from various formats
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:[^/]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null; // Return the video ID if match is found, else null
};

// Function to transform timestamp fields (createdAt, deletedAt) into a readable date format
const transformTimestamps = (videos: any[]) => {
  return videos.map((video) => ({
    ...video,
    deletedAt: video.deletedAt
      ? new Date(video.deletedAt).toLocaleString("en-US", {
          // Format deletedAt timestamp
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : null, // Format and return deletedAt if present
    createdAt: video.createdAt
      ? new Date(video.createdAt).toLocaleString("en-US", {
          // Format createdAt timestamp
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : null, // Format and return createdAt if present
  }));
};

// Function to get the month name based on the month index (0-11)
const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return monthNames[monthIndex]; // Return the month name corresponding to the index
};

// Helper function to get the week number of the year from a Date object
const getWeekNumber = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 1); // Start of the year (January 1st)
  const diff = date.getTime() - start.getTime(); // Difference between current date and start of the year
  const oneDay = 1000 * 60 * 60 * 24; // One day in milliseconds
  const dayOfYear = Math.floor(diff / oneDay); // Calculate the day of the year
  return Math.ceil(dayOfYear / 7); // Calculate and return the week number
};

// Function to filter data where deleteLoad is greater than 0 and less than loadCount
async function filterMatchingData(array: any[]) {
  return array.filter(
    (item) =>
      Number(item.deleteLoad) > 0 &&
      Number(item.deleteLoad) < item.loadCount &&
      item.status === "added" // Check for status === 'added'
  );
}

// Function to dispatch the updateLoadCount action to the redux store and return the result
const fetchAndUpdateLoadCount = async (dispatch: any) => {
  try {
    const result = await dispatch(updateLoadCount()).unwrap(); // Dispatch the updateLoadCount action
    return result; // Return the result of the dispatch
  } catch (error) {
    console.error("Error updating load count:", error); // Log any error that occurs
    return { success: false }; // Return a failure response if error occurs
  }
};

// Function to fetch video URLs, filter them, and delete videos based on specific conditions
const fetchAndDeleteVideos = async (dispatch: any) => {
  try {
    const videoHistory = await dispatch(getVideoHistory()).unwrap();
    if (videoHistory.length > 0) {
      const array = await filterMatchingData(videoHistory); // Filter videos based on conditions
      if (array.length > 0) {
        array.forEach((item) => {
          dispatch(deleteVideo(item.videoId)); // Dispatch delete action for each matching video
        });
      }
    }
  } catch (error) {
    console.error("Error fetching video URLs:", error); // Log error if any
  }
};

// Function to fetch video history from the store
const fetchVideoHistory = async (dispatch: any) => {
  try {
    await dispatch(getVideoHistory()).unwrap(); // Fetch video history from the store
  } catch (error) {
    console.error("Error fetching video history:", error); // Log error if any
  }
};

const getLiveTime = (
  inputDate: Date = new Date()
): {
  year: number;
  month: number;
  week: number;
  day: number;
  hour: number;
  minute: number;
} => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const now = inputDate; // Use the provided date or current date if no argument is provided
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const dateParts = formatter.formatToParts(now);

  const time: {
    year: number;
    month: number;
    week: number;
    day: number;
    hour: number;
    minute: number;
  } = {
    year: 0,
    month: 0,
    week: 0,
    day: 0,
    hour: 0,
    minute: 0,
  };

  dateParts.forEach(({ type, value }) => {
    if (type === "year") time.year = parseInt(value, 10);
    if (type === "month") time.month = parseInt(value, 10);
    if (type === "day") time.day = parseInt(value, 10);
    if (type === "hour") time.hour = parseInt(value, 10);
    if (type === "minute") time.minute = parseInt(value, 10);
  });

  // Manually calculate the ISO week number
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (now.getTime() -
      firstDayOfYear.getTime() +
      (firstDayOfYear.getTimezoneOffset() - now.getTimezoneOffset()) *
        60 *
        1000) /
    86400000;
  time.week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

  return time;
};

// Export utility functions for use in other components
export {
  extractVideoId, // Extract YouTube video ID from URL
  transformTimestamps, // Transform timestamps into readable date formats
  filterMatchingData, // Filter data based on deleteLoad and loadCount conditions
  fetchVideoHistory, // Fetch video history from the store
  fetchAndDeleteVideos, // Fetch and delete videos based on conditions
  fetchAndUpdateLoadCount, // Fetch and update load count in the redux store
  getMonthName, // Get month name from month index
  getWeekNumber, // Get week number from a Date object
  getLiveTime,
};
