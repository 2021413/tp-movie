export type Movie = {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  rating: string | null;
  releaseDate: string | null;
};