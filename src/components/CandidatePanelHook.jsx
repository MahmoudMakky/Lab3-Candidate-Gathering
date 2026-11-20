import { useState } from "react";
import { useIceCandidates } from "../hooks/useIceCandidates";
import { CandidateTable, CONFIGS } from "./CandidatePanel";
import "./CandidatePanel.css";

export default function CandidatePanelHook() {
  const [configName, setConfigName] = useState("stun");
  const { candidates, gatheringState, elapsed } = useIceCandidates(CONFIGS[configName]);

  return (
    <div className="panel">
      <h1>ICE Candidate Panel (hook version)</h1>

      <div className="controls">
        <label>
          Configuration:{" "}
          <select value={configName} onChange={(e) => setConfigName(e.target.value)}>
            <option value="none">none (no STUN)</option>
            <option value="stun">stun (Google STUN)</option>
            <option value="wrong">wrong (unreachable STUN)</option>
          </select>
        </label>
      </div>

      <p>
        Gathering state: <strong>{gatheringState}</strong>
      </p>
      <p>
        Gathering time:{" "}
        <strong>{elapsed !== null ? elapsed + " ms" : "not finished yet"}</strong>
      </p>

      <CandidateTable candidates={candidates} />
    </div>
  );
}
