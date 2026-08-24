import {
    NextRequest,
    NextResponse,
} from "next/server";

import type {
    ApiParking,
    SupabaseParking,
} from "./types";

import {
    normalizeLanguage,
} from "./translations";

import {
    loadOverpassParkings,
} from "./overpass";

import {
    convertOsmParking,
} from "./osm";

import {
    loadSupabaseParkings,
    convertSupabaseParking,
} from "./supabase";

import {
    mergeParking,
    removeDuplicateParkings,
    sortParkingsByDistance,
} from "./merge";

/*
 * ============================================
 * 駐車場API
 * ============================================
 */

export async function GET(
    request: NextRequest,
) {
    /*
     * ========================================
     * URLから検索条件を取得
     * ========================================
     */

    const params =
        request.nextUrl
            .searchParams;

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

    /*
     * 最小100m
     * 最大3000m
     */
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
     * ========================================
     * 緯度経度チェック
     * ========================================
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
                parkings: [],
                count: 0,
                error:
                    "Invalid location",
            },
            {
                status: 400,
            },
        );
    }

    const origin = {
        lat,
        lng,
    };

    /*
     * ========================================
     * Supabaseから取得
     * ========================================
     *
     * Overpassが失敗した場合でも
     * Supabaseの駐車場は表示できる
     * ========================================
     */

    const supabaseRows =
        await loadSupabaseParkings(
            lat,
            lng,
            radius,
        );

    /*
     * Supabaseのデータを
     * ParkPal形式に変換
     */
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
                    radius + 100,
            );

    /*
     * ========================================
     * OverpassからOSM駐車場を取得
     * ========================================
     */

    const {
        data:
            overpassData,

        error:
            overpassError,
    } =
        await loadOverpassParkings(
            lat,
            lng,
            radius,
        );

    /*
     * ========================================
     * Overpassが全部失敗した場合
     * ========================================
     *
     * API自体をエラーにせず
     * Supabaseの駐車場だけ返す
     * ========================================
     */

    if (
        !overpassData
    ) {
        const fallback =
            sortParkingsByDistance(
                removeDuplicateParkings(
                    localSupabase,
                ),
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

                sourceMode:
                    "supabase-fallback",

                warning:
                    "OpenStreetMap parking service is temporarily unavailable.",

                detail:
                overpassError,
            },
        );
    }

    /*
     * ========================================
     * OSM → ParkPal形式
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
     * Supabaseデータを
     * source_idから探せるようにする
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
     * OSM + Supabase
     * ========================================
     *
     * OSMの駐車場に
     * Supabaseの安全情報などを追加する
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

                /*
                 * Supabaseに追加情報が
                 * なければOSMのまま
                 */
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
     * Supabase単独の駐車場
     * ========================================
     *
     * OSMに紐づいていない
     * Supabaseデータも表示する
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

    /*
     * ========================================
     * 全駐車場を合体
     * ========================================
     */

    const allParkings = [
        ...mergedOsm,
        ...standaloneSupabase,
    ];

    /*
     * ========================================
     * 重複削除
     * ========================================
     */

    const uniqueParkings =
        removeDuplicateParkings(
            allParkings,
        );

    /*
     * ========================================
     * 近い順
     * ========================================
     */

    const sortedParkings =
        sortParkingsByDistance(
            uniqueParkings,
        );

    /*
     * ========================================
     * フロントへ返す
     * ========================================
     */

    return NextResponse.json(
        {
            parkings:
                sortedParkings.slice(
                    0,
                    40,
                ),

            count:
            sortedParkings.length,

            language,

            radius,

            sourceMode:
                "osm+supabase",
        },
    );
}