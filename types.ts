export interface RunRecord {
  id: string;
  distance: number;
  photo: string; // Base64 data URL
  togetherPhoto: string; // Base64 data URL for running together photo
  date: string; // ISO string
}

export interface Participant {
  id: string;
  name: string;
  photo: string; // Base64 data URL
  runs: RunRecord[];
}

export interface Level {
  name: string;
  minDistance: number;
  color: string;
  textColor: string;
}
