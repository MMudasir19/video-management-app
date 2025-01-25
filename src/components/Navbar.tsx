import React from "react";
import { useNavigate } from "react-router-dom"; // Hook for navigation between routes
import PasswordModal from "./PasswordModal"; // Importing the PasswordModal component
import { useAppDispatch, useAppSelector } from "../redux/config/configStore"; // Redux hooks to dispatch actions and access state
import { setShowModal } from "../redux/slice/global"; // Action to control modal visibility

const Navbar: React.FC = () => {
    // Accessing the state to check if the modal should be shown
    const { showModal } = useAppSelector((state) => state.global);
    const dispatch = useAppDispatch(); // Dispatch hook to update Redux state
    const navigate = useNavigate(); // Navigation hook for route changes

    return (
        <>
            <div className="navbar"> {/* Navbar container */}
                <div
                    className="logo"
                    onClick={() => {
                        // Navigate to the home page when logo is clicked
                        navigate("/");
                    }}
                >
                    <img
                        src="https://vitejs.dev/logo.svg" // Logo image
                        alt="Logo"
                    />
                    <h1>My YT Website</h1> {/* Website title */}
                </div>
                <div className="buttons"> {/* Button container */}
                    <button
                        onClick={() => {
                            // Navigate to the home page when the Home button is clicked
                            navigate("/");
                        }}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => {
                            // Show the modal and set 'admin' type in localStorage when Admin button is clicked
                            dispatch(setShowModal(true)); // Dispatch to show the modal
                            localStorage.setItem("type", JSON.stringify("admin")); // Save admin type in localStorage
                        }}
                    >
                        Admin
                    </button>
                </div>
            </div>

            {/* Conditional rendering of PasswordModal based on the showModal state */}
            {showModal && (
                //Render PasswordModal component if showModal is true         
                <PasswordModal />
            )}
        </>
    );
};

export default Navbar; // Exporting the Navbar component for use in other parts of the app
