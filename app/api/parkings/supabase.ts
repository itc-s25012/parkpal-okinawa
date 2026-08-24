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

    /*
     * 日本語なら
     * Supabaseに保存してある
     * 料金文章をそのまま使う
     */
    if (
        language ===
        "ja" &&
        parking.price_text
    ) {
        return parking.price_text;
    }

    /*
     * 無料
     */
    if (
        parking.is_free ===
        true
    ) {
        return t.free;
    }

    /*
     * 有料
     */
    if (
        parking.is_free ===
        false
    ) {
        return t.paidUnknown;
    }

    /*
     * 情報なし
     */
    return t.priceUnknown;
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
    /*
     * 緯度1度 ≒ 111.32km
     */
    const latDelta =
        radius /
        111320;

    /*
     * 経度は緯度によって
     * 1度あたりの距離が変わる
     */
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
    /*
     * 緯度経度が壊れていたら
     * 使わない
     */
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

    /*
     * 目的地からの距離
     */
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

    /*
     * 駐車場カードに出すタグ
     */
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

    /*
     * 特別な情報がなければ
     * 登録駐車場と表示
     */
    if (
        tags.length ===
        0
    ) {
        tags.push(
            t.registered,
        );
    }

    /*
     * OSMのsource_idがあればそれを使う。
     * なければSupabase専用IDを作る。
     */
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