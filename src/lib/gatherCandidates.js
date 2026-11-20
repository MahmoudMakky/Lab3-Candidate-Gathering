export function gatherCandidates({ iceServers, onCandidate, onDone, onStateChange }) {
  const pc = new RTCPeerConnection({ iceServers });

  pc.createDataChannel("probe");

  pc.onicegatheringstatechange = () => {
    if (onStateChange) onStateChange(pc.iceGatheringState);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onCandidate(event.candidate);
    } else {
      onDone();
    }
  };

  pc.createOffer()
    .then((offer) => pc.setLocalDescription(offer))
    .catch((error) => console.error("Gathering failed:", error));

  return () => pc.close();
}
