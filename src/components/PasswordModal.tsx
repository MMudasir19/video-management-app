import { useAppDispatch, useAppSelector } from "../redux/config/configStore"; // Redux hooks for dispatching actions and accessing state
import { clearUserState, setUserError, setPassword } from "../redux/slice/user"; // Actions to handle state updates
import { loginUser } from "../redux/asyncThunk/globalAsyncThunk"; // Async actions for video handling
import Loading from "./Loading";

const PasswordModal: React.FC = () => {
    const { password, userError, loading } = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch(); // Redux dispatch to update state
    // Function to validate the entered password and handle subsequent actions
    const handleValidatePassword = async () => {
        // Check if the password field is not empty
        if (password.password !== "" || password.email !== "") {
            // Dispatch action to validate the password
            await dispatch(loginUser({ email: password.email, password: password.password }))
            dispatch(clearUserState()); // Clear the state after successful login

        } else {
            // If the password is empty, show an error
            dispatch(setUserError("Enter credentials."));
        }
    };

    if (loading) return <Loading />

    return (
        <>
            <div className="modal-overlay"> {/* Modal overlay to dim the background */}
                <div className="modal"> {/* The modal itself */}
                    <div className="modal-header"> {/* Header of the modal */}
                        <h2>Enter Email & Password</h2> {/* Title of the modal */}
                        <button
                            className="close-button"
                            onClick={() => dispatch(clearUserState())} // Clear state when modal is closed
                        >
                            × {/* Close button */}
                        </button>
                    </div>
                    <input
                        type="email"
                        value={password.email} // Bind the input value to the password state
                        onChange={(e) => dispatch(setPassword({ ...password, email: e.target.value }))} // Update the password state on input change
                        placeholder="Enter email"
                        autoComplete="new-email"
                    />
                    <input
                        type="password"
                        value={password.password} // Bind the input value to the password state
                        onChange={(e) => dispatch(setPassword({ ...password, password: e.target.value }))} // Update the password state on input change
                        placeholder="Enter password"
                        autoComplete="new-password"
                    />
                    <div className="modal-buttons"> {/* Buttons for submitting or cancelling */}
                        <button onClick={() => handleValidatePassword()}> {/* Submit button */}
                            Submit
                        </button>
                        <button
                            onClick={() => {
                                dispatch(clearUserState()); // Cancel the action and clear state
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                    {userError && <p className="error">{userError}</p>} {/* Display error message if any */}
                </div>
            </div>
        </>
    );
};

export default PasswordModal; // Exporting the PasswordModal component
