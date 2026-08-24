import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { supabase } from "@/lib/supabase";

const execFileAsync = promisify(execFile);

type Language =
    | "ja"
    | "en"
    | "zh-CN"
    | "zh-TW"
    | "ko";

type OverpassElement = {
    type: "node" | "way" | "relation";
    id: number;
    lat?: number;
    lon?: number;
    center?: {
        lat: number;
        lon: number;
    };
    tags?: Record<string, string>;
};

type OverpassResponse = {
    elements?: OverpassElement[];
};

type SupabaseParking = {
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
};

type ApiParking = {
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
    capacity: string | number | null;
    parkingType: string | null;

    note: string | null;
    source: string | null;
};

/*
 * ============================================
 * Overpass
 * ============================================
 */

const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
];

/*
 * 以前は30秒だったけど、
 * 1サーバー10秒で切り替える。
 */
const OVERPASS_TIMEOUT_SECONDS = 10;

/*
 * ============================================
 * 翻訳
 * ============================================
 */

const TEXT = {
    ja: {
        parking: "駐車場",

        operator: "運営",

        spaces: "台",

        free: "無料",

        paid: "有料",

        paidUnknown:
            "有料・料金未登録",

        priceUnknown:
            "料金情報なし",

        customers:
            "施設利用者向け",

        surface:
            "平面駐車場",

        multiStorey:
            "立体駐車場",

        underground:
            "地下駐車場",

        rooftop:
            "屋上駐車場",

        registered:
            "OpenStreetMap登録駐車場",

        camera:
            "📷 防犯カメラあり",

        light:
            "💡 街灯あり",

        staff:
            "🛡️ 管理スタッフあり",

        student:
            "🎓 学生向け",
    },

    en: {
        parking: "Parking",

        operator: "Operator",

        spaces: " spaces",

        free: "Free",

        paid: "Paid",

        paidUnknown:
            "Paid · Price unavailable",

        priceUnknown:
            "Price unavailable",

        customers:
            "Customers only",

        surface:
            "Surface parking",

        multiStorey:
            "Multi-storey parking",

        underground:
            "Underground parking",

        rooftop:
            "Rooftop parking",

        registered:
            "OpenStreetMap parking",

        camera:
            "📷 Security camera",

        light:
            "💡 Lighting available",

        staff:
            "🛡️ Staff on site",

        student:
            "🎓 Student friendly",
    },

    "zh-CN": {
        parking: "停车场",

        operator: "运营",

        spaces: "个车位",

        free: "免费",

        paid: "收费",

        paidUnknown:
            "收费 · 暂无价格信息",

        priceUnknown:
            "暂无价格信息",

        customers:
            "仅限设施用户",

        surface:
            "地面停车场",

        multiStorey:
            "立体停车场",

        underground:
            "地下停车场",

        rooftop:
            "屋顶停车场",

        registered:
            "OpenStreetMap登记停车场",

        camera:
            "📷 有监控摄像头",

        light:
            "💡 有照明",

        staff:
            "🛡️ 有管理人员",

        student:
            "🎓 学生友好",
    },

    "zh-TW": {
        parking: "停車場",

        operator: "營運",

        spaces: "個車位",

        free: "免費",

        paid: "收費",

        paidUnknown:
            "收費 · 暫無價格資訊",

        priceUnknown:
            "暫無價格資訊",

        customers:
            "僅限設施使用者",

        surface:
            "平面停車場",

        multiStorey:
            "立體停車場",

        underground:
            "地下停車場",

        rooftop:
            "屋頂停車場",

        registered:
            "OpenStreetMap登記停車場",

        camera:
            "📷 有監視器",

        light:
            "💡 有照明",

        staff:
            "🛡️ 有管理人員",

        student:
            "🎓 學生友善",
    },

    ko: {
        parking: "주차장",

        operator: "운영",

        spaces: "대",

        free: "무료",

        paid: "유료",

        paidUnknown:
            "유료 · 요금 정보 없음",

        priceUnknown:
            "요금 정보 없음",

        customers:
            "시설 이용자 전용",

        surface:
            "평면 주차장",

        multiStorey:
            "입체 주차장",

        underground:
            "지하 주차장",

        rooftop:
            "옥상 주차장",

        registered:
            "OpenStreetMap 등록 주차장",

        camera:
            "📷 방범 카메라 있음",

        light:
            "💡 조명 있음",

        staff:
            "🛡️ 관리 직원 있음",

        student:
            "🎓 학생 친화",
    },
} satisfies Record<
    Language,
    Record<string, string>
>;

/*
 * ============================================
 * 言語
 * ============================================
 */

function normalizeLanguage(
    value: string | null,
): Language {
    if (
        value === "en" ||
        value === "zh-CN" ||
        value === "zh-TW" ||
        value === "ko"
    ) {
        return value;
    }

    return "ja";
}

/*
 * ============================================
 * 距離
 * ============================================
 */

function distanceMeters(
    a: {
        lat: number;
        lng: number;
    },

    b: {
        lat: number;
        lng: number;
    },
) {
    const R = 6371000;

    const rad =
        (value: number) =>
            (value *
                Math.PI) /
            180;

    const dLat =
        rad(
            b.lat -
            a.lat,
        );

    const dLng =
        rad(
            b.lng -
            a.lng,
        );

    const value =
        Math.sin(
            dLat / 2,
        ) **
        2 +
        Math.cos(
            rad(
                a.lat,
            ),
        ) *
        Math.cos(
            rad(
                b.lat,
            ),
        ) *
        Math.sin(
            dLng / 2,
        ) **
        2;

    return (
        2 *
        R *
        Math.asin(
            Math.sqrt(
                value,
            ),
        )
    );
}

/*
 * ============================================
 * Overpass取得
 * ============================================
 */

async function fetchOverpass(
    url: string,
    query: string,
): Promise<OverpassResponse> {
    const {
        stdout,
    } =
        await execFileAsync(
            "curl",
            [
                "-sS",

                "--max-time",
                String(
                    OVERPASS_TIMEOUT_SECONDS,
                ),

                "-X",
                "POST",

                url,

                "-H",
                "Content-Type: application/x-www-form-urlencoded",

                "--data-urlencode",
                `data=${query}`,
            ],
            {
                maxBuffer:
                    15 *
                    1024 *
                    1024,
            },
        );

    return JSON.parse(
        stdout,
    ) as OverpassResponse;
}

/*
 * ============================================
 * 名前の多言語化
 * ============================================
 */

function englishBrandFallback(
    name: string,
) {
    return name
        .replaceAll(
            "タイムズ",
            "Times",
        )
        .replaceAll(
            "三井のリパーク",
            "Mitsui Repark",
        )
        .replaceAll(
            "リパーク",
            "Repark",
        )
        .replaceAll(
            "Dパーキング",
            "D-Parking",
        )
        .replaceAll(
            "パーキング",
            " Parking",
        )
        .replaceAll(
            "駐車場",
            " Parking",
        )
        .trim();
}

function localizedName(
    tags:
    Record<
        string,
        string
    >,

    language:
    Language,
) {
    const base =
        tags.name?.trim() ||
        tags.operator?.trim() ||
        tags.brand?.trim();

    if (!base) {
        return null;
    }

    if (
        language ===
        "ja"
    ) {
        return (
            tags[
                "name:ja"
                ]?.trim() ||
            base
        );
    }

    if (
        language ===
        "en"
    ) {
        return (
            tags[
                "name:en"
                ]?.trim() ||
            tags[
                "brand:en"
                ]?.trim() ||
            tags[
                "operator:en"
                ]?.trim() ||
            englishBrandFallback(
                base,
            )
        );
    }

    if (
        language ===
        "zh-CN"
    ) {
        return (
            tags[
                "name:zh-Hans"
                ]?.trim() ||
            tags[
                "name:zh"
                ]?.trim() ||
            tags[
                "brand:zh"
                ]?.trim() ||
            base
        );
    }

    if (
        language ===
        "zh-TW"
    ) {
        return (
            tags[
                "name:zh-Hant"
                ]?.trim() ||
            tags[
                "name:zh"
                ]?.trim() ||
            tags[
                "brand:zh"
                ]?.trim() ||
            base
        );
    }

    if (
        language ===
        "ko"
    ) {
        return (
            tags[
                "name:ko"
                ]?.trim() ||
            tags[
                "brand:ko"
                ]?.trim() ||
            base
        );
    }

    return base;
}

function localizedOperator(
    tags:
    Record<
        string,
        string
    >,

    language:
    Language,
) {
    if (
        language ===
        "ja"
    ) {
        return (
            tags[
                "operator:ja"
                ] ||
            tags.operator
        );
    }

    if (
        language ===
        "en"
    ) {
        return (
            tags[
                "operator:en"
                ] ||
            tags.operator
        );
    }

    if (
        language ===
        "zh-CN"
    ) {
        return (
            tags[
                "operator:zh-Hans"
                ] ||
            tags[
                "operator:zh"
                ] ||
            tags.operator
        );
    }

    if (
        language ===
        "zh-TW"
    ) {
        return (
            tags[
                "operator:zh-Hant"
                ] ||
            tags[
                "operator:zh"
                ] ||
            tags.operator
        );
    }

    if (
        language ===
        "ko"
    ) {
        return (
            tags[
                "operator:ko"
                ] ||
            tags.operator
        );
    }

    return tags.operator;
}

/*
 * ============================================
 * Supabaseの料金表示
 * ============================================
 */

function supabasePrice(
    parking:
    SupabaseParking,

    language:
    Language,
) {
    const t =
        TEXT[language];

    /*
     * 日本語なら
     * DBに入れた料金文章をそのまま利用
     */
    if (
        language ===
        "ja" &&
        parking.price_text
    ) {
        return parking.price_text;
    }

    /*
     * 無料が明確なら
     * 各言語の「無料」
     */
    if (
        parking.is_free ===
        true
    ) {
        return t.free;
    }

    /*
     * 有料だと分かる場合
     */
    if (
        parking.is_free ===
        false
    ) {
        return t.paidUnknown;
    }

    return t.priceUnknown;
}

/*
 * ============================================
 * Supabase周辺検索
 *
 * PostGISを使わず、
 * まず緯度経度の四角で絞ってから
 * 正確な距離を計算する。
 * ============================================
 */

async function loadSupabaseParkings(
    lat: number,
    lng: number,
    radius: number,
) {
    /*
     * 緯度1度 ≒ 111.32km
     */
    const latDelta =
        radius /
        111320;

    /*
     * 経度は緯度によって幅が変わる
     */
    const cosLat =
        Math.cos(
            (lat *
                Math.PI) /
            180,
        );

    const safeCosLat =
        Math.max(
            Math.abs(
                cosLat,
            ),
            0.01,
        );

    const lngDelta =
        radius /
        (
            111320 *
            safeCosLat
        );

    const {
        data,
        error,
    } =
        await supabase
            .from(
                "parkings",
            )
            .select("*")
            .gte(
                "latitude",
                lat -
                latDelta,
            )
            .lte(
                "latitude",
                lat +
                latDelta,
            )
            .gte(
                "longitude",
                lng -
                lngDelta,
            )
            .lte(
                "longitude",
                lng +
                lngDelta,
            );

    if (error) {
        console.error(
            "Supabase parking load error:",
            error,
        );

        return [];
    }

    return (
        data ??
        []
    ) as SupabaseParking[];
}

/*
 * ============================================
 * Supabase → API用データ
 * ============================================
 */

function convertSupabaseParking(
    parking:
    SupabaseParking,

    origin: {
        lat: number;
        lng: number;
    },

    language:
    Language,
): ApiParking | null {
    if (
        !Number.isFinite(
            parking.latitude,
        ) ||
        !Number.isFinite(
            parking.longitude,
        )
    ) {
        return null;
    }

    const t =
        TEXT[language];

    const distance =
        distanceMeters(
            origin,
            {
                lat:
                parking.latitude,

                lng:
                parking.longitude,
            },
        );

    const tags:
        string[] = [];

    if (
        parking.security_camera
    ) {
        tags.push(
            t.camera,
        );
    }

    if (
        parking.street_light
    ) {
        tags.push(
            t.light,
        );
    }

    if (
        parking.security_staff
    ) {
        tags.push(
            t.staff,
        );
    }

    if (
        parking.student_friendly
    ) {
        tags.push(
            t.student,
        );
    }

    if (
        tags.length ===
        0
    ) {
        tags.push(
            t.registered,
        );
    }

    const sourceId =
        parking.source_id ??
        `supabase-${parking.id}`;

    return {
        id:
        sourceId,

        sourceId,

        name:
            parking.name ||
            t.parking,

        lat:
        parking.latitude,

        lng:
        parking.longitude,

        price:
            supabasePrice(
                parking,
                language,
            ),

        tags,

        emoji:
            "🅿️",

        photo:
            "",

        distance,

        securityCamera:
            Boolean(
                parking.security_camera,
            ),

        streetLight:
            Boolean(
                parking.street_light,
            ),

        securityStaff:
            Boolean(
                parking.security_staff,
            ),

        safetyScore:
        parking.safety_score,

        studentFriendly:
            Boolean(
                parking.student_friendly,
            ),

        openingHours:
        parking.opening_hours,

        capacity:
        parking.capacity,

        parkingType:
        parking.parking_type,

        note:
        parking.note,

        source:
            parking.source ??
            "supabase",
    };
}

/*
 * ============================================
 * OSM → API用データ
 * ============================================
 */

function convertOsmParking(
    element:
    OverpassElement,

    origin: {
        lat: number;
        lng: number;
    },

    radius:
    number,

    language:
    Language,
): ApiParking | null {
    const tags =
        element.tags ??
        {};

    const parkingLat =
        element.lat ??
        element.center?.lat;

    const parkingLng =
        element.lon ??
        element.center?.lon;

    if (
        parkingLat ===
        undefined ||
        parkingLng ===
        undefined
    ) {
        return null;
    }

    const distance =
        distanceMeters(
            origin,
            {
                lat:
                parkingLat,

                lng:
                parkingLng,
            },
        );

    if (
        distance >
        radius +
        100
    ) {
        return null;
    }

    const access =
        tags.access?.toLowerCase();

    /*
     * 私有・進入禁止などは表示しない
     */
    if (
        access ===
        "private" ||
        access ===
        "no" ||
        access ===
        "emergency"
    ) {
        return null;
    }

    const parkingType =
        tags.parking?.toLowerCase();

    /*
     * 路上駐車系は除外
     */
    if (
        parkingType ===
        "lane" ||
        parkingType ===
        "street_side"
    ) {
        return null;
    }

    const t =
        TEXT[language];

    /*
     * 名前無しPも残す
     */
    const name =
        localizedName(
            tags,
            language,
        ) ??
        t.parking;

    const sourceId =
        `osm-${element.type}-${element.id}`;

    const info:
        string[] = [];

    const operator =
        localizedOperator(
            tags,
            language,
        );

    if (
        operator &&
        operator !==
        name
    ) {
        info.push(
            `${t.operator}: ${operator}`,
        );
    }

    if (
        tags.capacity
    ) {
        info.push(
            `${tags.capacity}${t.spaces}`,
        );
    }

    if (
        tags.fee ===
        "no"
    ) {
        info.push(
            t.free,
        );
    }

    if (
        tags.fee ===
        "yes"
    ) {
        info.push(
            t.paid,
        );
    }

    if (
        access ===
        "customers"
    ) {
        info.push(
            t.customers,
        );
    }

    if (
        parkingType ===
        "surface"
    ) {
        info.push(
            t.surface,
        );
    }

    if (
        parkingType ===
        "multi-storey"
    ) {
        info.push(
            t.multiStorey,
        );
    }

    if (
        parkingType ===
        "underground"
    ) {
        info.push(
            t.underground,
        );
    }

    if (
        parkingType ===
        "rooftop"
    ) {
        info.push(
            t.rooftop,
        );
    }

    if (
        info.length ===
        0
    ) {
        info.push(
            t.registered,
        );
    }

    return {
        id:
        sourceId,

        sourceId,

        name,

        lat:
        parkingLat,

        lng:
        parkingLng,

        price:
            tags.fee ===
            "no"
                ? t.free
                : tags.fee ===
                "yes"
                    ? t.paidUnknown
                    : t.priceUnknown,

        tags:
        info,

        emoji:
            "🅿️",

        photo:
            "",

        distance,

        securityCamera:
            false,

        streetLight:
            false,

        securityStaff:
            false,

        safetyScore:
            null,

        studentFriendly:
            false,

        openingHours:
            tags.opening_hours ??
            null,

        capacity:
            tags.capacity ??
            null,

        parkingType:
            parkingType ??
            null,

        note:
            null,

        source:
            "osm",
    };
}

/*
 * ============================================
 * OSM + Supabase 合体
 * ============================================
 */

function mergeParking(
    osm:
    ApiParking,

    extra:
    SupabaseParking,

    language:
    Language,
): ApiParking {
    const t =
        TEXT[language];

    const extraTags = [
        ...osm.tags,
    ];

    if (
        extra.security_camera &&
        !extraTags.includes(
            t.camera,
        )
    ) {
        extraTags.push(
            t.camera,
        );
    }

    if (
        extra.street_light &&
        !extraTags.includes(
            t.light,
        )
    ) {
        extraTags.push(
            t.light,
        );
    }

    if (
        extra.security_staff &&
        !extraTags.includes(
            t.staff,
        )
    ) {
        extraTags.push(
            t.staff,
        );
    }

    if (
        extra.student_friendly &&
        !extraTags.includes(
            t.student,
        )
    ) {
        extraTags.push(
            t.student,
        );
    }

    return {
        ...osm,

        /*
         * 日本語では
         * Supabaseの名称を優先
         */
        name:
            language ===
            "ja" &&
            extra.name
                ? extra.name
                : osm.name,

        price:
            language ===
            "ja" &&
            extra.price_text
                ? extra.price_text
                : osm.price,

        tags:
        extraTags,

        securityCamera:
            Boolean(
                extra.security_camera,
            ),

        streetLight:
            Boolean(
                extra.street_light,
            ),

        securityStaff:
            Boolean(
                extra.security_staff,
            ),

        safetyScore:
        extra.safety_score,

        studentFriendly:
            Boolean(
                extra.student_friendly,
            ),

        openingHours:
            extra.opening_hours ??
            osm.openingHours,

        capacity:
            extra.capacity ??
            osm.capacity,

        parkingType:
            extra.parking_type ??
            osm.parkingType,

        note:
            extra.note ??
            osm.note,

        source:
            extra.source ??
            osm.source,
    };
}

/*
 * ============================================
 * API
 * ============================================
 */

export async function GET(
    request:
    NextRequest,
) {
    const params =
        request.nextUrl.searchParams;

    const lat =
        Number(
            params.get(
                "lat",
            ),
        );

    const lng =
        Number(
            params.get(
                "lng",
            ),
        );

    const requestedRadius =
        Number(
            params.get(
                "radius",
            ) ??
            "1500",
        );

    const radius =
        Math.min(
            Math.max(
                requestedRadius,
                100,
            ),
            3000,
        );

    const language =
        normalizeLanguage(
            params.get(
                "lang",
            ),
        );

    /*
     * 不正な位置
     */
    if (
        !Number.isFinite(
            lat,
        ) ||
        !Number.isFinite(
            lng,
        ) ||
        !Number.isFinite(
            radius,
        )
    ) {
        return NextResponse.json(
            {
                parkings:
                    [],

                count:
                    0,

                error:
                    "Invalid location",
            },
            {
                status:
                    400,
            },
        );
    }

    const origin = {
        lat,
        lng,
    };

    /*
     * ========================================
     * 先にSupabaseも取得
     *
     * Overpass失敗時の保険にも使う
     * ========================================
     */

    const supabaseRows =
        await loadSupabaseParkings(
            lat,
            lng,
            radius,
        );

    const localSupabase =
        supabaseRows
            .map(
                (
                    parking,
                ) =>
                    convertSupabaseParking(
                        parking,
                        origin,
                        language,
                    ),
            )
            .filter(
                (
                    parking,
                ): parking is ApiParking =>
                    parking !==
                    null,
            )
            .filter(
                (
                    parking,
                ) =>
                    parking.distance <=
                    radius +
                    100,
            );

    /*
     * ========================================
     * Overpass
     * ========================================
     */

    const overpassQuery = `
[out:json][timeout:8];
(
  node["amenity"="parking"](around:${radius},${lat},${lng});
  way["amenity"="parking"](around:${radius},${lat},${lng});
  relation["amenity"="parking"](around:${radius},${lat},${lng});
);
out center tags;
`;

    let overpassData:
        OverpassResponse | null =
        null;

    let overpassError =
        "";

    for (
        const url
        of OVERPASS_URLS
        ) {
        try {
            overpassData =
                await fetchOverpass(
                    url,
                    overpassQuery,
                );

            /*
             * 成功したら終了
             */
            break;
        } catch (error) {
            overpassError =
                error instanceof
                Error
                    ? error.message
                    : "Overpass error";

            console.warn(
                `Overpass failed: ${url}`,
                overpassError,
            );
        }
    }

    /*
     * ========================================
     * Overpass全滅
     *
     * 502を返さずSupabaseへフォールバック
     * ========================================
     */

    if (
        !overpassData
    ) {
        const fallback =
            [...localSupabase];

        fallback.sort(
            (
                a,
                b,
            ) =>
                a.distance -
                b.distance,
        );

        return NextResponse.json(
            {
                parkings:
                    fallback.slice(
                        0,
                        40,
                    ),

                count:
                fallback.length,

                language,

                radius,

                /*
                 * フロントでは
                 * 必須ではないけど確認用
                 */
                sourceMode:
                    "supabase-fallback",

                warning:
                    "OpenStreetMap parking service is temporarily unavailable.",

                /*
                 * 開発中だけ見る用
                 */
                detail:
                overpassError,
            },
        );
    }

    /*
     * ========================================
     * OSM変換
     * ========================================
     */

    const osmParkings =
        (
            overpassData.elements ??
            []
        )
            .map(
                (
                    element,
                ) =>
                    convertOsmParking(
                        element,
                        origin,
                        radius,
                        language,
                    ),
            )
            .filter(
                (
                    parking,
                ): parking is ApiParking =>
                    parking !==
                    null,
            );

    /*
     * ========================================
     * source_idでSupabaseを探す
     * ========================================
     */

    const supabaseBySourceId =
        new Map<
            string,
            SupabaseParking
        >();

    for (
        const row
        of supabaseRows
        ) {
        if (
            row.source_id
        ) {
            supabaseBySourceId.set(
                row.source_id,
                row,
            );
        }
    }

    /*
     * ========================================
     * OSM + Supabase追加情報
     * ========================================
     */

    const mergedOsm =
        osmParkings.map(
            (
                parking,
            ) => {
                const extra =
                    supabaseBySourceId.get(
                        parking.sourceId,
                    );

                if (
                    !extra
                ) {
                    return parking;
                }

                return mergeParking(
                    parking,
                    extra,
                    language,
                );
            },
        );

    /*
     * ========================================
     * OSMと紐づいていないSupabaseデータも
     * 表示対象に追加
     * ========================================
     */

    const osmIds =
        new Set(
            mergedOsm.map(
                (
                    parking,
                ) =>
                    parking.sourceId,
            ),
        );

    const standaloneSupabase =
        localSupabase.filter(
            (
                parking,
            ) =>
                !osmIds.has(
                    parking.sourceId,
                ),
        );

    const all = [
        ...mergedOsm,
        ...standaloneSupabase,
    ];

    /*
     * ========================================
     * 重複除去
     * ========================================
     */

    const uniqueMap =
        new Map<
            string,
            ApiParking
        >();

    for (
        const parking
        of all
        ) {
        if (
            !uniqueMap.has(
                parking.sourceId,
            )
        ) {
            uniqueMap.set(
                parking.sourceId,
                parking,
            );
        }
    }

    const unique =
        Array.from(
            uniqueMap.values(),
        );

    /*
     * 近い順
     */
    unique.sort(
        (
            a,
            b,
        ) =>
            a.distance -
            b.distance,
    );

    return NextResponse.json(
        {
            parkings:
                unique.slice(
                    0,
                    40,
                ),

            count:
            unique.length,

            language,

            radius,

            sourceMode:
                "osm+supabase",
        },
    );
}