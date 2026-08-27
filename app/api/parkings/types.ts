export type Language =
    | "ja"
    | "en"
    | "zh-CN"
    | "zh-TW"
    | "ko";

/*
 * ========================================
 * OpenStreetMap / Overpass API
 * ========================================
 */

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

/*
 * ========================================
 * Supabaseから取得する駐車場データ
 * ========================================
 */

export type SupabaseParking = {
    id: number;

    name: string;
    address: string | null;

    latitude: number;
    longitude: number;

    /*
     * 時間貸し料金
     */
    price_text: string | null;
    is_free: boolean | null;

    /*
     * 駐車場情報
     */
    opening_hours: string | null;
    capacity: number | null;
    parking_type: string | null;

    /*
     * 安全情報
     */
    security_camera: boolean | null;
    street_light: boolean | null;
    security_staff: boolean | null;

    safety_score: number | null;
    student_friendly: boolean | null;

    /*
     * その他
     */
    note: string | null;

    source: string | null;
    source_id: string | null;

    /*
     * 駐車場の特徴
     */
    is_paid: boolean | null;
    is_hidden: boolean | null;
    is_indoor: boolean | null;
    is_facility: boolean | null;
    is_accessible: boolean | null;

    /*
     * ========================================
     * 月極駐車場
     * ========================================
     *
     * hourly  → 時間貸し
     * monthly → 月極
     */
    rental_type: string | null;

    /*
     * 月額料金
     * 例:
     * 8000 → 月額8,000円
     */
    monthly_price: number | null;
};

/*
 * ========================================
 * ParkPalの画面で使用する駐車場データ
 * ========================================
 */

export type ApiParking = {
    /*
     * ID
     */
    id: string;
    sourceId: string;

    /*
     * 駐車場名
     */
    name: string;

    /*
     * 緯度・経度
     */
    lat: number;
    lng: number;

    /*
     * 表示用料金
     *
     * 例:
     * "60分 200円"
     * "月額 8,000円"
     */
    price: string;

    /*
     * タグ
     */
    tags: string[];

    /*
     * 地図・一覧表示用
     */
    emoji: string;
    photo: string;

    /*
     * 学校・塾からの距離
     */
    distance: number;

    /*
     * ========================================
     * 安全情報
     * ========================================
     */

    securityCamera: boolean;
    streetLight: boolean;
    securityStaff: boolean;

    safetyScore: number | null;

    /*
     * 学生向けかどうか
     */
    studentFriendly: boolean;

    /*
     * ========================================
     * 駐車場情報
     * ========================================
     */

    openingHours: string | null;

    capacity:
        | string
        | number
        | null;

    parkingType: string | null;

    note: string | null;

    /*
     * データ元
     *
     * 例:
     * "supabase"
     * "osm"
     */
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

    /*
     * ========================================
     * 月極駐車場対応
     * ========================================
     */

    /*
     * hourly  → 時間貸し
     * monthly → 月極
     */
    rentalType: string | null;

    /*
     * 月額料金
     *
     * 例:
     * 8000
     * 10000
     * 12000
     */
    monthlyPrice: number | null;
};