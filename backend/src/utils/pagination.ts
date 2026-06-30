import { PaginatedResult } from "../types/pagination.type.js";

export const returnPaginatedResults = <T>(data: T[], page: number, limit: number): PaginatedResult<T> => {
	const pageNumber = page || 1;
	const limitOfItems = limit || 10;
	const startIndex = (pageNumber - 1) * limitOfItems;
	return { 
		data: data.slice(startIndex, startIndex + limitOfItems),
		meta: {
			page: pageNumber,
			limit: limitOfItems, 
			total: data.length,
			totalPages: Math.ceil(data.length / limitOfItems),
			hasNext: startIndex + limitOfItems < data.length,
			hasPrev: startIndex > 0
		}
	};
};