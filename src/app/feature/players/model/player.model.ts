export interface PlayerSummary {
  id: number;
  name: string;
  nickname: string;
  matchesPlayed?: number;
  avgKills?: number;
  avgDeaths?: number;
  avgAdr?: number;
}

export interface CreatePlayerRequest {
  name: string;
  nickname: string;
}
