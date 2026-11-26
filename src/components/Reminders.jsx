import { useEffect, useState } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import {db} from "../firebase.js";
import {
    REPEATS,
    TYPES,
    formatTime,
    getKeepInApp,
    getNotificationState,
    labelFor,
    setKeepInApp,
} from "./ReminderUtils.js";

const EMPTY_FORM = {
    type: "check-in",
    time: "09:00",
    repeat: "daily",
    message: TYPES[0].wording,
};

export default function Reminders({ user }) {
    const [reminders, setReminders] = useState([]);
    const [editingId, setEditingId] = useState(null); 
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [permission, setPermission] = useState(getNotificationState());
    const [inAppOnly, setInAppOnly] = useState(getKeepInApp());

    useEffect(() => {
        if (!user?.uid) return undefined;

        const reference = collection(db, "users", user.uid, "reminders");
        return onSnapshot(
            reference,
            (snapshot) => {
                const loaded = snapshot.docs
                    .map((item) => ({ id: item.id, ...item.data() }))
                    .filter((item) => item.type);
                loaded.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
                setReminders(loaded);
            },
            (loadError) => {
                console.error(loadError);
                setError("We could not load your reminders. Refresh and try again.");
            }
        );
    }, [user?.uid]);

    function openAdd() {
        setForm(EMPTY_FORM);
        setEditingId("new");
        setError("");
    }

    function openEdit(reminder) {
        setForm({
            type: reminder.type || "custom",
            time: reminder.time || "09:00",
            repeat: reminder.repeat || "daily",
            message: reminder.message || "",
        });
        setEditingId(reminder.id);
        setError("");
    }

    function cancel() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setError("");
    }

    function changeType(typeId) {
        const type = TYPES.find((item) => item.id === typeId);
        setForm((current) => {
            const usingDefault =
                !current.message ||
                TYPES.some((item) => item.wording === current.message);
            return {
                ...current,
                type:typeId,
                message: usingDefault ? type.wording : current.message,
            };
        });
    }

    async function save(event) {
        event.preventDefault();
        setSaving(true);
        setError("");

        const data = {
            type: form.type,
            time: form.time,
            repeat: form.repeat,
            message: form.message.trim() || "Kindly reminder.",
        };

        try {
            if (editingId === "new") {
                await addDoc(collection(db, "users", user.uid, "reminders"), {
                    ...data,
                    createdAt: serverTimestamp(),
                });
            } else {
                await updateDoc(doc(db, "users", user.uid, "reminders", editingId), {
                    ...data,
                    firedOn: null,
                });
            }
            cancel();
        } catch (saveError) {
            console.error(saveError);
            setError("Could not save this reminder. Try again.");
        } finally {
            setSaving(false);
        }
    }

    async function remove(reminder) {
        try {
            await deleteDoc(doc(db, "users", user.uid, "reminders", reminder.id));
        } catch (deleteError) {
            console.error(deleteError);
            setError("Could not delete this reminder. Try again.");
        }
    }
    
        async function turnOnNotifications() {
            if (permission === "default") {
                const result = await Notification.requestPermission();
                setPermission(result);
                if (result !== "granted") return;
            }
            setKeepInApp(false);
            setInAppOnly(false);
        }

    function chooseInApp() {
        setKeepInApp(true);
        setInAppOnly(true);
    }

    const notificationsOff = permission !== "granted" || inAppOnly;

    return (
        <section className="dashboard-card reminders-settings">
            <h2>Reminders</h2>

                        <div className="notification-status">
                <p>{notificationsOff ? "Notifications are off." : "Browser notifications are on."}</p>

                <div className="button-row">
                    {(permission === "default" || (permission === "granted" && inAppOnly)) && (
                        <button type="button" className="primary-button" onClick={turnOnNotifications}>
                            Turn on notifications
                        </button>
                    )}
                    {!notificationsOff && (
                        <button type="button" className="secondary-button" onClick={chooseInApp}>
                            Turn off notifications
                        </button>
                    )}
                    {notificationsOff && !inAppOnly && (
                        <button type="button" className="secondary-button" onClick={chooseInApp}>
                            Keep reminders in app
                        </button>
                    )}
                </div>

                <p className="hint">Reminders appear while Kindly is open in your browser.</p>
            </div>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            {reminders.length === 0 && <p>No reminders yet. Add one to get a gentle nudge.</p>}

            <ul className="reminder-settings-list">
                {reminders.map((reminder) => (
                    <li key={reminder.id} className="reminder-row">
                        <div>
                            <strong>{labelFor(TYPES, reminder.type)}</strong>
                            <p>
                                {formatTime(reminder.time)} - {labelFor(REPEATS, reminder.repeat)}
                            </p>
                            <p className="reminder-wording">{reminder.message}</p>
                        </div>
                        <div className="button-row">
                            <button type="button" className="secondary-button" onClick={() => openEdit(reminder)}>
                                Edit
                            </button>
                            <button type="button" className="text-button" onClick={() => remove(reminder)}>
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {editingId === null ? (
                <button type="button" className="primary-button" onClick={openAdd}>
                    + Add reminder
                </button>
            ) : (
                <form className="reminder-form" onSubmit={save}>
                    <h3>{editingId === "new" ? "New reminder" : "Edit reminder"}</h3>

                    <label>
                        Type
                        <select value={form.type} onChange={(e) => changeType(e.target.value)}>
                            {TYPES.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Time
                        <input
                            type="time"
                            value={form.time}
                            onChange={(e) => setForm({ ...form, time: e.target.value })}
                            required
                        />
                    </label>

                    <label>
                        Repeat
                        <select
                            value={form.repeat}
                            onChange={(e) => setForm({ ...form, repeat: e.target.value })}
                        >
                            {REPEATS.map((repeat) => (
                                <option key={repeat.id} value={repeat.id}>
                                    {repeat.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Wording
                        <input
                            type="text"
                            value={form.message}
                            maxLength={120}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />
                    </label>

                    <div className="button-row">
                        <button type="submit" className="primary-button" disabled={saving}>
                            {saving ? "Saving..." : "Save reminder"}
                        </button>
                        <button type="button" className="secondary-button" onClick={cancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}