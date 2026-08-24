"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    ALL_LANDMARKS,
    type Landmark,
} from "@/lib/okinawa-data";

import type {
    Target,
} from "@/app/components/ParkingList";

import type {
    Chip,
} from "@/app/components/SearchPanel";

import {
    STUDENT_CHIPS,
    TOURIST_CHIPS,
} from "@/app/data/searchData";

export type Mode =
    | "student"
    | "tourist";

export function useSearch() {
    /*
     * ========================================
     * モード
     * ========================================
     */

    const [
        mode,
        setMode,
    ] =
        useState<Mode>(
            "student",
        );

    /*
     * ========================================
     * 検索文字
     * ========================================
     */

    const [
        query,
        setQuery,
    ] =
        useState(
            "",
        );

    /*
     * ========================================
     * 検索候補を表示するか
     * ========================================
     */

    const [
        focused,
        setFocused,
    ] =
        useState(
            false,
        );

    /*
     * ========================================
     * 現在の目的地
     * ========================================
     */

    const [
        target,
        setTarget,
    ] =
        useState<
            Target | null
        >(
            null,
        );

    /*
     * ========================================
     * モード別チップ
     * ========================================
     */

    const chips =
        mode ===
        "tourist"
            ? TOURIST_CHIPS
            : STUDENT_CHIPS;

    /*
     * ========================================
     * 検索候補
     * ========================================
     */

    const suggestions =
        useMemo(
            () => {
                const q =
                    query
                        .trim()
                        .toLowerCase();

                if (
                    !q
                ) {
                    return [];
                }

                return ALL_LANDMARKS
                    .filter(
                        (
                            landmark,
                        ) => {
                            /*
                             * 観光モード
                             */
                            if (
                                mode ===
                                "tourist"
                            ) {
                                return (
                                    landmark.category ===
                                    "tourist" ||
                                    landmark.category ===
                                    "area"
                                );
                            }

                            /*
                             * 学生モード
                             */
                            return (
                                landmark.category !==
                                "tourist"
                            );
                        },
                    )

                    .filter(
                        (
                            landmark,
                        ) => {
                            const searchText =
                                [
                                    landmark.name,

                                    landmark.kana ??
                                    "",

                                    landmark.area ??
                                    "",

                                    ...landmark.aliases,
                                ]
                                    .join(
                                        " ",
                                    )
                                    .toLowerCase();

                            return searchText.includes(
                                q,
                            );
                        },
                    )

                    .slice(
                        0,
                        8,
                    );
            },
            [
                query,
                mode,
            ],
        );

    /*
     * ========================================
     * 検索文字入力
     * ========================================
     */

    function changeQuery(
        value:
        string,
    ) {
        setQuery(
            value,
        );

        setFocused(
            true,
        );
    }

    /*
     * ========================================
     * 検索欄フォーカス
     * ========================================
     */

    function focusSearch() {
        setFocused(
            true,
        );
    }

    /*
     * ========================================
     * 目的地選択
     * ========================================
     */

    function selectLandmark(
        landmark:
        Landmark,
    ) {
        setTarget({
            name:
            landmark.name,

            lat:
            landmark.lat,

            lng:
            landmark.lng,
        });

        setQuery(
            landmark.name,
        );

        setFocused(
            false,
        );
    }

    /*
     * ========================================
     * 検索クリア
     * ========================================
     */

    function clearSearch() {
        setQuery(
            "",
        );

        setTarget(
            null,
        );

        setFocused(
            false,
        );
    }

    /*
     * ========================================
     * モード変更
     * ========================================
     */

    function switchMode(
        nextMode:
        Mode,
    ) {
        setMode(
            nextMode,
        );

        setQuery(
            "",
        );

        setTarget(
            null,
        );

        setFocused(
            false,
        );
    }

    /*
     * ========================================
     * チップ選択
     * ========================================
     */

    function handleChip(
        chip:
        Chip,
    ) {
        const found =
            ALL_LANDMARKS.find(
                (
                    landmark,
                ) => {
                    if (
                        chip.kind ===
                        "area" &&
                        landmark.category !==
                        "area"
                    ) {
                        return false;
                    }

                    return [
                        landmark.name,
                        ...landmark.aliases,
                    ].some(
                        (
                            value,
                        ) =>
                            value
                                .toLowerCase()
                                .includes(
                                    chip.query
                                        .toLowerCase(),
                                ),
                    );
                },
            );

        if (
            found
        ) {
            selectLandmark(
                found,
            );
        }
    }

    return {
        mode,
        query,
        focused,
        target,

        chips,
        suggestions,

        changeQuery,
        focusSearch,

        selectLandmark,
        clearSearch,
        switchMode,
        handleChip,
    };
}