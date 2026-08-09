export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    number: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}