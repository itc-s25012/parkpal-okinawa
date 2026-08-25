export type Language =
    | "ja"
    | "en"
    | "zh-CN"
    | "zh-TW"
    | "ko";

export type OverpassElement = {
    type:
        | "node"
        | "way"
        | "relation";

    id: number;

    lat?: number;
    lon?: number;

    center?: {
        lat: number;
        lon: number;
    };

    tags?: Record<
        string,
        string
    >;
};

export type OverpassResponse = {
    elements?: OverpassElement[];
};

export type SupabaseParking = {
    id: number;

    name: string;
    address: string | null;

    latitude: number;
    longitude: number;

    price_text: string | null;
    is_free: boolean | null;

    opening_hours: string | null;
    capacity: number | null;
    parking_type: string | null;

    security_camera: boolean | null;
    street_light: boolean | null;
    security_staff: boolean | null;

    safety_score: number | null;
    student_friendly: boolean | null;

    note: string | null;

    source: string | null;
    source_id: string | null;

    is_paid: boolean | null;
    is_hidden: boolean | null;
    is_indoor: boolean | null;
    is_facility: boolean | null;
    is_accessible: boolean | null;
};

export type ApiParking = {
    id: string;
    sourceId: string;

    name: string;

    lat: number;
    lng: number;

    price: string;

    tags: string[];

    emoji: string;
    photo: string;

    distance: number;

    securityCamera: boolean;
    streetLight: boolean;
    securityStaff: boolean;

    safetyScore: number | null;
    studentFriendly: boolean;

    openingHours: string | null;

    capacity:
        | string
        | number
        | null;

    parkingType: string | null;

    note: string | null;

    source: string | null;

    /*
 * ========================================
 * 駐車場の特徴
 * ========================================
 */

    isPaid: boolean;
    isHidden: boolean;
    isIndoor: boolean;
    isFacility: boolean;
    isAccessible: boolean;
};