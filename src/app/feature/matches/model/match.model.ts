export interface MatchSummary {
  id: number;
  map: string;
  playedAt: string;
  team1Score: number;
  team2Score: number;
}

export interface PlayerStatsRequest {
  playerId: number;
  kills: number;
  deaths: number;
  damage: number;
}

export interface CreateMatchRequest {
  map: string;
  playedAt: string;
  team1Score: number;
  team2Score: number;
  team1Players: PlayerStatsRequest[];
  team2Players: PlayerStatsRequest[];
}
