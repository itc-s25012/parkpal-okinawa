import {
    execFile,
} from "node:child_process";

import {
    promisify,
} from "node:util";

import type {
    OverpassResponse,
} from "./types";

const execFileAsync =
    promisify(
        execFile,
    );

/*
 * ============================================
 * Overpassサーバー候補
 * ============================================
 */

const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
];

/*
 * 1サーバーあたり最大15秒
 */
const OVERPASS_TIMEOUT_SECONDS =
    15;

/*
 * ============================================
 * 1サーバーへ問い合わせ
 * ============================================
 */

async function fetchOverpass(
    url:
    string,

    query:
    string,
): Promise<OverpassResponse> {
    const {
        stdout,
    } =
        await execFileAsync(
            "curl",
            [
                "-sS",

                "--fail",

                "--connect-timeout",
                "5",

                "--max-time",
                String(
                    OVERPASS_TIMEOUT_SECONDS,
                ),

                "-X",
                "POST",

                url,

                "-H",
                "Content-Type: application/x-www-form-urlencoded",

                "--data-urlencode",
                `data=${query}`,
            ],
            {
                maxBuffer:
                    15 *
                    1024 *
                    1024,
            },
        );

    if (
        !stdout.trim()
    ) {
        throw new Error(
            "Overpass returned empty response",
        );
    }

    return JSON.parse(
        stdout,
    ) as OverpassResponse;
}

/*
 * ============================================
 * Overpass Query
 * ============================================
 */

export function buildOverpassQuery(
    lat:
    number,

    lng:
    number,

    radius:
    number,
) {
    return `
[out:json][timeout:12];
(
  node["amenity"="parking"](around:${radius},${lat},${lng});
  way["amenity"="parking"](around:${radius},${lat},${lng});
  relation["amenity"="parking"](around:${radius},${lat},${lng});
);
out center tags;
`;
}

/*
 * ============================================
 * 複数サーバーを順番に試す
 * ============================================
 */

export async function loadOverpassParkings(
    lat:
    number,

    lng:
    number,

    radius:
    number,
) {
    const query =
        buildOverpassQuery(
            lat,
            lng,
            radius,
        );

    let data:
        OverpassResponse | null =
        null;

    let errorMessage =
        "";

    for (
        const url
        of OVERPASS_URLS
        ) {
        try {
            console.log(
                `Trying Overpass: ${url}`,
            );

            data =
                await fetchOverpass(
                    url,
                    query,
                );

            console.log(
                `Overpass success: ${url}`,
            );

            break;
        } catch (
            error
            ) {
            errorMessage =
                error instanceof
                Error
                    ? error.message
                    : "Overpass error";

            console.warn(
                `Overpass failed: ${url}`,
                errorMessage,
            );
        }
    }

    return {
        data,
        error:
        errorMessage,
    };
}