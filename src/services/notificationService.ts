export const requestNotificationPermission = async () => {
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

// BUG FIX #7: window.location.href menyebabkan full page reload yang membuang
// semua state React. Tapi notificationService tidak punya akses ke React Router's
// navigate() karena bukan komponen/hook. Solusinya: gunakan window.history.pushState
// agar URL berubah tanpa reload, lalu dispatch popstate agar React Router menangkap.
export const showNotification = (title: string, body: string, url: string) => {
  if (Notification.permission === "granted") {
    const n = new Notification(title, { body, icon: "/favicon.ico" });
    n.onclick = () => {
      window.focus();
      window.history.pushState({}, "", url);
      window.dispatchEvent(new PopStateEvent("popstate"));
    };
  }
};
