import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/config/configStore";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/VideoStats.css";
import Navbar from "./Navbar";
import Loading from "./Loading";
import { setLoading } from "../redux/slice/global";
import { fetchVideoHistory } from "../utils/utils";

const VideoStats: React.FC = () => {
    // Extract the video ID from the URL parameters
    const { id } = useParams();
    const navigate = useNavigate()

    // Get video history and loading state from the global store
    const { videoHistory, loading } = useAppSelector((state) => state.global);

    // Dispatch to manage actions
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Set loading state to true before data fetch
        dispatch(setLoading(true));

        // Fetch video history data
        const getData = async () => {
            await fetchVideoHistory(dispatch); // Fetch video history and dispatch actions
            dispatch(setLoading(false)); // Set loading to false after fetching data
        };
        getData(); // Call the async function to fetch data
    }, [dispatch]); // Re-run effect if dispatch changes

    // Find the video history item that matches the current video ID
    const historyItem = videoHistory.find(
        (historyItem: { videoId: string }) => historyItem.videoId === id
    );

    // Extract stats for the video, if available
    const stats = historyItem?.stats || [];

    // Show loading spinner if data is still being fetched
    if (loading) {
        return <Loading />;
    }

    return (
        <>
            {/* Render the Navbar component */}
            <Navbar />
            <div className="main" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <button onClick={() => navigate("/admin")}>Go Back</button>
            </div>
            {/* Main container for stats */}
            <div className="stats-container">
                {/* Check if stats are available */}
                {stats.length > 0 ? (
                    // Iterate over each year in the stats
                    stats.map((yearStat: any) => (
                        <div className="year" key={yearStat.year}>
                            <div className="year-header">
                                <h2 className="year-title">Year: {yearStat.year}</h2>
                                <p className="total-loads">Total Loads: {yearStat.totalLoads}</p>
                            </div>
                            {/* Container for months */}
                            <div className="months-container">
                                {/* Iterate over each month */}
                                {yearStat.months.map((month: any) => (
                                    <div className="month" key={month.month}>
                                        <h3 className="month-title">{month.month}</h3>
                                        <p className="month-total">Total Loads: {month.totalLoads}</p>
                                        {/* Container for weeks */}
                                        <div className="weeks-container">
                                            {/* Iterate over each week */}
                                            {month.weeks.map((week: any) => (
                                                <div className="week" key={week.weekNumber}>
                                                    <h4 className="week-title">Week {week.weekNumber}</h4>
                                                    <p className="month-total">Total Loads: {week.totalLoads}</p>
                                                    {/* Container for days */}
                                                    <div className="days-container">
                                                        {/* Iterate over each day */}
                                                        {week.days.map((day: any) => (
                                                            <div className="day" key={day.date}>
                                                                <h5 className="day-title">{day.date}</h5>
                                                                {/* List hours for the day */}
                                                                <ul className="hours-list">
                                                                    {day.hours.map((hour: any) => (
                                                                        <li key={hour.hour}>
                                                                            {hour.hour}:00 — {hour.totalLoads} loads
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No stats available for this video.</p> // Message when no stats are found
                )}
            </div>
        </>
    );
};

export default VideoStats;
