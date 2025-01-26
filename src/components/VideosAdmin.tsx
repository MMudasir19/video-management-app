import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import "../App.css";
import { useAppDispatch, useAppSelector } from "../redux/config/configStore";
import { setLoading, setNewUrl } from "../redux/slice/global";
import { extractVideoId, fetchAndDeleteVideos, fetchAndUpdateLoadCount, fetchVideoHistory, transformTimestamps } from "../utils/utils";
import Loading from "./Loading";
import { deleteVideo, getVideoHistory, getVideoUrls } from "../redux/asyncThunk/globalAsyncThunk";
import { useNavigate } from "react-router-dom";
import { addVideo } from "../redux/asyncThunk/addVideoAsyncThunk";

const VideosAdmin: React.FC = () => {
    // State to manage the selected tab: 'videos' or 'history'
    const [selectedTab, setSelectedTab] = useState<'videos' | 'history'>('videos');
    const [selectedTab1, setSelectedTab1] = useState<'added' | 'deleted'>('added');

    const { videoUrls, newUrl, videoHistory, loading } = useAppSelector((state) => state.global);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // useEffect to fetch and update video-related data when the component mounts
    useEffect(() => {
        const updateData = async () => {
            dispatch(setLoading(true));

            const loadCountResult = await fetchAndUpdateLoadCount(dispatch);
            if (loadCountResult.success) {
                await fetchAndDeleteVideos(dispatch);
                await dispatch(getVideoUrls())
                await fetchVideoHistory(dispatch);
            }

            dispatch(setLoading(false));
        };

        updateData();
    }, [dispatch]);

    // Transform video history data timestamps
    const transformedVideos = transformTimestamps(videoHistory);

    // Filter data based on the selected status tab ('added' or 'deleted')
    const filteredData = transformedVideos.filter((video: any) => {
        return video.status === selectedTab1;
    });

    // Async function to add a new video using the provided URL
    const addVideoAsync = async () => {
        if (newUrl.url !== "") {
            dispatch(addVideo(newUrl))
        } else {
            return;
        }
    };
    const deleteVideoAsync = async (id: any) => {
        if (id !== "") {
            await dispatch(deleteVideo(id)); // Dispatch the action to delete the selected video
            await dispatch(getVideoUrls()); // Fetch the latest video URLs
            await dispatch(getVideoHistory()); // Fetch the video history
        } else {
            return;
        }
    };

    // Show loading spinner while data is being fetched
    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <Navbar />
            <div>
                <h2 className="heading">Add YouTube Video</h2>
                <div className="main" style={{ flexDirection: "column" }}>
                    {/* Input fields to add a new video */}
                    <input
                        type="text"
                        value={newUrl.url}
                        onChange={(e) => dispatch(setNewUrl({ ...newUrl, url: e.target.value }))}
                        placeholder="Enter YouTube video URL"
                        autoComplete="new-url"
                    />
                    <input
                        type="number"
                        value={newUrl.deleteLoad}
                        onChange={(e) => dispatch(setNewUrl({ ...newUrl, deleteLoad: e.target.value }))}
                        placeholder="Enter page loads to auto delete"
                        autoComplete="new-deleteLoad"
                    />
                    <button onClick={addVideoAsync}>Add Video</button>
                </div>
            </div>
            <div className="table-container">
                {/* Tabs for viewing either 'videos' or 'history' */}
                <div className="tabs">
                    <button onClick={() => setSelectedTab('videos')} className={selectedTab === 'videos' ? 'active' : ''}>Videos</button>
                    <button onClick={() => setSelectedTab('history')} className={selectedTab === 'history' ? 'active' : ''}>History</button>
                </div>

                {/* Render video URLs if the 'videos' tab is selected */}
                {selectedTab === "videos" ?
                    <div style={{ width: "100%" }}>
                        <div className="video-container">
                            {videoUrls.map((url: any, index: number) => {
                                const videoId = extractVideoId(url.url);
                                return (
                                    <div key={url.id} className="video-wrapper">
                                        {/* Embed YouTube video if URL is valid */}
                                        {videoId ? (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1`}
                                                title={`Video ${index + 1}`}
                                                allow="autoplay; fullscreen"
                                            />
                                        ) : (
                                            <p>Invalid Video URL</p>
                                        )}
                                        {/* Delete icon to prompt modal for video deletion */}
                                        <span
                                            className="delete-icon"
                                            onClick={() =>
                                                deleteVideoAsync(url.id)
                                            }
                                        >
                                            &times;
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    :
                    // Render video history if the 'history' tab is selected
                    <>
                        <div className="tabs">
                            <button onClick={() => setSelectedTab1('added')} className={selectedTab1 === 'added' ? 'active' : ''}>Added</button>
                            <button onClick={() => setSelectedTab1('deleted')} className={selectedTab1 === 'deleted' ? 'active' : ''}>Deleted</button>
                        </div>
                        <div className="table-wrapper">
                            <table className="video-table">
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Url</th>
                                        <th>Load Count</th>
                                        <th>Delete Count</th>
                                        <th>Status</th>
                                        <th>Added At</th>
                                        {selectedTab1 === "deleted" && <th>Deleted At</th>}
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData?.length > 0 ? (
                                        filteredData.map((video: any, index: number) => (
                                            <tr key={video.id}>
                                                <td>{index + 1}</td>
                                                <td>{video.url}</td>
                                                <td>{video.loadCount}</td>
                                                <td>{video.deleteLoad ?? 0}</td>
                                                <td>{video.status}</td>
                                                <td>{video.createdAt}</td>
                                                {selectedTab1 === "deleted" && <td>{video.deletedAt}</td>}
                                                <td>
                                                    {/* Button to navigate to video stats page */}
                                                    <button onClick={() => navigate(`/stats/${video.videoId}`)}>Details</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: "center" }}>No Data Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                }
            </div>

        </>
    );
};

export default VideosAdmin;
