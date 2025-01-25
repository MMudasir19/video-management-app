import React, { useEffect } from "react";
import "../App.css";
import Navbar from "./Navbar";
import { useAppDispatch, useAppSelector } from "../redux/config/configStore";
import { setLoading } from "../redux/slice/global";
import { extractVideoId, fetchAndDeleteVideos, fetchAndUpdateLoadCount, fetchVideoHistory } from "../utils/utils";
import Loading from "./Loading";
import { getVideoUrls } from "../redux/asyncThunk/globalAsyncThunk";

const Autoplay: React.FC = () => {
    // Get the video URLs and loading state from Redux store
    const { videoUrls, loading } = useAppSelector((state) => state.global);
    const dispatch = useAppDispatch();

    // Main useEffect to update data on component mount
    useEffect(() => {
        // Async function to update data
        const updateData = async () => {
            // Set loading state to true when data is being fetched
            dispatch(setLoading(true));

            // Fetch the load count and update if successful
            const loadCountResult = await fetchAndUpdateLoadCount(dispatch);

            // If load count update is successful, proceed with other fetch operations
            if (loadCountResult.success) {
                await fetchAndDeleteVideos(dispatch); // Fetch and delete videos
                await dispatch(getVideoUrls())
                await fetchVideoHistory(dispatch); // Fetch video history
            }

            // Set loading state to false after data fetch is complete
            dispatch(setLoading(false));
        };

        // Call updateData function when the component mounts
        updateData();
    }, [dispatch]);

    // Render the loading screen if data is still being fetched
    if (loading) {
        return <Loading />; // Show loading spinner and message
    }

    return (
        <>
            <div className="outer-main">
                <Navbar /> {/* Navbar Component */}
                <div className="main">
                    <div className="video-container">
                        {/* Map over videoUrls to render each video */}
                        {videoUrls.map((url: any, index: number) => {
                            // Extract the video ID from the URL
                            const videoId = extractVideoId(url.url);

                            return (
                                <div key={url.id} className="video-wrapper">
                                    {/* Render video iframe if video ID is valid */}
                                    {videoId ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1`} // Autoplay and mute video
                                            title={`Video ${index + 1}`}
                                            allow="autoplay; fullscreen" // Allow autoplay and fullscreen for the iframe
                                        />
                                    ) : (
                                        <p>Invalid Video URL</p> // Fallback message for invalid video URL
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Autoplay;
