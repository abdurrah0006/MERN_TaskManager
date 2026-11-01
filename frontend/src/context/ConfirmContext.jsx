import { createContext, useCallback, useContext, useState } from "react";
import Modal from "../components/Modal";

const ConfirmContext = createContext(null);

// confirm({ title, message, confirmLabel }) resolves to true or false.
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setDialog({ ...options, resolve })),
    []
  );

  const close = (answer) => {
    dialog.resolve(answer);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <Modal
          size="sm"
          title={dialog.title}
          onClose={() => close(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => close(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={() => close(true)} autoFocus>
                {dialog.confirmLabel || "Confirm"}
              </button>
            </>
          }
        >
          <p className="text-muted">{dialog.message}</p>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
