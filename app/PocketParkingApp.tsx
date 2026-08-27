"use client";

import {
    MapView,
} from "@/app/components/MapView";

import {
    ParkingList,
} from "@/app/components/ParkingList";

import {
    ParkingDetail,
} from "@/app/components/ParkingDetail";

import {
    SearchPanel,
} from "@/app/components/SearchPanel";

import {
    TopControls,
} from "@/app/components/TopControls";

import {
    StatusOverlay,
} from "@/app/components/StatusOverlay";

import {
    useParkingAppState,
} from "@/app/hooks/useParkingAppState";

/*
 * ============================================
 * ParkPal メイン画面
 * ============================================
 */

export function PocketParkingApp() {
    /*
     * ========================================
     * アプリ全体の状態
     * ========================================
     */

    const {
        mode,

        language,
        languageOpen,
        setLanguageOpen,
        changeLanguage,

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

        parkings,
        parkingLoading,
        parkingError,

        selected,
        setSelected,

        t,
    } =
        useParkingAppState();

    /*
     * ========================================
     * ホームへ戻る
     * ========================================
     *
     * 左上のParkPalロゴを押したとき、
     * 検索前の状態へ戻す。
     *
     * clearSearch()の中で
     *
     * ・駐車場一覧を空にする
     * ・選択中の駐車場を解除
     * ・検索文字を空にする
     * ・目的地を解除
     * ・検索候補を閉じる
     *
     * が行われる。
     * ========================================
     */

    function goHome() {
        /*
         * 言語メニューが開いていたら閉じる
         */
        setLanguageOpen(
            false,
        );

        /*
         * 検索・目的地・駐車場を初期化
         */
        clearSearch();
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
             * 上部メニュー
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
                    changeLanguage
                }
                onHome={
                    goHome
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
                    changeQuery
                }
                onFocus={
                    focusSearch
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
             * 駐車場詳細 / 駐車場一覧
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