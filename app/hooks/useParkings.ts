"use client";

import {
    useEffect,
    useState,
} from "react";

import type {
    ParkingSpot,
    Target,
} from "@/app/components/ParkingList";

import {
    TEXT,
    type Language,
} from "@/lib/translations";

type ParkingResponse = {
    parkings?: ParkingSpot[];
    count?: number;
    error?: string;
    detail?: string;
    sourceMode?: string;
    warning?: string;
};

type UseParkingsArgs = {
    target: Target | null;
    language: Language;
};

/*
 * ============================================
 * 少し待つ
 * ============================================
 */

function sleep(
    milliseconds: number,
    signal: AbortSignal,
) {
    return new Promise<void>(
        (
            resolve,
            reject,
        ) => {
            const timer =
                setTimeout(
                    () => {
                        signal.removeEventListener(
                            "abort",
                            onAbort,
                        );

                        resolve();
                    },
                    milliseconds,
                );

            function onAbort() {
                clearTimeout(
                    timer,
                );

                reject(
                    new DOMException(
                        "Aborted",
                        "AbortError",
                    ),
                );
            }

            signal.addEventListener(
                "abort",
                onAbort,
                {
                    once: true,
                },
            );
        },
    );
}

export function useParkings({
                                target,
                                language,
                            }: UseParkingsArgs) {
    const [
        parkings,
        setParkings,
    ] =
        useState<ParkingSpot[]>(
            [],
        );

    const [
        loading,
        setLoading,
    ] =
        useState(
            false,
        );

    const [
        error,
        setError,
    ] =
        useState(
            "",
        );

    const t =
        TEXT[
            language
            ];

    useEffect(
        () => {
            /*
             * ========================================
             * 目的地なし
             * ========================================
             */

            if (
                !target
            ) {
                return;
            }

            /*
             * async処理の途中でtargetが変わっても
             * 今回検索する場所を固定しておく
             */
            const currentTarget =
                target;

            const controller =
                new AbortController();

            /*
             * ========================================
             * 駐車場取得
             * ========================================
             */

            async function loadParkings() {
                setLoading(
                    true,
                );

                setError(
                    "",
                );

                /*
                 * ====================================
                 * 学生向け
                 *
                 * 学校・塾から半径1.5km以内を検索
                 * ====================================
                 */

                const radius =
                    "1500";

                const params =
                    new URLSearchParams(
                        {
                            lat:
                                String(
                                    currentTarget.lat,
                                ),

                            lng:
                                String(
                                    currentTarget.lng,
                                ),

                            radius,

                            lang:
                            language,
                        },
                    );

                /*
                 * ====================================
                 * 最大3回まで試す
                 * ====================================
                 */

                const maxAttempts =
                    3;

                try {
                    for (
                        let attempt = 1;
                        attempt <= maxAttempts;
                        attempt++
                    ) {
                        console.log(
                            `Parking request attempt ${attempt}/${maxAttempts}`,
                            currentTarget.name,
                        );

                        const response =
                            await fetch(
                                `/api/parkings?${params.toString()}`,
                                {
                                    signal:
                                    controller.signal,

                                    /*
                                     * 開発中に古いAPI結果を
                                     * キャッシュから取らないようにする
                                     */
                                    cache:
                                        "no-store",
                                },
                            );

                        const text =
                            await response.text();

                        if (
                            !response.ok
                        ) {
                            throw new Error(
                                text,
                            );
                        }

                        const data =
                            JSON.parse(
                                text,
                            ) as ParkingResponse;

                        /*
                         * =================================
                         * OSM + Supabase取得成功
                         * =================================
                         */

                        if (
                            data.sourceMode ===
                            "osm+supabase"
                        ) {
                            setParkings(
                                data.parkings ??
                                [],
                            );

                            setError(
                                "",
                            );

                            return;
                        }

                        /*
                         * =================================
                         * Supabase fallback
                         *
                         * Overpassが一時的に失敗した場合
                         * =================================
                         */

                        if (
                            data.sourceMode ===
                            "supabase-fallback"
                        ) {
                            console.warn(
                                `Supabase fallback received (${attempt}/${maxAttempts})`,
                                data.detail ??
                                data.warning ??
                                "",
                            );

                            /*
                             * まだ再試行できる場合
                             */
                            if (
                                attempt <
                                maxAttempts
                            ) {
                                /*
                                 * 一瞬fallback結果を表示せず、
                                 * loadingのまま再試行する
                                 */
                                await sleep(
                                    1000,
                                    controller.signal,
                                );

                                continue;
                            }

                            /*
                             * 3回すべてOverpass失敗
                             *
                             * 最後だけSupabaseの結果を表示
                             */
                            setParkings(
                                data.parkings ??
                                [],
                            );

                            setError(
                                "",
                            );

                            return;
                        }

                        /*
                         * =================================
                         * sourceModeが無い場合
                         *
                         * 通常レスポンスとして扱う
                         * =================================
                         */

                        setParkings(
                            data.parkings ??
                            [],
                        );

                        setError(
                            "",
                        );

                        return;
                    }
                } catch (
                    err
                    ) {
                    /*
                     * 新しい検索に切り替わった場合などは
                     * エラー表示しない
                     */
                    if (
                        err instanceof
                        DOMException &&
                        err.name ===
                        "AbortError"
                    ) {
                        return;
                    }

                    console.error(
                        "Parking load error:",
                        err,
                    );

                    setParkings(
                        [],
                    );

                    setError(
                        t.error,
                    );
                } finally {
                    /*
                     * 古い検索がabortされた後に
                     * loadingを変更するのを防ぐ
                     */
                    if (
                        !controller.signal.aborted
                    ) {
                        setLoading(
                            false,
                        );
                    }
                }
            }

            void loadParkings();

            /*
             * ========================================
             * 検索条件が変わったら古い通信を中止
             * ========================================
             */

            return () => {
                controller.abort();
            };
        },
        [
            target,
            language,
            t.error,
        ],
    );

    return {
        parkings,
        loading,
        error,
        setParkings,
    };
}