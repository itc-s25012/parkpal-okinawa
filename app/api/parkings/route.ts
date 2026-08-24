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

const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
];

const TEXT = {
    ja: {
        operator: "運営",
        spaces: "台",
        free: "無料",
        paid: "有料",
        paidUnknown: "有料・料金未登録",
        priceUnknown: "料金情報なし",
        customers: "施設利用者向け",
        surface: "平面駐車場",
        multiStorey: "立体駐車場",
        underground: "地下駐車場",
        rooftop: "屋上駐車場",
        registered: "OpenStreetMap登録駐車場",
        camera: "📷 防犯カメラあり",
        light: "💡 街灯あり",
        staff: "🛡️ 管理スタッフあり",
        student: "🎓 学生向け",
    },

    en: {
        operator: "Operator",
        spaces: " spaces",
        free: "Free",
        paid: "Paid",
        paidUnknown: "Paid · Price unavailable",
        priceUnknown: "Price unavailable",
        customers: "Customers only",
        surface: "Surface parking",
        multiStorey: "Multi-storey parking",
        underground: "Underground parking",
        rooftop: "Rooftop parking",
        registered: "OpenStreetMap parking",
        camera: "📷 Security camera",
        light: "💡 Lighting available",
        staff: "🛡️ Staff on site",
        student: "🎓 Student friendly",
    },

    "zh-CN": {
        operator: "运营",
        spaces: "个车位",
        free: "免费",
        paid: "收费",
        paidUnknown: "收费 · 暂无价格信息",
        priceUnknown: "暂无价格信息",
        customers: "仅限设施用户",
        surface: "地面停车场",
        multiStorey: "立体停车场",
        underground: "地下停车场",
        rooftop: "屋顶停车场",
        registered: "OpenStreetMap登记停车场",
        camera: "📷 有监控摄像头",
        light: "💡 有照明",
        staff: "🛡️ 有管理人员",
        student: "🎓 学生友好",
    },

    "zh-TW": {
        operator: "營運",
        spaces: "個車位",
        free: "免費",
        paid: "收費",
        paidUnknown: "收費 · 暫無價格資訊",
        priceUnknown: "暫無價格資訊",
        customers: "僅限設施使用者",
        surface: "平面停車場",
        multiStorey: "立體停車場",
        underground: "地下停車場",
        rooftop: "屋頂停車場",
        registered: "OpenStreetMap登記停車場",
        camera: "📷 有監視器",
        light: "💡 有照明",
        staff: "🛡️ 有管理人員",
        student: "🎓 學生友善",
    },

    ko: {
        operator: "운영",
        spaces: "대",
        free: "무료",
        paid: "유료",
        paidUnknown: "유료 · 요금 정보 없음",
        priceUnknown: "요금 정보 없음",
        customers: "시설 이용자 전용",
        surface: "평면 주차장",
        multiStorey: "입체 주차장",
        underground: "지하 주차장",
        rooftop: "옥상 주차장",
        registered: "OpenStreetMap 등록 주차장",
        camera: "📷 방범 카메라 있음",
        light: "💡 조명 있음",
        staff: "🛡️ 관리 직원 있음",
        student: "🎓 학생 친화",
    },
} satisfies Record<Language, Record<string, string>>;

function normalizeLanguage(value: string | null): Language {
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

function distanceMeters(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
) {
    const R = 6371000;

    const rad = (value: number) =>
        (value * Math.PI) / 180;

    const dLat =
        rad(b.lat - a.lat);

    const dLng =
        rad(b.lng - a.lng);

    const value =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) *
        Math.cos(rad(b.lat)) *
        Math.sin(dLng / 2) ** 2;

    return (
        2 *
        R *
        Math.asin(
            Math.sqrt(value),
        )
    );
}

async function fetchOverpass(
    url: string,
    query: string,
): Promise<OverpassResponse> {
    const { stdout } =
        await execFileAsync(
            "curl",
            [
                "-sS",
                "--max-time",
                "20",
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
                    10 *
                    1024 *
                    1024,
            },
        );

    return JSON.parse(
        stdout,
    ) as OverpassResponse;
}

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
    tags: Record<string, string>,
    language: Language,
) {
    const base =
        tags.name?.trim() ||
        tags.operator?.trim() ||
        tags.brand?.trim();

    if (!base) {
        return null;
    }

    if (language === "ja") {
        return (
            tags["name:ja"]?.trim() ||
            base
        );
    }

    if (language === "en") {
        return (
            tags["name:en"]?.trim() ||
            tags["brand:en"]?.trim() ||
            tags["operator:en"]?.trim() ||
            englishBrandFallback(base)
        );
    }

    if (language === "zh-CN") {
        return (
            tags["name:zh-Hans"]?.trim() ||
            tags["name:zh"]?.trim() ||
            tags["brand:zh"]?.trim() ||
            base
        );
    }

    if (language === "zh-TW") {
        return (
            tags["name:zh-Hant"]?.trim() ||
            tags["name:zh"]?.trim() ||
            tags["brand:zh"]?.trim() ||
            base
        );
    }

    if (language === "ko") {
        return (
            tags["name:ko"]?.trim() ||
            tags["brand:ko"]?.trim() ||
            base
        );
    }

    return base;
}

function localizedOperator(
    tags: Record<string, string>,
    language: Language,
) {
    if (language === "ja") {
        return (
            tags["operator:ja"] ||
            tags.operator
        );
    }

    if (language === "en") {
        return (
            tags["operator:en"] ||
            tags.operator
        );
    }

    if (language === "zh-CN") {
        return (
            tags["operator:zh-Hans"] ||
            tags["operator:zh"] ||
            tags.operator
        );
    }

    if (language === "zh-TW") {
        return (
            tags["operator:zh-Hant"] ||
            tags["operator:zh"] ||
            tags.operator
        );
    }

    if (language === "ko") {
        return (
            tags["operator:ko"] ||
            tags.operator
        );
    }

    return tags.operator;
}

export async function GET(
    request: NextRequest,
) {
    const params =
        request.nextUrl.searchParams;

    const lat =
        Number(
            params.get("lat"),
        );

    const lng =
        Number(
            params.get("lng"),
        );

    const radius =
        Math.min(
            Number(
                params.get("radius") ??
                "1500",
            ),
            3000,
        );

    const language =
        normalizeLanguage(
            params.get("lang"),
        );

    const t =
        TEXT[language];

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        !Number.isFinite(radius)
    ) {
        return NextResponse.json(
            {
                error:
                    "Invalid location",
            },
            {
                status: 400,
            },
        );
    }

    const query = `
[out:json][timeout:20];
(
  node["amenity"="parking"](around:${radius},${lat},${lng});
  way["amenity"="parking"](around:${radius},${lat},${lng});
  relation["amenity"="parking"](around:${radius},${lat},${lng});
);
out center tags;
`;

    let data:
        | OverpassResponse
        | null = null;

    let lastError = "";

    for (
        const url
        of OVERPASS_URLS
        ) {
        try {
            data =
                await fetchOverpass(
                    url,
                    query,
                );

            break;
        } catch (error) {
            lastError =
                error instanceof Error
                    ? error.message
                    : "Overpass error";
        }
    }

    if (!data) {
        return NextResponse.json(
            {
                error:
                    "Parking data could not be loaded",
                detail:
                lastError,
            },
            {
                status: 502,
            },
        );
    }

    const origin = {
        lat,
        lng,
    };

    const osmParkings =
        (data.elements ?? [])
            .map(
                (
                    element,
                ) => {
                    const tags =
                        element.tags ??
                        {};

                    const parkingLat =
                        element.lat ??
                        element.center
                            ?.lat;

                    const parkingLng =
                        element.lon ??
                        element.center
                            ?.lon;

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
                        radius + 100
                    ) {
                        return null;
                    }

                    const access =
                        tags.access
                            ?.toLowerCase();

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
                        tags.parking
                            ?.toLowerCase();

                    if (
                        parkingType ===
                        "lane" ||
                        parkingType ===
                        "street_side"
                    ) {
                        return null;
                    }

                    const name =
                        localizedName(
                            tags,
                            language,
                        );

                    if (!name) {
                        return null;
                    }

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
                        if (
                            language ===
                            "en"
                        ) {
                            info.push(
                                `${tags.capacity}${t.spaces}`,
                            );
                        } else {
                            info.push(
                                `${tags.capacity}${t.spaces}`,
                            );
                        }
                    }

                    if (
                        tags.fee ===
                        "no"
                    ) {
                        info.push(
                            t.free,
                        );
                    } else if (
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

                        osm: {
                            capacity:
                                tags.capacity ??
                                null,

                            parkingType:
                                parkingType ??
                                null,

                            openingHours:
                                tags.opening_hours ??
                                null,
                        },
                    };
                },
            )
            .filter(
                (
                    parking,
                ): parking is NonNullable<
                    typeof parking
                > =>
                    parking !==
                    null,
            );

    const sourceIds =
        osmParkings.map(
            (
                parking,
            ) =>
                parking.sourceId,
        );

    let supabaseParkings:
        SupabaseParking[] = [];

    if (
        sourceIds.length >
        0
    ) {
        const {
            data:
                supabaseData,
            error:
                supabaseError,
        } =
            await supabase
                .from(
                    "parkings",
                )
                .select("*")
                .in(
                    "source_id",
                    sourceIds,
                );

        if (
            supabaseError
        ) {
            console.error(
                "Supabase merge error:",
                supabaseError,
            );
        } else {
            supabaseParkings =
                (supabaseData ??
                    []) as SupabaseParking[];
        }
    }

    const merged =
        osmParkings.map(
            (
                parking,
            ) => {
                const extra =
                    supabaseParkings.find(
                        (
                            row,
                        ) =>
                            row.source_id ===
                            parking.sourceId,
                    );

                if (
                    !extra
                ) {
                    return {
                        ...parking,

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
                        parking
                            .osm
                            .openingHours,

                        capacity:
                        parking
                            .osm
                            .capacity,

                        parkingType:
                        parking
                            .osm
                            .parkingType,

                        note:
                            null,

                        source:
                            "osm",
                    };
                }

                const extraTags =
                    [
                        ...parking.tags,
                    ];

                if (
                    extra.security_camera
                ) {
                    extraTags.push(
                        t.camera,
                    );
                }

                if (
                    extra.street_light
                ) {
                    extraTags.push(
                        t.light,
                    );
                }

                if (
                    extra.security_staff
                ) {
                    extraTags.push(
                        t.staff,
                    );
                }

                if (
                    extra.student_friendly
                ) {
                    extraTags.push(
                        t.student,
                    );
                }

                return {
                    ...parking,

                    name:
                        language ===
                        "ja"
                            ? extra.name ||
                            parking.name
                            : parking.name,

                    price:
                        extra.price_text &&
                        language ===
                        "ja"
                            ? extra.price_text
                            : parking.price,

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
                        extra.opening_hours ||
                        parking
                            .osm
                            .openingHours,

                    capacity:
                        extra.capacity ??
                        parking
                            .osm
                            .capacity,

                    parkingType:
                        extra.parking_type ||
                        parking
                            .osm
                            .parkingType,

                    note:
                    extra.note,

                    source:
                        extra.source ||
                        "osm",
                };
            },
        );

    const unique =
        merged.filter(
            (
                parking,
                index,
                array,
            ) =>
                array.findIndex(
                    (
                        other,
                    ) =>
                        other.sourceId ===
                        parking.sourceId,
                ) === index,
        );

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
                    30,
                ),

            count:
            unique.length,

            language,
        },
    );
}