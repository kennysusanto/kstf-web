// import Button from "react-bootstrap/Button";
// import Modal from "react-bootstrap/Modal";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function ConfirmLogoutModal({ props }) {
    const { show, setShow, logout } = props;
    const handleClose = () => setShow(false);
    const handleConfirmLogout = () => {
        handleClose();
        logout();
    };

    return (
        <>
            {/* <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>You are logging out!</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="outline-danger" onClick={handleConfirmLogout}>
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal> */}
            <Dialog open={show} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">{"Confirm Logout"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">You are logging out! Continue?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="outlined">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmLogout} autoFocus variant="contained" color="error">
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
