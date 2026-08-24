"use client";

import {
    type FormEvent,
} from "react";

import type {
    Landmark,
} from "@/lib/okinawa-data";

import type {
    Language,
} from "@/lib/translations";

type Chip = {
    label: string;
    icon: string;

    kind:
        | "landmark"
        | "area";

    query: string;
};

type SearchPanelProps = {
    query: string;

    focused: boolean;

    mode:
        | "student"
        | "tourist";

    language:
        Language;

    suggestions:
        Landmark[];

    chips:
        Chip[];

    searchStudent:
        string;

    searchTourist:
        string;

    onQueryChange:
        (
            value:
            string,
        ) => void;

    onFocus:
        () => void;

    onClear:
        () => void;

    onSelectLandmark:
        (
            landmark:
            Landmark,
        ) => void;

    onChip:
        (
            chip:
            Chip,
        ) => void;
};

/*
 * ============================================
 * チップ名の翻訳
 * ============================================
 */

const CHIP_LABELS:
    Record<
        Language,
        Record<
            string,
            string
        >
    > = {
    ja: {
        ITカレッジ:
            "ITカレッジ",

        開南:
            "開南",

        安里:
            "安里",

        壺川:
            "壺川",

        コザ:
            "コザ",

        国際通り:
            "国際通り",

        首里城:
            "首里城",

        美ら海:
            "美ら海",

        アメリカンビレッジ:
            "アメリカンビレッジ",

        古宇利島:
            "古宇利島",
    },

    en: {
        ITカレッジ:
            "IT College",

        開南:
            "Kainan",

        安里:
            "Asato",

        壺川:
            "Tsubogawa",

        コザ:
            "Koza",

        国際通り:
            "Kokusai Street",

        首里城:
            "Shuri Castle",

        美ら海:
            "Churaumi Aquarium",

        アメリカンビレッジ:
            "American Village",

        古宇利島:
            "Kouri Island",
    },

    "zh-CN": {
        ITカレッジ:
            "IT学院",

        開南:
            "开南",

        安里:
            "安里",

        壺川:
            "壶川",

        コザ:
            "胡差",

        国際通り:
            "国际通",

        首里城:
            "首里城",

        美ら海:
            "美丽海水族馆",

        アメリカンビレッジ:
            "美国村",

        古宇利島:
            "古宇利岛",
    },

    "zh-TW": {
        ITカレッジ:
            "IT學院",

        開南:
            "開南",

        安里:
            "安里",

        壺川:
            "壺川",

        コザ:
            "胡差",

        国際通り:
            "國際通",

        首里城:
            "首里城",

        美ら海:
            "美麗海水族館",

        アメリカンビレッジ:
            "美國村",

        古宇利島:
            "古宇利島",
    },

    ko: {
        ITカレッジ:
            "IT 칼리지",

        開南:
            "카이난",

        安里:
            "아사토",

        壺川:
            "쓰보가와",

        コザ:
            "고자",

        国際通り:
            "국제거리",

        首里城:
            "슈리성",

        美ら海:
            "추라우미 수족관",

        アメリカンビレッジ:
            "아메리칸 빌리지",

        古宇利島:
            "고우리섬",
    },
};

function chipLabel(
    language:
    Language,

    label:
    string,
) {
    return (
        CHIP_LABELS[
            language
            ][label] ??
        label
    );
}

/*
 * ============================================
 * 候補アイコン
 * ============================================
 */

function landmarkIcon(
    landmark:
    Landmark,
) {
    if (
        landmark.category ===
        "vocational"
    ) {
        return "🎓";
    }

    if (
        landmark.category ===
        "cram"
    ) {
        return "📚";
    }

    if (
        landmark.category ===
        "tourist"
    ) {
        return "🏝️";
    }

    return "📍";
}

/*
 * ============================================
 * 検索パネル
 * ============================================
 */

export function SearchPanel({
                                query,
                                focused,
                                mode,
                                language,
                                suggestions,
                                chips,
                                searchStudent,
                                searchTourist,
                                onQueryChange,
                                onFocus,
                                onClear,
                                onSelectLandmark,
                                onChip,
                            }: SearchPanelProps) {
    function handleSubmit(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const first =
            suggestions[0];

        if (first) {
            onSelectLandmark(
                first,
            );
        }
    }

    return (
        <div
            className="absolute left-1/2 top-20 w-[min(92%,680px)] -translate-x-1/2"
            style={{
                zIndex:
                    1150,
            }}
        >
            {/*
             * ====================================
             * 検索欄
             * ====================================
             */}

            <form
                onSubmit={
                    handleSubmit
                }
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-xl"
            >
                <span className="text-lg">
                    🔍
                </span>

                <input
                    value={
                        query
                    }
                    onChange={(
                        event,
                    ) => {
                        onQueryChange(
                            event
                                .target
                                .value,
                        );
                    }}
                    onFocus={
                        onFocus
                    }
                    placeholder={
                        mode ===
                        "tourist"
                            ? searchTourist
                            : searchStudent
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none"
                />

                {query && (
                    <button
                        type="button"
                        onClick={
                            onClear
                        }
                        className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500"
                    >
                        ×
                    </button>
                )}
            </form>

            {/*
             * ====================================
             * 検索候補
             * ====================================
             */}

            {focused &&
                suggestions.length >
                0 && (
                    <div className="mt-2 max-h-64 overflow-y-auto rounded-2xl bg-white shadow-xl">
                        {suggestions.map(
                            (
                                suggestion,
                            ) => (
                                <button
                                    key={
                                        suggestion.id
                                    }
                                    type="button"
                                    onMouseDown={(
                                        event,
                                    ) =>
                                        event.preventDefault()
                                    }
                                    onClick={() =>
                                        onSelectLandmark(
                                            suggestion,
                                        )
                                    }
                                    className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                                >
                                <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100">
                                    {
                                        landmarkIcon(
                                            suggestion,
                                        )
                                    }
                                </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-black text-slate-800">
                                            {
                                                suggestion.name
                                            }
                                        </p>

                                        {suggestion.area && (
                                            <p className="mt-0.5 text-[10px] text-slate-400">
                                                {
                                                    suggestion.area
                                                }
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ),
                        )}
                    </div>
                )}

            {/*
             * ====================================
             * チップ
             * ====================================
             */}

            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {chips.map(
                    (
                        chip,
                    ) => (
                        <button
                            key={
                                chip.label
                            }
                            type="button"
                            onClick={() =>
                                onChip(
                                    chip,
                                )
                            }
                            className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-md"
                        >
                            {
                                chip.icon
                            }{" "}
                            {chipLabel(
                                language,
                                chip.label,
                            )}
                        </button>
                    ),
                )}
            </div>
        </div>
    );
}

/*
 * PocketParkingApp側でも
 * 同じ型を使えるようにexport
 */
export type {
    Chip,
};