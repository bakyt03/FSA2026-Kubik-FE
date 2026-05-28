import { PlayerSummary } from '../../players/model/player.model';

export interface TeamDefinition {
  players: PlayerSummary[];
}

export interface TeamSuggestion {
  teamA: TeamDefinition;
  teamB: TeamDefinition;
  adrDifference: number;
  teamAAdrAvg: number;
  teamBAdrAvg: number;
}

export interface TeamSuggestionResponse {
  suggestions: TeamSuggestion[];
  warnings: string[];
}
