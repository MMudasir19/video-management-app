import { useNavigate } from "react-router-dom"; // Hook for navigation
import { useAppDispatch, useAppSelector } from "../redux/config/configStore"; // Redux hooks for dispatching actions and accessing state
import { clearState, setError, setPassword, validatePassword } from "../redux/slice/global"; // Actions to handle state updates
import { deleteVideo, getVideoHistory, getVideoUrls } from "../redux/asyncThunk/globalAsyncThunk"; // Async actions for video handling

const PasswordModal: React.FC = () => {
    const navigate = useNavigate(); // For navigating between routes
    const { error, password, selectedVideo } = useAppSelector((state) => state.global); // Accessing global state, including error, password, and selected video
    const dispatch = useAppDispatch(); // Redux dispatch to update state

    // Function to validate the entered password and handle subsequent actions
    const handleValidatePassword = async () => {
        // Check if the password field is not empty
        if (password !== "") {
            // Dispatch action to validate the password
            dispatch(validatePassword(password));
            if (error === "") { // If there is no error after validation
                const type = JSON.parse(localStorage.getItem("type") || '""'); // Retrieve 'type' (admin or regular) from localStorage
                if (type === "admin") {
                    // If the user is an admin, navigate to the admin page and mark authentication as true
                    navigate("/admin");
                    localStorage.setItem("auth", "true");
                    dispatch(clearState()); // Clear the state after successful login
                } else {
                    // If the user is not an admin, proceed to delete the selected video and fetch the updated data
                    await dispatch(deleteVideo(selectedVideo)); // Dispatch the action to delete the selected video
                    await dispatch(getVideoUrls()); // Fetch the latest video URLs
                    await dispatch(getVideoHistory()); // Fetch the video history
                }
            }
        } else {
            // If the password is empty, show an error
            dispatch(setError("Enter password"));
        }
    };

    return (
        <>
            <div className="modal-overlay"> {/* Modal overlay to dim the background */}
                <div className="modal"> {/* The modal itself */}
                    <div className="modal-header"> {/* Header of the modal */}
                        <h2>Enter Password</h2> {/* Title of the modal */}
                        <button
                            className="close-button"
                            onClick={() => dispatch(clearState())} // Clear state when modal is closed
                        >
                            × {/* Close button */}
                        </button>
                    </div>
                    <input
                        type="password"
                        value={password} // Bind the input value to the password state
                        onChange={(e) => dispatch(setPassword(e.target.value))} // Update the password state on input change
                        placeholder="Enter password"
                        autoComplete="new-password"
                    />
                    <div className="modal-buttons"> {/* Buttons for submitting or cancelling */}
                        <button onClick={() => handleValidatePassword()}> {/* Submit button */}
                            Submit
                        </button>
                        <button
                            onClick={() => {
                                dispatch(clearState()); // Cancel the action and clear state
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                    {error && <p className="error">{error}</p>} {/* Display error message if any */}
                </div>
            </div>
        </>
    );
};

export default PasswordModal; // Exporting the PasswordModal component
