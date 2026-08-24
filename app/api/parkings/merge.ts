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
 * OSM + Supabase の情報を合体
 * ============================================
 */

export function mergeParking(
    osm: ApiParking,
    extra: SupabaseParking,
    language: Language,
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

        name:
            language === "ja" &&
            extra.name
                ? extra.name
                : osm.name,

        price:
            language === "ja" &&
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
 * 重複判定用に名前を整える
 * ============================================
 */

function normalizeParkingName(
    name: string,
) {
    return name
        .trim()
        .toLowerCase()
        .replaceAll(
            " ",
            "",
        )
        .replaceAll(
            "　",
            "",
        );
}

/*
 * ============================================
 * 駐車場の重複を削除
 * ============================================
 *
 * 1. sourceId が同じ
 * 2. 名前が同じ
 * 3. 25m以内
 *
 * のどれかで
 * 同じ駐車場とみなす
 * ============================================
 */

export function removeDuplicateParkings(
    parkings:
    ApiParking[],
) {
    const unique:
        ApiParking[] =
        [];

    for (
        const parking
        of parkings
        ) {
        const duplicate =
            unique.some(
                (
                    existing,
                ) => {
                    /*
                     * sourceIdが同じ
                     */
                    if (
                        existing.sourceId ===
                        parking.sourceId
                    ) {
                        return true;
                    }

                    /*
                     * 名前を比較
                     */
                    const sameName =
                        normalizeParkingName(
                            existing.name,
                        ) ===
                        normalizeParkingName(
                            parking.name,
                        );

                    if (
                        !sameName
                    ) {
                        return false;
                    }

                    /*
                     * 同名で25m以内なら
                     * 同じ駐車場とみなす
                     */
                    const distance =
                        distanceMeters(
                            {
                                lat:
                                existing.lat,

                                lng:
                                existing.lng,
                            },

                            {
                                lat:
                                parking.lat,

                                lng:
                                parking.lng,
                            },
                        );

                    return (
                        distance <=
                        25
                    );
                },
            );

        if (
            !duplicate
        ) {
            unique.push(
                parking,
            );
        }
    }

    return unique;
}

/*
 * ============================================
 * 距離順に並べる
 * ============================================
 */

export function sortParkingsByDistance(
    parkings:
    ApiParking[],
) {
    return [
        ...parkings,
    ].sort(
        (
            a,
            b,
        ) =>
            a.distance -
            b.distance,
    );
}