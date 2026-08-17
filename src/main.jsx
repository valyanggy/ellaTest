import { createRoot } from "react-dom/client";
import "slot-text/style.css";
import { App } from "./App";
import { CursorTrailRecordingPage } from "./components/CursorTrailRecordingPage";
import "./styles.css";

const isCursorTrailRecording = window.location.pathname === "/cursor-trail";

createRoot(document.getElementById("root")).render(isCursorTrailRecording ? <CursorTrailRecordingPage /> : <App />);
