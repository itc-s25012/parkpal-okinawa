import type {
    Landmark,
} from "@/lib/landmark-types";

/*
 * ============================================
 * 専門学校
 * ============================================
 */

import {
    NORTH_VOCATIONAL_SCHOOLS,
} from "@/lib/vocational/north";

import {
    CENTRAL_VOCATIONAL_SCHOOLS,
} from "@/lib/vocational/central";

import {
    SOUTH_VOCATIONAL_SCHOOLS,
} from "@/lib/vocational/south";

/*
 * ============================================
 * 塾・予備校
 * ============================================
 */

import {
    NORTH_CRAM_SCHOOLS,
} from "@/lib/cram/north";

import {
    CENTRAL_CRAM_SCHOOLS,
} from "@/lib/cram/central";

import {
    SOUTH_CRAM_SCHOOLS,
} from "@/lib/cram/south";

/*
 * ============================================
 * エリア
 * ============================================
 */

import {
    NORTH_AREAS,
} from "@/lib/areas/north";

import {
    CENTRAL_AREAS,
} from "@/lib/areas/central";

import {
    SOUTH_AREAS,
} from "@/lib/areas/south";

/*
 * ============================================
 * 観光地
 * ============================================
 */

import {
    NORTH_TOURIST_SPOTS,
} from "@/lib/tourist/north";

import {
    CENTRAL_TOURIST_SPOTS,
} from "@/lib/tourist/central";

import {
    SOUTH_TOURIST_SPOTS,
} from "@/lib/tourist/south";

/*
 * ============================================
 * Landmark型
 * ============================================
 */

export type {
    Landmark,
} from "@/lib/landmark-types";

/*
 * ============================================
 * 専門学校
 * ============================================
 */

export const VOCATIONAL_SCHOOLS:
    Landmark[] = [
    ...NORTH_VOCATIONAL_SCHOOLS,
    ...CENTRAL_VOCATIONAL_SCHOOLS,
    ...SOUTH_VOCATIONAL_SCHOOLS,
];

/*
 * ============================================
 * 塾・予備校
 * ============================================
 */

export const CRAM_SCHOOLS:
    Landmark[] = [
    ...NORTH_CRAM_SCHOOLS,
    ...CENTRAL_CRAM_SCHOOLS,
    ...SOUTH_CRAM_SCHOOLS,
];

/*
 * ============================================
 * エリア
 * ============================================
 */

export const AREAS:
    Landmark[] = [
    ...NORTH_AREAS,
    ...CENTRAL_AREAS,
    ...SOUTH_AREAS,
];

/*
 * ============================================
 * 観光地
 * ============================================
 */

export const TOURIST_SPOTS:
    Landmark[] = [
    ...NORTH_TOURIST_SPOTS,
    ...CENTRAL_TOURIST_SPOTS,
    ...SOUTH_TOURIST_SPOTS,
];

/*
 * ============================================
 * 検索対象
 * ============================================
 */

export const ALL_LANDMARKS:
    Landmark[] = [
    ...VOCATIONAL_SCHOOLS,
    ...CRAM_SCHOOLS,
    ...AREAS,
    ...TOURIST_SPOTS,
];

/*
 * ============================================
 * 距離計算
 * ============================================
 */

export function distanceMeters(
    a: {
        lat: number;
        lng: number;
    },

    b: {
        lat: number;
        lng: number;
    },
): number {
    const R =
        6371000;

    const toRad =
        (
            degree:
            number,
        ) =>
            (
                degree *
                Math.PI
            ) /
            180;

    const dLat =
        toRad(
            b.lat -
            a.lat,
        );

    const dLng =
        toRad(
            b.lng -
            a.lng,
        );

    const value =
        Math.sin(
            dLat / 2,
        ) **
        2 +
        Math.cos(
            toRad(
                a.lat,
            ),
        ) *
        Math.cos(
            toRad(
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
 * 徒歩時間
 * ============================================
 */

export function walkMinutes(
    meters:
    number,
) {
    return Math.max(
        1,

        Math.round(
            meters /
            80,
        ),
    );
}

/*
 * ============================================
 * 車移動時間
 * ============================================
 */

export function driveMinutes(
    meters:
    number,
) {
    return Math.max(
        1,

        Math.round(
            meters /
            500,
        ),
    );
}