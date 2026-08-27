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

    /*
     * ========================================
     * タグ追加
     * ========================================
     */

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

    /*
     * ========================================
     * 月極
     * ========================================
     */

    const rentalType =
        extra.rental_type ??
        osm.rentalType ??
        "hourly";

    const monthlyPrice =
        extra.monthly_price ??
        osm.monthlyPrice ??
        null;

    if (
        rentalType ===
        "monthly" &&
        !extraTags.includes(
            "月極",
        )
    ) {
        extraTags.push(
            "月極",
        );
    }

    /*
     * ========================================
     * 料金
     * ========================================
     */

    let price =
        osm.price;

    if (
        rentalType ===
        "monthly" &&
        monthlyPrice !==
        null
    ) {
        price =
            `月額 ${monthlyPrice.toLocaleString(
                "ja-JP",
            )}円`;
    } else if (
        language ===
        "ja" &&
        extra.price_text
    ) {
        price =
            extra.price_text;
    }

    return {
        ...osm,

        name:
            language ===
            "ja" &&
            extra.name
                ? extra.name
                : osm.name,

        price,

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

        /*
         * ====================================
         * 駐車場の特徴
         * ====================================
         */

        isPaid:
            extra.is_paid ??
            osm.isPaid,

        isHidden:
            extra.is_hidden ??
            osm.isHidden,

        isIndoor:
            extra.is_indoor ??
            osm.isIndoor,

        isFacility:
            extra.is_facility ??
            osm.isFacility,

        isAccessible:
            extra.is_accessible ??
            osm.isAccessible,

        /*
         * ====================================
         * 月極
         * ====================================
         */

        rentalType,

        monthlyPrice,
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
                     * 同じ駐車場
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
 * 駐車場の優先順位
 * ============================================
 *
 * 0 = 学生向け・学校向け
 * 1 = 月極
 * 2 = 一般の時間貸し
 * 3 = 店舗・施設利用者向け
 *
 * 数字が小さいほど
 * おすすめ上位に表示する
 * ============================================
 */

function parkingPriority(
    parking:
    ApiParking,
) {
    /*
     * ========================================
     * 0
     * 学生向け・学校向け
     * ========================================
     */

    if (
        parking.studentFriendly
    ) {
        return 0;
    }

    /*
     * ========================================
     * 1
     * 月極
     * ========================================
     */

    if (
        parking.rentalType ===
        "monthly"
    ) {
        return 1;
    }

    /*
     * ========================================
     * 3
     * 店舗・施設利用者向け
     * ========================================
     */

    if (
        parking.isFacility
    ) {
        return 3;
    }

    /*
     * ========================================
     * 2
     * 一般の時間貸し
     * ========================================
     */

    return 2;
}

/*
 * ============================================
 * ParkPalおすすめ順
 * ============================================
 *
 * ① 学生向け・学校向け
 * ② 月極
 * ③ 一般の時間貸し
 * ④ 施設利用者向け
 *
 * 同じ種類の中では
 * 学校・塾から近い順
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
        ) => {
            /*
             * ====================================
             * まず種類で比較
             * ====================================
             */

            const priorityA =
                parkingPriority(
                    a,
                );

            const priorityB =
                parkingPriority(
                    b,
                );

            if (
                priorityA !==
                priorityB
            ) {
                return (
                    priorityA -
                    priorityB
                );
            }

            /*
             * ====================================
             * 同じ種類なら距離順
             * ====================================
             */

            return (
                a.distance -
                b.distance
            );
        },
    );
}