import { useState } from "react";
import CandidatePanel from "./components/CandidatePanel";
import CandidatePanelHook from "./components/CandidatePanelHook";
import "./App.css";

export default function App() {
  const [useHook, setUseHook] = useState(false);

  return (
    <div>
      <label style={{ display: "block", padding: "12px 24px", textAlign: "left" }}>
        <input
          type="checkbox"
          checked={useHook}
          onChange={(e) => setUseHook(e.target.checked)}
        />{" "}
        Use the hook version (O5)
      </label>

      {useHook ? <CandidatePanelHook /> : <CandidatePanel />}
    </div>
  );
}
