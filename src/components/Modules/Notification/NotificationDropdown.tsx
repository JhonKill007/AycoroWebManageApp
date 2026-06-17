import { useState } from "react";
import { NotificationModel } from "../../Models/Notification/NotificationModel";
import Notification from "../../Services/Notification/NotificationService";

interface INotificationDropdown {
  lastNotify: NotificationModel;
}

const NotificationDropdown = ({ lastNotify }: INotificationDropdown) => {
  const [notifications, setnotifications] = useState<NotificationModel[]>([]);

  // const loadData = useCallback(() => {
  //   const userId = Auth._User?.user?.id;
  //   if (!userId) return;

  //   // setRefreshing(true);
  //   // setCanSearchMoreNotify(true);
  //   setnotifications([]);
  //   // setIndexNotifySection(1);
  //   getNotifications(1);
  // }, [Auth._User]);

  // useEffect(() => {
  //   loadData();
  // }, [loadData]);

  // useEffect(() => {
  //   if (lastNotify && lastNotify.idUser === Auth._User?.user?.id) {
  //     setnotifications((prevNotification) => [lastNotify, ...prevNotification]);
  //   }
  // }, [lastNotify]);

  const getNotifications = (section: number) => {
    Notification.GetAll(section)
      .then((e: any) => {
        setnotifications((prevNotify) => [...e.data, ...prevNotify]);
        //   if (e.data.length < 12) {
        //     setCanSearchMoreNotify(false);
        //   }
        //   setRefreshing(false);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const setNotifyRead = (id: string) => {
    const updatedNotifications = notifications!.map((n: NotificationModel) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setnotifications(updatedNotifications);
  };

  const deleteNotification = async (id: string) => {
    // await Notification.Delete(id);
    const updatedNotifications = notifications!.filter(
      (n: NotificationModel) => n.id !== id
    );
    setnotifications(updatedNotifications);
  };

  return (
    <div className="dropdown-menu" aria-labelledby="dropdownNotifyButton">
      <div
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingBottom: "20px",
          paddingTop: "10px",
          width: "400px",
          height: "517px",
        }}
      >
        <h3>Notificaciones</h3>
        <hr />
        <div>
          {/* {notifications.map((notify: NotificationModel, index: number) => (
            <NotificationItem
              key={index}
              item={notify}
              setRead={setNotifyRead}
              deleteNotify={deleteNotification}
            />
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
