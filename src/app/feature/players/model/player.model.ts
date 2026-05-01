export interface PlayerSummary {
  id: number;
  name: string;
  nickname: string;
}

export interface CreatePlayerRequest {
  name: string;
  nickname: string;
}
