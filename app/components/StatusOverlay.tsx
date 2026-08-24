"use client";

import type {
    Target,
} from "@/app/components/ParkingList";

import {
    TEXT,
    type Language,
} from "@/lib/translations";

type StatusOverlayProps = {
    target:
        Target | null;

    language:
        Language;

    loading:
        boolean;

    error:
        string;
};

const TARGET_LABELS:
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

function translatedTargetName(
    target:
        Target | null,

    language:
    Language,
) {
    if (!target) {
        return "";
    }

    return (
        TARGET_LABELS[
            language
            ][target.name] ??
        target.name
    );
}

export function StatusOverlay({
                                  target,
                                  language,
                                  loading,
                                  error,
                              }: StatusOverlayProps) {
    const t =
        TEXT[
            language
            ];

    return (
        <>
            {/*
             * ====================================
             * 現在の目的地
             * ====================================
             */}

            {target && (
                <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                        bottom:
                            "210px",

                        zIndex:
                            1100,
                    }}
                >
                    <div className="max-w-[80vw] truncate rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-lg">
                        🎯{" "}
                        {
                            translatedTargetName(
                                target,
                                language,
                            )
                        }
                    </div>
                </div>
            )}

            {/*
             * ====================================
             * 駐車場検索中
             * ====================================
             */}

            {loading && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-lg"
                    style={{
                        bottom:
                            "165px",

                        zIndex:
                            1150,
                    }}
                >
                    🔎{" "}
                    {
                        t.loadingParking
                    }
                </div>
            )}

            {/*
             * ====================================
             * エラー
             * ====================================
             */}

            {error && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-4 py-2 text-xs font-black text-white shadow-lg"
                    style={{
                        bottom:
                            "165px",

                        zIndex:
                            1150,
                    }}
                >
                    {
                        error
                    }
                </div>
            )}
        </>
    );
}