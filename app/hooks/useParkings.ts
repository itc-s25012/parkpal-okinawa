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

type Mode =
    | "student"
    | "tourist";

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
    mode: Mode;
};

export function useParkings({
                                target,
                                language,
                                mode,
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
        useState(false);

    const [
        error,
        setError,
    ] =
        useState("");

    const t =
        TEXT[language];

    useEffect(
        () => {
            /*
             * 目的地が無ければ
             * APIを呼ばず終了。
             *
             * parkingsの初期化は
             * PocketParkingApp側で行う。
             */
            if (!target) {
                return;
            }

            /*
             * targetをここで固定しておく。
             *
             * async関数の中でも
             * nullではないとTypeScriptが分かる。
             */
            const currentTarget =
                target;

            const controller =
                new AbortController();

            async function loadParkings() {
                setLoading(
                    true,
                );

                setError(
                    "",
                );

                try {
                    /*
                     * 観光モードは3km
                     * 学生モードは1.5km
                     */
                    const radius =
                        mode ===
                        "tourist"
                            ? "3000"
                            : "1500";

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

                    const response =
                        await fetch(
                            `/api/parkings?${params.toString()}`,
                            {
                                signal:
                                controller.signal,
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

                    setParkings(
                        data.parkings ??
                        [],
                    );

                    setError(
                        "",
                    );
                } catch (
                    err
                    ) {
                    /*
                     * 次の検索に切り替わった時の
                     * Abortはエラー扱いしない
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
                    setLoading(
                        false,
                    );
                }
            }

            void loadParkings();

            /*
             * 目的地・言語・モードなどが
             * 途中で変わったら古い通信を中止
             */
            return () => {
                controller.abort();
            };
        },
        [
            target,
            language,
            mode,
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