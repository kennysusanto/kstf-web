import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function ConfirmLogoutModal({ props }) {
    const { show, setShow, logout } = props;
    const handleClose = () => setShow(false);
    const handleConfirmLogout = () => {
        handleClose();
        logout();
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
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
            </Modal>
        </>
    );
}
