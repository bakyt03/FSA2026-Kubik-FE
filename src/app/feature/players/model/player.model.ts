export interface PlayerSummary {
  id: number;
  name: string;
  nickname: string;
  matchesPlayed?: number;
  avgKills?: number;
  avgDeaths?: number;
  avgAdr?: number;
  avgKdRatio?: number;
  winRate?: number;
  avgKillsPerRound?: number;
  keycloakId?: string | null;
}

export interface PlayerMatchHistoryEntry {
  matchId: number;
  map: string;
  playedAt: string;
  team1Score: number;
  team2Score: number;
  playerTeam: string;
  kills: number;
  deaths: number;
  damage: number;
  adr: number;
}

export interface PlayerDetail extends PlayerSummary {
  keycloakId?: string | null;
  recentMatches: PlayerMatchHistoryEntry[];
}

export interface CreatePlayerRequest {
  name: string;
  nickname: string;
}

export interface PlayerMeDetail extends PlayerSummary {
  rank: number;
  recentMatches: PlayerMatchHistoryEntry[];
}

export interface KeycloakUserDto {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface LinkUserRequest {
  keycloakId: string;
}
