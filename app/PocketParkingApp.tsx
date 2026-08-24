"use client";

import {
    useState,
} from "react";

import {
    TEXT,
    type Language,
} from "@/lib/translations";

import {
    MapView,
} from "@/app/components/MapView";

import {
    ParkingList,
    type ParkingSpot,
} from "@/app/components/ParkingList";

import {
    ParkingDetail,
} from "@/app/components/ParkingDetail";

import {
    SearchPanel,
    type Chip,
} from "@/app/components/SearchPanel";

import {
    TopControls,
} from "@/app/components/TopControls";

import {
    StatusOverlay,
} from "@/app/components/StatusOverlay";

import {
    useParkings,
} from "@/app/hooks/useParkings";

import {
    useSearch,
    type Mode,
} from "@/app/hooks/useSearch";

/*
 * ============================================
 * メイン
 * ============================================
 */

export function PocketParkingApp() {
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
     * 検索処理
     * ========================================
     */

    const search =
        useSearch();

    /*
     * 分かりやすいように取り出す
     */
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
     * 目的地を選ぶ
     * ========================================
     */

    function selectLandmark(
        landmark:
        Parameters<
            typeof search.selectLandmark
        >[0],
    ) {
        /*
         * 古い駐車場を消す
         */
        setParkings(
            [],
        );

        /*
         * 古い詳細も閉じる
         */
        setSelected(
            null,
        );

        /*
         * 検索Hookに目的地変更を任せる
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
        /*
         * 前の駐車場を一旦消す
         */
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
     * 画面
     * ========================================
     */

    return (
        <main
            className="relative h-screen w-full overflow-hidden bg-slate-100"
            style={{
                height:
                    "100dvh",
            }}
        >
            {/*
             * ====================================
             * 地図
             * ====================================
             */}

            <MapView
                target={
                    target
                }
                parkings={
                    parkings
                }
                language={
                    language
                }
                mode={
                    mode
                }
                selected={
                    selected
                }
                onSelectParking={
                    setSelected
                }
            />

            {/*
             * ====================================
             * 上部UI
             * ====================================
             */}

            <TopControls
                mode={
                    mode
                }
                language={
                    language
                }
                languageOpen={
                    languageOpen
                }
                onModeChange={
                    switchMode
                }
                onLanguageOpenChange={
                    setLanguageOpen
                }
                onLanguageChange={
                    setLanguage
                }
            />

            {/*
             * ====================================
             * 検索
             * ====================================
             */}

            <SearchPanel
                query={
                    query
                }
                focused={
                    focused
                }
                mode={
                    mode
                }
                language={
                    language
                }
                suggestions={
                    suggestions
                }
                chips={
                    chips
                }
                searchStudent={
                    t.searchStudent
                }
                searchTourist={
                    t.searchTourist
                }
                onQueryChange={
                    search.changeQuery
                }
                onFocus={
                    search.focusSearch
                }
                onClear={
                    clearSearch
                }
                onSelectLandmark={
                    selectLandmark
                }
                onChip={
                    handleChip
                }
            />

            {/*
             * ====================================
             * 状態表示
             * ====================================
             */}

            <StatusOverlay
                target={
                    target
                }
                language={
                    language
                }
                loading={
                    parkingLoading
                }
                error={
                    parkingError
                }
            />

            {/*
             * ====================================
             * 駐車場詳細 / 一覧
             * ====================================
             */}

            {selected ? (
                <ParkingDetail
                    spot={
                        selected
                    }
                    target={
                        target
                    }
                    language={
                        language
                    }
                    onClose={() =>
                        setSelected(
                            null,
                        )
                    }
                />
            ) : (
                <ParkingList
                    parkings={
                        parkings
                    }
                    target={
                        target
                    }
                    loading={
                        parkingLoading
                    }
                    language={
                        language
                    }
                    onPick={
                        setSelected
                    }
                />
            )}
        </main>
    );
}