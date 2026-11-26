import { useEffect, useRef, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { dateKey, getKeepInApp, getNotificationState, isDue } from "./ReminderUtils.js";

export default function CheckReminders({ user }) {
  const [reminders, setReminders] = useState([]);
  const [due, setDue] = useState([]);
  const alreadyShown = useRef(new Set());

  useEffect(() => {
      if (!user?.uid) return undefined;
  
      const reference = collection(db, "users", user.uid, "reminders");
      return onSnapshot(
        reference,
        (snapshot) => {
          setReminders(
            snapshot.docs
              .map((item) => ({ id: item.id, ...item.data() }))
              .filter((item) => item.type)
          );
        },
        (error) => console.error(error)
      );
    }, [user?.uid]);

    useEffect(() => {
    if (!user?.uid) return undefined;

    function checkReminders() {
      const now = new Date();

      reminders.forEach((reminder) => {
        const key = `${reminder.id}-${dateKey(now)}-${reminder.time}`;
                if (alreadyShown.current.has(key) || !isDue(reminder, now)) return;
        
                alreadyShown.current.add(key);
        
                const text =
                  reminder.message || "Kindly reminder.";

                setDue((current) => [...current, { key, text }]);
                
                        if (getNotificationState() === "granted" && !getKeepInApp()) {
                          try {
                            new Notification("Kindly", { body: text });
                          } catch (error) {
                            console.error(error);
                          }
                        }

                        if (reminder.repeat === "once") {
                                  updateDoc(doc(db, "users", user.uid, "reminders", reminder.id), {
                                    firedOn: dateKey(now),
                                  }).catch((error) => console.error(error));
                                }
                              });
                            }

                            checkReminders();
    const timer = setInterval(checkReminders, 15000);
    return () => clearInterval(timer);
  }, [reminders, user?.uid]);

  if (due.length === 0) return null;

  return (
    <div className="due-reminders" role="status" aria-live="polite">
      {due.map((item) => (
        <div className="due-reminder" key={item.key}>
          <p>{item.text}</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setDue((current) => current.filter((r) => r.key !== item.key))
            }
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
