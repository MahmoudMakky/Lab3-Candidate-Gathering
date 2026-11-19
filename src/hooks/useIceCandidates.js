// O5: the same logic as CandidatePanel, moved into a hook.
import { useEffect, useState } from "react";
import { gatherCandidates } from "../lib/gatherCandidates";

export function useIceCandidates(iceServers, runId = 0) {
  const [candidates, setCandidates] = useState([]);
  const [gatheringState, setGatheringState] = useState("new");
  const [elapsed, setElapsed] = useState(null);

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

  return { candidates, gatheringState, elapsed };
}
