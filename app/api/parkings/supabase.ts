import {
    supabase,
} from "@/lib/supabase";

import type {
    ApiParking,
    Language,
    SupabaseParking,
} from "./types";

import {
    TEXT,
} from "./translations";

import {
    distanceMeters,
} from "./distance";

/*
 * ============================================
 * キャッシュ型
 * ============================================
 */

type ParkingSearchCacheRow = {
    id: number;

    search_key: string;

    lat: number;
    lng: number;

    radius: number;

    parkings: ApiParking[];

    created_at: string;
    updated_at: string;
};

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
        TEXT[
            language
            ];

    if (
        language ===
        "ja" &&
        parking.price_text
    ) {
        return parking.price_text;
    }

    if (
        parking.is_free ===
        true
    ) {
        return t.free;
    }

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
 * 検索キャッシュのキーを作る
 * ============================================
 *
 * 緯度経度は小数4桁までにして、
 * ほぼ同じ場所の検索を
 * 同じキャッシュとして扱う。
 * ============================================
 */

export function createParkingSearchKey(
    lat:
    number,

    lng:
    number,

    radius:
    number,
) {
    return [
        lat.toFixed(
            4,
        ),

        lng.toFixed(
            4,
        ),

        String(
            radius,
        ),
    ].join(
        ":",
    );
}

/*
 * ============================================
 * キャッシュ取得
 * ============================================
 */

export async function getParkingSearchCache(
    lat:
    number,

    lng:
    number,

    radius:
    number,
) {
    const searchKey =
        createParkingSearchKey(
            lat,
            lng,
            radius,
        );

    const {
        data,
        error,
    } =
        await supabase
            .from(
                "parking_search_cache",
            )
            .select(
                "*",
            )
            .eq(
                "search_key",
                searchKey,
            )
            .maybeSingle();

    if (
        error
    ) {
        console.error(
            "Parking cache load error:",
            error,
        );

        return null;
    }

    if (
        !data
    ) {
        return null;
    }

    return data as ParkingSearchCacheRow;
}

/*
 * ============================================
 * キャッシュ保存
 * ============================================
 */

export async function saveParkingSearchCache(
    lat:
    number,

    lng:
    number,

    radius:
    number,

    parkings:
    ApiParking[],
) {
    /*
     * 空の検索結果は保存しない。
     *
     * 一時的なOverpass障害で
     * 空データをキャッシュしないため。
     */
    if (
        parkings.length ===
        0
    ) {
        return;
    }

    const searchKey =
        createParkingSearchKey(
            lat,
            lng,
            radius,
        );

    const {
        error,
    } =
        await supabase
            .from(
                "parking_search_cache",
            )
            .upsert(
                {
                    search_key:
                    searchKey,

                    lat,

                    lng,

                    radius,

                    parkings,

                    updated_at:
                        new Date()
                            .toISOString(),
                },
                {
                    onConflict:
                        "search_key",
                },
            );

    if (
        error
    ) {
        console.error(
            "Parking cache save error:",
            error,
        );
    }
}

/*
 * ============================================
 * キャッシュが新しいか
 * ============================================
 */

export function isParkingCacheFresh(
    cache:
    ParkingSearchCacheRow,

    maxAgeMinutes =
    60,
) {
    const updated =
        new Date(
            cache.updated_at,
        ).getTime();

    const now =
        Date.now();

    const ageMinutes =
        (
            now -
            updated
        ) /
        1000 /
        60;

    return (
        ageMinutes <=
        maxAgeMinutes
    );
}

/*
 * ============================================
 * Supabaseから周辺駐車場を取得
 * ============================================
 */

export async function loadSupabaseParkings(
    lat:
    number,

    lng:
    number,

    radius:
    number,
) {
    const latDelta =
        radius /
        111320;

    const cosLat =
        Math.cos(
            (
                lat *
                Math.PI
            ) /
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
            .select(
                "*",
            )
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

    if (
        error
    ) {
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
 * Supabase → ParkPal形式
 * ============================================
 */

export function convertSupabaseParking(
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
        TEXT[
            language
            ];

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
        string[] =
        [];

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

        /*
         * ========================================
         * 駐車場の特徴
         * ========================================
         */

        isPaid:
            Boolean(
                parking.is_paid,
            ),

        isHidden:
            Boolean(
                parking.is_hidden,
            ),

        isIndoor:
            Boolean(
                parking.is_indoor,
            ),

        isFacility:
            Boolean(
                parking.is_facility,
            ),

        isAccessible:
            Boolean(
                parking.is_accessible,
            ),
    };
}