import "../App.css"; // Importing styles
import React from "react";

const Loading: React.FC = () => {
    return (
        <div className="loading">
            {/* Spinner above the heading */}
            <div className="spinner"></div>
            <h3>Loading videos...</h3>
        </div>
    );
};

export default Loading;
