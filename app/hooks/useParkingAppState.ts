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
} from "@/app/hooks/useSearch";

import {
    useParkings,
} from "@/app/hooks/useParkings";

/*
 * ========================================
 * モード
 * ========================================
 *
 * student = 学生向け
 * tourist = 観光客向け
 */

type AppMode =
    | "student"
    | "tourist";

export function useParkingAppState() {
    /*
     * ========================================
     * モード
     * ========================================
     */

    const [
        mode,
        setMode,
    ] =
        useState<AppMode>(
            "student",
        );

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
        });

    /*
     * ========================================
     * モード変更
     * ========================================
     */

    function switchMode(
        nextMode:
        AppMode,
    ) {
        /*
         * モードを変更
         */
        setMode(
            nextMode,
        );

        /*
         * モードを変えたら
         * 前の駐車場一覧を消す
         */
        setParkings(
            [],
        );

        /*
         * 開いている詳細画面も閉じる
         */
        setSelected(
            null,
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
        switchMode,

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