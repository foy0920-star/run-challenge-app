
export interface Participant {
  id: string;
  name: string;
  photoUrl: string; // base64 string
}

export interface RunRecord {
  id: string;
  participantId: string;
  distance: number;
  recordPhotoUrl: string; // base64 string
  groupRunPhotoUrl?: string; // base64 string
  date: string;
}

export interface RunnerLevel {
    name: string;
    level: string;
    minDistance: number;
    color: string;
    textColor: string;
}

export interface ParticipantStats {
    id: string;
    name: string;
    photoUrl: string;
    totalDistance: number;
    runCount: number;
    groupRunCount: number;
}
