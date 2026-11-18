import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const ACTIVITIES = [
  {
    id: "breathing",
    title: "Slow breathing",
    minutes: 3,
    instructions: [
      "Sit or lie somewhere comfortable.",
      "Breathe in through your nose for 4 counts.",
      "Breathe out slowly for 6 counts.",
      "Keep going until the timer ends.",
      ],
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 grounding",
    minutes: 5,
    instructions: [
      "Name 5 things you can see.",
      "Name 4 things you can feel.",
      "Name 3 things you can hear.",
      "Name 2 things you can smell.",
      "Name 1 thing you can taste.",
      ],
  },
  {
    id: "walk",
    title: "Short walk",
    minutes: 10,
    instructions: [
      "Step outside or walk around your space.",
      "Move at whatever pace feels nice.",
      "Notice sounds, light, or the air around  you.",
      ],
  },
  {
    id: "stretch",
    title: "Gentle Stretch",
    minutes: 5,
    instructions: [
      "Roll your shoulders back a few times.",
      "Slowly tilt your head side to side.",
      "Reach your arms overhead and take a deep breath.",
      "Make sure to stop any movements that do not feel good.",
      ],
  },
  {
    id: "journal",
    title: "Quick Journal",
    minutes: 5,
    instructions: [
      "Grab a notebook or open a notes app.",
      "Write about one thing that went okay today.",
      "Write one thing that could use support with.",
      ],
  },
  {
    id: "water",
    title: "Water and a Break",
    minutes: 1,
    instructions: [
      "Get a glass of water or a warm drink.",
      "Sit down and take a few slow sips.",
      "Let your mind wander for a moment.",
    ],
  },
];

const pickRandom = (excludeId) => {
  const pool = ACTIVITIES.filter((a) => a.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
};

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mm = minutes <10 ? `0${minutes}` : `${minutes}`;
  const ss = seconds <10 ? `0${seconds}` : `${seconds}`;

  return `${mm}:${ss}`;
};

export default function Result() {
  const navigate = useNavigate();
  const[activity, setActivity] = useState(() => pickRandom());
  const [secondsLeft, setSecondsLeft] = useState(activity.minutes * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  //Tick timer every second
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () =>
clearInterval(intervalRef.current);
  }, [running]);

  const resetTimer = (a) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDone(false);
    setSecondsLeft(a.minutes * 60);
  };

  const showAnother = () => {
    const next = pickRandom(activity.id);
    setActivity(next);
    resetTimer(next);
  };

  const startActivity = () => {
    if (done) resetTimer(activity);
    setRunning(true);
  };

  const startLabel = done
    ? "Start Again"
    : secondsLeft < activity.minutes * 60
    ? "Resume"
    : "Start Activity";

  return (
    <main className="activity">
      <h1>Thank you for checking in</h1>
      <p>Here's something that might help right now.</p>

      <section className="activity-card">
        <h2 className="activity-title">{activity.title}</h2>
        <p className="activity-duration">About {activity.minutes} min</p>

        <ol className="activity-steps">
          {activity.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        <div className="activity-timer" role="timer" aria-label="Activity timer">
          {done ? "All done. Nice work." : formatTime(secondsLeft)}
        </div>

        <div className="activity-buttons">
          {running ? (
            <button className="btn btn-primary" onClick={() => setRunning(false)}>
              Pause
            </button>
          ) : (
            <button className="btn btn-primary" onClick={startActivity}>
              {startLabel}
            </button>
          )}
          <button className="btn btn-secondary" onClick={showAnother}>
            Show another suggestion
          </button>
        </div>
      </section>

      <button className="activity-support" onClick={() => navigate("/support")}>
        Open support resources
      </button>
    </main>
  );
}        
