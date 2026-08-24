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

const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
];

const OVERPASS_TIMEOUT_SECONDS =
    10;

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

    return JSON.parse(
        stdout,
    ) as OverpassResponse;
}

export function buildOverpassQuery(
    lat:
    number,

    lng:
    number,

    radius:
    number,
) {
    return `
[out:json][timeout:8];
(
  node["amenity"="parking"](around:${radius},${lat},${lng});
  way["amenity"="parking"](around:${radius},${lat},${lng});
  relation["amenity"="parking"](around:${radius},${lat},${lng});
);
out center tags;
`;
}

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
            data =
                await fetchOverpass(
                    url,
                    query,
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