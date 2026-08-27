import type {
    ApiParking,
    Language,
    OverpassElement,
} from "./types";

import {
    TEXT,
} from "./translations";

import {
    distanceMeters,
} from "./distance";

/*
 * ============================================
 * 英語名フォールバック
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

/*
 * ============================================
 * 駐車場名の多言語化
 * ============================================
 */

function localizedName(
    tags: Record<
        string,
        string
    >,

    language:
    Language,
) {
    /*
     * name / operator / brand の
     * どれかがある駐車場だけ
     * 名前ありとして扱う
     */

    const base =
        tags.name?.trim() ||
        tags.operator?.trim() ||
        tags.brand?.trim();

    if (
        !base
    ) {
        return null;
    }

    if (
        language ===
        "ja"
    ) {
        return (
            tags["name:ja"]?.trim() ||
            base
        );
    }

    if (
        language ===
        "en"
    ) {
        return (
            tags["name:en"]?.trim() ||
            tags["brand:en"]?.trim() ||
            tags["operator:en"]?.trim() ||
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
            tags["name:zh-Hans"]?.trim() ||
            tags["name:zh"]?.trim() ||
            tags["brand:zh"]?.trim() ||
            base
        );
    }

    if (
        language ===
        "zh-TW"
    ) {
        return (
            tags["name:zh-Hant"]?.trim() ||
            tags["name:zh"]?.trim() ||
            tags["brand:zh"]?.trim() ||
            base
        );
    }

    if (
        language ===
        "ko"
    ) {
        return (
            tags["name:ko"]?.trim() ||
            tags["brand:ko"]?.trim() ||
            base
        );
    }

    return base;
}

/*
 * ============================================
 * 運営会社名
 * ============================================
 */

function localizedOperator(
    tags: Record<
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
            tags["operator:ja"] ||
            tags.operator
        );
    }

    if (
        language ===
        "en"
    ) {
        return (
            tags["operator:en"] ||
            tags.operator
        );
    }

    if (
        language ===
        "zh-CN"
    ) {
        return (
            tags["operator:zh-Hans"] ||
            tags["operator:zh"] ||
            tags.operator
        );
    }

    if (
        language ===
        "zh-TW"
    ) {
        return (
            tags["operator:zh-Hant"] ||
            tags["operator:zh"] ||
            tags.operator
        );
    }

    if (
        language ===
        "ko"
    ) {
        return (
            tags["operator:ko"] ||
            tags.operator
        );
    }

    return tags.operator;
}

/*
 * ============================================
 * OSM → ParkPal形式
 * ============================================
 */

export function convertOsmParking(
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

    /*
     * ========================================
     * 距離
     * ========================================
     */

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

    /*
     * ========================================
     * 利用制限
     * ========================================
     */
    const access =
        tags.access
            ?.toLowerCase();

    /*
     * ========================================
     * 一般利用できない駐車場は除外
     * ========================================
     *
     * private   → 私有地
     * no        → 利用不可
     * emergency → 緊急車両用
     * customers → 店舗・施設の利用者専用
     *
     * ParkPalでは学校・塾などへ行く人が
     * 普通に利用できる駐車場だけを表示する。
     */

    if (
        access === "private" ||
        access === "no" ||
        access === "emergency" ||
        access === "customers"
    ) {
        return null;
    }


    /*
     * ========================================
     * 駐車場タイプ
     * ========================================
     */

    const parkingType =
        tags.parking
            ?.toLowerCase();

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
        TEXT[
            language
            ];

    /*
     * ========================================
     * 駐車場名
     * ========================================
     *
     * 名前・運営会社・ブランド名が
     * 何も無い駐車場は表示しない。
     *
     * これで一覧が
     * 「駐車場」「駐車場」「駐車場」
     * だらけになるのを防ぐ。
     * ========================================
     */

    const name =
        localizedName(
            tags,
            language,
        );

    if (
        !name
    ) {
        return null;
    }

    /*
     * ========================================
     * OSM ID
     * ========================================
     */

    const sourceId =
        `osm-${element.type}-${element.id}`;

    /*
     * ========================================
     * 補足情報
     * ========================================
     */

    const info:
        string[] =
        [];

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

    /*
     * ========================================
     * ParkPal形式に変換
     * ========================================
     */

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

        /*
         * ====================================
         * 安全情報
         * ====================================
         */

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

        /*
         * ====================================
         * 基本情報
         * ====================================
         */

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

        /*
         * ====================================
         * 駐車場の特徴
         * ====================================
         */

        /*
         * OSMの fee=yes なら有料
         */

        isPaid:
            tags.fee ===
            "yes",

        /*
         * 穴場はParkPal独自情報。
         * OSMだけでは判定しない。
         */

        isHidden:
            false,

        /*
         * 立体・地下なら屋内扱い
         */

        isIndoor:
            parkingType ===
            "multi-storey" ||
            parkingType ===
            "underground",

        /*
         * お店・施設利用者向け
         */

        isFacility:
            access ===
            "customers",

        /*
         * wheelchair=yes なら
         * バリアフリー
         */

        isAccessible:
            tags.wheelchair ===
            "yes",

        /*
         * ====================================
         * 月極対応
         * ====================================
         *
         * OSM側には月極料金の
         * 確認済み情報を持たせない。
         *
         * 月極はSupabaseの
         * 確認済みデータから扱う。
         */

        rentalType:
            "hourly",

        monthlyPrice:
            null,
    };
}