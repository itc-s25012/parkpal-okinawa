import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { supabase } from "@/lib/supabase";

const execFileAsync = promisify(execFile);

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

function distanceMeters(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
) {
    const R = 6371000;
    const rad = (n: number) => (n * Math.PI) / 180;

    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);

    const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) *
        Math.cos(rad(b.lat)) *
        Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(s));
}

async function fetchOverpass(
    url: string,
    query: string,
): Promise<OverpassResponse> {
    const { stdout } = await execFileAsync(
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
            maxBuffer: 10 * 1024 * 1024,
        },
    );

    return JSON.parse(stdout) as OverpassResponse;
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const lat = Number(params.get("lat"));
    const lng = Number(params.get("lng"));
    const radius = Math.min(
        Number(params.get("radius") ?? "1500"),
        3000,
    );

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        !Number.isFinite(radius)
    ) {
        return NextResponse.json(
            {
                error: "位置情報が正しくありません",
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

    let data: OverpassResponse | null = null;
    let lastError = "";

    for (const url of OVERPASS_URLS) {
        try {
            data = await fetchOverpass(url, query);
            break;
        } catch (error) {
            lastError =
                error instanceof Error
                    ? error.message
                    : "Overpass取得失敗";
        }
    }

    if (!data) {
        return NextResponse.json(
            {
                error: "駐車場情報を取得できませんでした",
                detail: lastError,
            },
            {
                status: 502,
            },
        );
    }

    const origin = { lat, lng };

    const osmParkings = (data.elements ?? [])
        .map((element) => {
            const tags = element.tags ?? {};

            const parkingLat =
                element.lat ?? element.center?.lat;

            const parkingLng =
                element.lon ?? element.center?.lon;

            if (
                parkingLat === undefined ||
                parkingLng === undefined
            ) {
                return null;
            }

            const point = {
                lat: parkingLat,
                lng: parkingLng,
            };

            const distance =
                distanceMeters(origin, point);

            if (distance > radius + 100) {
                return null;
            }

            const access =
                tags.access?.toLowerCase();

            if (
                access === "private" ||
                access === "no" ||
                access === "emergency"
            ) {
                return null;
            }

            const parkingType =
                tags.parking?.toLowerCase();

            if (
                parkingType === "lane" ||
                parkingType === "street_side"
            ) {
                return null;
            }

            const rawName =
                tags.name?.trim() ||
                tags.operator?.trim() ||
                tags.brand?.trim();

            if (!rawName) {
                return null;
            }

            const sourceId =
                `osm-${element.type}-${element.id}`;

            const info: string[] = [];

            if (
                tags.operator &&
                tags.operator !== rawName
            ) {
                info.push(
                    `運営: ${tags.operator}`,
                );
            }

            if (tags.capacity) {
                info.push(
                    `${tags.capacity}台`,
                );
            }

            if (tags.fee === "no") {
                info.push("無料");
            } else if (tags.fee === "yes") {
                info.push("有料");
            }

            if (tags.access === "customers") {
                info.push("施設利用者向け");
            }

            if (parkingType === "surface") {
                info.push("平面駐車場");
            }

            if (parkingType === "multi-storey") {
                info.push("立体駐車場");
            }

            if (parkingType === "underground") {
                info.push("地下駐車場");
            }

            if (info.length === 0) {
                info.push(
                    "OpenStreetMap登録駐車場",
                );
            }

            return {
                id: sourceId,
                sourceId,
                name: rawName,
                lat: parkingLat,
                lng: parkingLng,
                price:
                    tags.fee === "no"
                        ? "無料"
                        : tags.fee === "yes"
                            ? "有料・料金未登録"
                            : "料金情報なし",
                tags: info,
                emoji: "🅿️",
                photo: "",
                distance,
                osm: {
                    capacity:
                        tags.capacity ?? null,
                    parkingType:
                        parkingType ?? null,
                    openingHours:
                        tags.opening_hours ?? null,
                },
            };
        })
        .filter(
            (
                parking,
            ): parking is NonNullable<
                typeof parking
            > => parking !== null,
        );

    const sourceIds = osmParkings.map(
        (parking) => parking.sourceId,
    );

    let supabaseParkings:
        SupabaseParking[] = [];

    if (sourceIds.length > 0) {
        const {
            data: supabaseData,
            error: supabaseError,
        } = await supabase
            .from("parkings")
            .select("*")
            .in("source_id", sourceIds);

        if (supabaseError) {
            console.error(
                "Supabase parking merge error:",
                supabaseError,
            );
        } else {
            supabaseParkings =
                (supabaseData ??
                    []) as SupabaseParking[];
        }
    }

    const merged = osmParkings.map(
        (parking) => {
            const extra =
                supabaseParkings.find(
                    (row) =>
                        row.source_id ===
                        parking.sourceId,
                );

            if (!extra) {
                return {
                    ...parking,
                    securityCamera: false,
                    streetLight: false,
                    securityStaff: false,
                    safetyScore: null,
                    studentFriendly: false,
                    openingHours:
                    parking.osm.openingHours,
                    capacity:
                    parking.osm.capacity,
                    parkingType:
                    parking.osm.parkingType,
                    note: null,
                    source: "osm",
                };
            }

            const extraTags = [
                ...parking.tags,
            ];

            if (extra.security_camera) {
                extraTags.push(
                    "📷 防犯カメラあり",
                );
            }

            if (extra.street_light) {
                extraTags.push(
                    "💡 街灯あり",
                );
            }

            if (extra.security_staff) {
                extraTags.push(
                    "🛡️ 管理スタッフあり",
                );
            }

            if (extra.student_friendly) {
                extraTags.push(
                    "🎓 学生向け",
                );
            }

            return {
                ...parking,
                name:
                    extra.name ||
                    parking.name,
                price:
                    extra.price_text ||
                    parking.price,
                tags: extraTags,
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
                    parking.osm.openingHours,
                capacity:
                    extra.capacity ??
                    parking.osm.capacity,
                parkingType:
                    extra.parking_type ||
                    parking.osm.parkingType,
                note:
                extra.note,
                source:
                    extra.source ||
                    "osm",
            };
        },
    );

    const unique = merged.filter(
        (
            parking,
            index,
            array,
        ) =>
            array.findIndex(
                (other) =>
                    other.name ===
                    parking.name &&
                    Math.abs(
                        other.lat -
                        parking.lat,
                    ) < 0.0002 &&
                    Math.abs(
                        other.lng -
                        parking.lng,
                    ) < 0.0002,
            ) === index,
    );

    unique.sort(
        (a, b) =>
            a.distance -
            b.distance,
    );

    return NextResponse.json({
        parkings: unique.slice(
            0,
            30,
        ),
        count: unique.length,
    });
}