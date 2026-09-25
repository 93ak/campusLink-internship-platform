import Modal from "./Modal";

export default function ConfirmDialog({
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
  children,
}) {
  return (
    <Modal title={title} onClose={onCancel} footer={
      <>
        <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
        <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
      </>
    }>
      {message && <p className="text-muted">{message}</p>}
      {children}
    </Modal>
  );
}
