export interface Game {
	id: number;
	title: string;
	genre: string;
	platform: string[];
	releaseYear: string;
	inStock: boolean;
	cover?: string;
	price: number;
	rating?: number;
}