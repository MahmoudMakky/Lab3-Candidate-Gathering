const CANDIDATE_REGEX =
  /^candidate:(\S+) (\d+) (\S+) (\d+) (\S+) (\d+) typ (\S+)(?: raddr (\S+) rport (\d+))?(?: tcptype (\S+))?/;

export function parseCandidate(text) {
  const match = CANDIDATE_REGEX.exec(text);
  if (match === null) return null;

  return {
    foundation: match[1],
    component: Number(match[2]),
    protocol: match[3].toLowerCase(),
    priority: Number(match[4]),
    address: match[5],
    port: Number(match[6]),
    type: match[7],
    relatedAddress: match[8] || null,
    relatedPort: match[9] ? Number(match[9]) : null,
    tcpType: match[10] || null,
  };
}

export function matchesBrowser(candidate) {
  const mine = parseCandidate(candidate.candidate);
  if (mine === null) return false;

  return (
    mine.foundation === candidate.foundation &&
    mine.protocol === candidate.protocol &&
    mine.priority === candidate.priority &&
    mine.address === candidate.address &&
    mine.port === candidate.port &&
    mine.type === candidate.type
  );
}
