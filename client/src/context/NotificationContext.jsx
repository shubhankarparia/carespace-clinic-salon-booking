
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";

export const NotificationContext = createContext(null);

let notificationCounter = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }, []);

  const notify = useCallback((message, type = "success", duration = 4000) => {
    const id = ++notificationCounter;

    setNotifications((previous) => [
      ...previous,
      { id, message, type }
    ]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [removeNotification]);

  const success = useCallback(
    (message) => notify(message, "success"),
    [notify]
  );

  const error = useCallback(
    (message) => notify(message, "error"),
    [notify]
  );

  const warning = useCallback(
    (message) => notify(message, "warning"),
    [notify]
  );

  const info = useCallback(
    (message) => notify(message, "info"),
    [notify]
  );

  const value = useMemo(
    () => ({
      notifications,
      notify,
      success,
      error,
      warning,
      info,
      removeNotification
    }),
    [notifications, notify, success, error, warning, info, removeNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div
        className="notification-container"
        aria-live="polite"
        aria-atomic="false"
      >
        {notifications.map((item) => {
          const icons = {
            success: "bi-check-circle-fill",
            error: "bi-x-circle-fill",
            warning: "bi-exclamation-triangle-fill",
            info: "bi-info-circle-fill"
          };

          return (
            <div
              key={item.id}
              className={`app-notification notification-${item.type}`}
              role="alert"
            >
              <i className={`bi ${icons[item.type] || icons.info}`} />

              <span>{item.message}</span>

              <button
                type="button"
                aria-label="Close notification"
                onClick={() => removeNotification(item.id)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
