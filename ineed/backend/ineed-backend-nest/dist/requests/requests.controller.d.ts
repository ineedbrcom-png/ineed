export declare class RequestsController {
    list(lat?: string, lng?: string, radius?: string): {
        ok: boolean;
        filters: {
            lat: number | null;
            lng: number | null;
            radius: number | null;
        };
        items: never[];
    };
}
