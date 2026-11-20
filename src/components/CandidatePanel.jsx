import { useEffect, useState } from "react";
import { gatherCandidates } from "../lib/gatherCandidates";
import { matchesBrowser } from "../lib/parseCandidate";
import "./CandidatePanel.css";

export const CONFIGS = {
  none: [],
  stun: [{ urls: "stun:stun.l.google.com:19302" }],
  wrong: [{ urls: "stun:stun.invalid.example:3478" }],
};

const COLORS = {
  host: "#d5f0ec",
  srflx: "#fdecc8",
  relay: "#fbd9cf",
};

function sortByPriority(list) {
  return [...list].sort((a, b) => b.priority - a.priority);
}

function CandidateRows({ list }) {
  return list.map((c) => (
    <tr key={c.candidate} style={{ background: COLORS[c.type] ?? "white" }}>
      <td>{c.type}</td>
      <td>{c.protocol}</td>
      <td>
        {c.address} : {c.port}
      </td>
      <td>{c.priority}</td>
      <td>{c.foundation}</td>
    </tr>
  ));
}

export function CandidateTable({ candidates }) {
  const udpRows = sortByPriority(candidates.filter((c) => c.protocol !== "tcp"));
  const tcpRows = sortByPriority(candidates.filter((c) => c.protocol === "tcp"));

  return (
    <table className="candidate-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Protocol</th>
          <th>Address : Port</th>
          <th>Priority</th>
          <th>Foundation</th>
        </tr>
      </thead>

      <tbody>
        {candidates.length === 0 && (
          <tr>
            <td colSpan={5}>Waiting for candidates...</td>
          </tr>
        )}
        <CandidateRows list={udpRows} />
      </tbody>

      <tbody>
        <tr className="group-row">
          <td colSpan={5}>TCP candidates</td>
        </tr>
        {tcpRows.length === 0 && (
          <tr>
            <td colSpan={5}>No TCP candidates</td>
          </tr>
        )}
        <CandidateRows list={tcpRows} />
      </tbody>
    </table>
  );
}

export default function CandidatePanel() {
  const [configName, setConfigName] = useState("stun");
  const [candidates, setCandidates] = useState([]);
  const [elapsed, setElapsed] = useState(null);
  const [gatheringState, setGatheringState] = useState("new");
  const [runId, setRunId] = useState(0);
  const [micMessage, setMicMessage] = useState("");

  const iceServers = CONFIGS[configName];

  useEffect(() => {
    let active = true;
    const start = performance.now(); 

    setCandidates([]);
    setElapsed(null);
    setGatheringState("new");

    const stop = gatherCandidates({
      iceServers,

      onCandidate: (candidate) => {
        if (!active) return;
        setCandidates((old) => [...old, candidate]);
      },

      onDone: () => {
        if (!active) return;
        setElapsed(Math.round(performance.now() - start));
      },

      onStateChange: (state) => {
        if (!active) return;
        setGatheringState(state);
      },
    });

    return () => {
      active = false;
      stop();
    };
  }, [iceServers, runId]);

  async function askMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicMessage("Microphone allowed. Gathering again...");
    } catch (error) {
      setMicMessage("Microphone failed: " + error.name);
    }
    setRunId((old) => old + 1);
  }

  const parsedOk = candidates.filter((c) => matchesBrowser(c)).length;

  return (
    <div className="panel">
      <h1>ICE Candidate Panel</h1>

      <div className="controls">
        <label>
          Configuration:{" "}
          <select value={configName} onChange={(e) => setConfigName(e.target.value)}>
            <option value="none">none (no STUN)</option>
            <option value="stun">stun (Google STUN)</option>
            <option value="wrong">wrong (unreachable STUN)</option>
          </select>
        </label>

        <button onClick={() => setRunId((old) => old + 1)}>Gather again</button>
        <button onClick={askMicrophone}>Allow microphone, then gather</button>
      </div>

      <p>
        Gathering state: <strong>{gatheringState}</strong>
      </p>
      <p>
        Gathering time:{" "}
        <strong>{elapsed !== null ? elapsed + " ms" : "not finished yet"}</strong>
      </p>
      {micMessage && <p>{micMessage}</p>}

      <CandidateTable candidates={candidates} />

      <p className="small">
        Regex check (O8): {parsedOk} of {candidates.length} candidates match the
        browser properties.
      </p>
    </div>
  );
}
