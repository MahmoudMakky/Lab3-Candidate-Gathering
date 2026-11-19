// Plain JavaScript, no React in this file.
// It opens a connection only to collect ICE candidates, then reports them.
export function gatherCandidates({ iceServers, onCandidate, onDone, onStateChange }) {
  const pc = new RTCPeerConnection({ iceServers });

  // A data channel is needed, otherwise the browser has nothing to gather for.
  pc.createDataChannel("probe");

  // new -> gathering -> complete
  pc.onicegatheringstatechange = () => {
    if (onStateChange) onStateChange(pc.iceGatheringState);
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onCandidate(event.candidate);
    } else {
      // A null candidate means gathering is finished.
      onDone();
    }
  };

  // Creating the offer and setting it as local description starts gathering.
  pc.createOffer()
    .then((offer) => pc.setLocalDescription(offer))
    .catch((error) => console.error("Gathering failed:", error));

  // The caller uses this function to close the connection.
  return () => pc.close();
}
