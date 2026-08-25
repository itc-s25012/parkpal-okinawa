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
 * Landmark型を再export
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
    {
        id: "a1",

        name:
            "開南エリア",

        aliases: [
            "開南",
        ],

        lat:
            26.2105,

        lng:
            127.6842,

        category:
            "area",
    },

    {
        id: "a2",

        name:
            "安里エリア",

        aliases: [
            "安里",
        ],

        lat:
            26.2185,

        lng:
            127.694,

        category:
            "area",
    },

    {
        id: "a3",

        name:
            "壺川エリア",

        aliases: [
            "壺川",
        ],

        lat:
            26.205,

        lng:
            127.678,

        category:
            "area",
    },

    {
        id: "a4",

        name:
            "コザ (沖縄市中心)",

        aliases: [
            "コザ",
            "沖縄市",
        ],

        lat:
            26.3365,

        lng:
            127.7981,

        category:
            "area",
    },

    {
        id: "a5",

        name:
            "おもろまち・新都心",

        aliases: [
            "おもろまち",
            "新都心",
        ],

        lat:
            26.223,

        lng:
            127.6955,

        category:
            "area",
    },
];

/*
 * ============================================
 * 観光地
 * ============================================
 */

export const TOURIST_SPOTS:
    Landmark[] = [
    {
        id: "t1",

        name:
            "国際通り",

        aliases: [
            "国際通り",
            "kokusai",
            "牧志",
        ],

        lat:
            26.2145,

        lng:
            127.6858,

        category:
            "tourist",

        area:
            "那覇市",
    },

    {
        id: "t2",

        name:
            "首里城公園",

        aliases: [
            "首里城",
            "shuri",
            "shurijo",
        ],

        lat:
            26.217,

        lng:
            127.7194,

        category:
            "tourist",

        area:
            "那覇市首里",
    },

    {
        id: "t3",

        name:
            "波の上ビーチ・波の上宮",

        aliases: [
            "波の上",
            "naminoue",
        ],

        lat:
            26.2237,

        lng:
            127.672,

        category:
            "tourist",

        area:
            "那覇市若狭",
    },

    {
        id: "t4",

        name:
            "美浜アメリカンビレッジ",

        aliases: [
            "アメリカンビレッジ",
            "美浜",
            "mihama",
            "chatan",
        ],

        lat:
            26.3167,

        lng:
            127.755,

        category:
            "tourist",

        area:
            "北谷町美浜",
    },

    {
        id: "t5",

        name:
            "残波岬",

        aliases: [
            "残波",
            "zanpa",
        ],

        lat:
            26.4425,

        lng:
            127.7075,

        category:
            "tourist",

        area:
            "読谷村",
    },

    {
        id: "t6",

        name:
            "沖縄美ら海水族館",

        aliases: [
            "美ら海",
            "水族館",
            "churaumi",
        ],

        lat:
            26.6944,

        lng:
            127.8778,

        category:
            "tourist",

        area:
            "本部町",
    },

    {
        id: "t7",

        name:
            "古宇利島・古宇利大橋",

        aliases: [
            "古宇利",
            "kouri",
        ],

        lat:
            26.7038,

        lng:
            128.0207,

        category:
            "tourist",

        area:
            "今帰仁村",
    },

    {
        id: "t8",

        name:
            "斎場御嶽 (せーふぁうたき)",

        aliases: [
            "斎場御嶽",
            "セーファ",
            "sefa",
        ],

        lat:
            26.1717,

        lng:
            127.8283,

        category:
            "tourist",

        area:
            "南城市",
    },

    {
        id: "t9",

        name:
            "ひめゆりの塔・平和祈念資料館",

        aliases: [
            "ひめゆり",
            "himeyuri",
        ],

        lat:
            26.1006,

        lng:
            127.7267,

        category:
            "tourist",

        area:
            "糸満市",
    },
];

/*
 * ============================================
 * 検索対象を全部合体
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