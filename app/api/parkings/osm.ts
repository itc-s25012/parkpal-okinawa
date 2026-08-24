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
    language: Language,
) {
    const base =
        tags.name?.trim() ||
        tags.operator?.trim() ||
        tags.brand?.trim();

    if (!base) {
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
    language: Language,
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
    element: OverpassElement,
    origin: {
        lat: number;
        lng: number;
    },
    radius: number,
    language: Language,
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

    /*
     * 私有地などは除外
     */
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

    const name =
        localizedName(
            tags,
            language,
        ) ??
        t.parking;

    const sourceId =
        `osm-${element.type}-${element.id}`;

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
    };
}