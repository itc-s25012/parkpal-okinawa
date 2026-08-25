"use client";

import {
    useState,
} from "react";

import {
    TEXT,
    type Language,
} from "@/lib/translations";

import type {
    Landmark,
} from "@/lib/okinawa-data";

import type {
    ParkingSpot,
} from "@/app/components/ParkingList";

import type {
    Chip,
} from "@/app/components/SearchPanel";

import {
    useSearch,
    type Mode,
} from "@/app/hooks/useSearch";

import {
    useParkings,
} from "@/app/hooks/useParkings";

export function useParkingAppState() {
    /*
     * ========================================
     * 言語
     * ========================================
     */

    const [
        language,
        setLanguage,
    ] =
        useState<Language>(
            "ja",
        );

    const [
        languageOpen,
        setLanguageOpen,
    ] =
        useState(
            false,
        );

    /*
     * ========================================
     * 選択中の駐車場
     * ========================================
     */

    const [
        selected,
        setSelected,
    ] =
        useState<
            ParkingSpot | null
        >(
            null,
        );

    /*
     * ========================================
     * 検索
     * ========================================
     */

    const search =
        useSearch();

    const {
        mode,
        query,
        focused,
        target,
        chips,
        suggestions,
    } =
        search;

    /*
     * ========================================
     * 翻訳
     * ========================================
     */

    const t =
        TEXT[
            language
            ];

    /*
     * ========================================
     * 駐車場取得
     * ========================================
     */

    const {
        parkings,

        loading:
            parkingLoading,

        error:
            parkingError,

        setParkings,
    } =
        useParkings({
            target,
            language,
            mode,
        });

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
         * 前の駐車場を消す
         */
        setParkings(
            [],
        );

        /*
         * 詳細画面も閉じる
         */
        setSelected(
            null,
        );

        /*
         * useSearch側で
         * 新しい目的地を設定
         */
        search.selectLandmark(
            landmark,
        );
    }

    /*
     * ========================================
     * 検索クリア
     * ========================================
     */

    function clearSearch() {
        setParkings(
            [],
        );

        setSelected(
            null,
        );

        search.clearSearch();
    }

    /*
     * ========================================
     * Student / Travel 切り替え
     * ========================================
     */

    function switchMode(
        nextMode:
        Mode,
    ) {
        setParkings(
            [],
        );

        setSelected(
            null,
        );

        setLanguageOpen(
            false,
        );

        search.switchMode(
            nextMode,
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
        setParkings(
            [],
        );

        setSelected(
            null,
        );

        search.handleChip(
            chip,
        );
    }

    /*
     * ========================================
     * 言語変更
     * ========================================
     */

    function changeLanguage(
        nextLanguage:
        Language,
    ) {
        setLanguage(
            nextLanguage,
        );

        setLanguageOpen(
            false,
        );
    }

    /*
     * ========================================
     * 外へ渡す
     * ========================================
     */

    return {
        /*
         * mode
         */
        mode,

        /*
         * language
         */
        language,
        languageOpen,
        setLanguageOpen,
        changeLanguage,

        /*
         * search
         */
        query,
        focused,
        target,
        chips,
        suggestions,

        changeQuery:
        search.changeQuery,

        focusSearch:
        search.focusSearch,

        selectLandmark,
        clearSearch,
        switchMode,
        handleChip,

        /*
         * parking
         */
        parkings,
        parkingLoading,
        parkingError,

        /*
         * selected parking
         */
        selected,
        setSelected,

        /*
         * translation
         */
        t,
    };
}