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
} from "@/app/data/searchData";

export function useSearch() {
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
     * 学生向けチップ
     * ========================================
     */

    const chips =
        STUDENT_CHIPS;

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
                    /*
                     * 観光地は検索対象にしない
                     *
                     * この条件は、
                     * 次にokinawa-data.tsから
                     * 観光地データを消したら不要になる。
                     */
                    .filter(
                        (
                            landmark,
                        ) =>
                            landmark.category !==
                            "tourist",
                    )

                    /*
                     * 入力された文字が
                     * 名前・かな・エリア・別名の
                     * どこかに含まれているか調べる
                     */
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

                    /*
                     * 候補は最大8件
                     */
                    .slice(
                        0,
                        8,
                    );
            },
            [
                query,
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
        /*
         * lat / lng がないデータは
         * 目的地にできないので除外
         */
        if (
            landmark.lat ===
            undefined ||
            landmark.lng ===
            undefined
        ) {
            return;
        }

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
                    /*
                     * エリアチップなら
                     * categoryがareaのものだけ探す
                     */
                    if (
                        chip.kind ===
                        "area" &&
                        landmark.category !==
                        "area"
                    ) {
                        return false;
                    }

                    /*
                     * 観光地は対象外
                     */
                    if (
                        landmark.category ===
                        "tourist"
                    ) {
                        return false;
                    }

                    /*
                     * 名前または別名から探す
                     */
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

    /*
     * ========================================
     * 外へ渡す
     * ========================================
     */

    return {
        query,
        focused,
        target,

        chips,
        suggestions,

        changeQuery,
        focusSearch,

        selectLandmark,
        clearSearch,
        handleChip,
    };
}