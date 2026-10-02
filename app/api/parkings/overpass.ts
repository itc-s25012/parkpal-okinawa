import type {
    OverpassResponse,
} from "./types";

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
 * ============================================
 * 1サーバーあたりの待ち時間
 * ============================================
 *
 * 8秒経っても返ってこなければ、
 * 次のOverpassサーバーを試します。
 */

const OVERPASS_TIMEOUT_MS =
    8000;

/*
 * ============================================
 * 1サーバーへ問い合わせ
 * ============================================
 */

async function fetchOverpass(
    url: string,
    query: string,
): Promise<OverpassResponse> {

    /*
     * AbortControllerを使って、
     * 通信が長すぎる場合に中止できるようにします。
     */

    const controller =
        new AbortController();

    const timeoutId =
        setTimeout(
            () => {
                controller.abort();
            },
            OVERPASS_TIMEOUT_MS,
        );

    try {

        /*
         * curlではなく、
         * JavaScript標準のfetchを使います。
         */

        const response =
            await fetch(
                url,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",
                    },

                    body:
                        new URLSearchParams({
                            data:
                            query,
                        }),

                    signal:
                    controller.signal,

                    /*
                     * Next.js側でキャッシュしない
                     */

                    cache:
                        "no-store",
                },
            );

        /*
         * 200番台以外だった場合
         */

        if (
            !response.ok
        ) {
            throw new Error(
                `HTTP ${response.status} ${response.statusText}`,
            );
        }

        /*
         * JSONとして受け取る
         */

        const data =
            await response.json();

        return data　as OverpassResponse;

    } finally {

        /*
         * タイマーを解除
         */

        clearTimeout(
            timeoutId,
        );
    }
}

/*
 * ============================================
 * Overpass Query
 * ============================================
 */

export function buildOverpassQuery(
    lat: number,
    lng: number,
    radius: number,
) {
    return `
[out:json][timeout:10];
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
    lat: number,
    lng: number,
    radius: number,
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

    /*
     * 上から順番にOverpassサーバーを試します。
     */

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

            /*
             * 成功したら、
             * それ以上ほかのサーバーは試しません。
             */

            break;

        } catch (
            error
            ) {

            /*
             * AbortControllerによる
             * タイムアウトかどうか確認
             */

            if (
                error instanceof Error &&
                error.name === "AbortError"
            ) {

                errorMessage =
                    `Overpass timeout: ${url}`;

            } else {

                errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Overpass error";
            }

            console.warn(
                `Overpass failed: ${url}`,
                errorMessage,
            );
        }
    }

    /*
     * 全部失敗した場合は
     * data = null のまま返ります。
     */

    return {
        data,
        error:
        errorMessage,
    };
}