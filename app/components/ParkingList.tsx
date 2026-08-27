import {
    distanceMeters,
    driveMinutes,
    walkMinutes,
} from "@/lib/okinawa-data";

import { useRef, useState } from "react";
import {
    TEXT,
    type Language,
} from "@/lib/translations";

export type Target = {
    name: string;
    lat: number;
    lng: number;
};

export type ParkingSpot = {
    id: string;
    name: string;

    lat: number;
    lng: number;

    price: string;

    tags: string[];

    emoji: string;
    photo: string;

    distance: number;

    securityCamera?: boolean;
    streetLight?: boolean;
    securityStaff?: boolean;

    safetyScore?: number | null;

    studentFriendly?: boolean;

    openingHours?: string | null;

    capacity?: string | number | null;

    parkingType?: string | null;

    note?: string | null;

    source?: string | null;

    /*
     * ========================================
     * 駐車場の特徴
     * ========================================
     */

    isPaid?: boolean;
    isHidden?: boolean;
    isIndoor?: boolean;
    isFacility?: boolean;
    isAccessible?: boolean;

    /*
     * ========================================
     * 時間貸し / 月極
     * ========================================
     */

    rentalType?: string | null;

    monthlyPrice?: number | null;
};

type ParkingListProps = {
    parkings: ParkingSpot[];

    target: Target | null;

    loading: boolean;

    language: Language;

    onPick: (
        parking: ParkingSpot,
    ) => void;
};

/*
 * ============================================
 * 時間貸し / 月極 ラベル
 * ============================================
 */

function getRentalLabel(
    rentalType: string | null | undefined,
    language: Language,
) {
    const monthly =
        rentalType === "monthly";

    if (
        language === "en"
    ) {
        return monthly
            ? "📅 Monthly"
            : "🅿️ Hourly";
    }

    if (
        language === "zh-CN"
    ) {
        return monthly
            ? "📅 月租"
            : "🅿️ 临时停车";
    }

    if (
        language === "zh-TW"
    ) {
        return monthly
            ? "📅 月租"
            : "🅿️ 臨時停車";
    }

    if (
        language === "ko"
    ) {
        return monthly
            ? "📅 월정기"
            : "🅿️ 시간제";
    }

    return monthly
        ? "📅 月極"
        : "🅿️ 時間貸し";
}

export function ParkingList({
                                parkings,
                                target,
                                loading,
                                language,
                                onPick,
                            }: ParkingListProps) {
    const t =
        TEXT[language];

    /*
     * ============================================
     * ボトムシート
     * ============================================
     *
     * 下・中央・上の3段階
     * ============================================
     */

    const [
        panelHeight,
        setPanelHeight,
    ] =
        useState(
            80,
        );

    const [
        dragging,
        setDragging,
    ] =
        useState(
            false,
        );

    const startY =
        useRef(
            0,
        );

    const startHeight =
        useRef(
            80,
        );

    /*
     * ============================================
     * 3段階の高さ
     * ============================================
     */

    const getSnapHeights =
        () => {
            const screenHeight =
                window.innerHeight;

            /*
             * 下
             */
            const low =
                80;

            /*
             * 中央
             */
            const middle =
                Math.min(
                    110,
                    screenHeight *
                    0.55,
                );

            /*
             * 上
             */
            const high =
                screenHeight *
                0.75;

            return {
                low,
                middle,
                high,
            };
        };

    /*
     * ============================================
     * ドラッグ開始
     * ============================================
     */

    const handlePointerDown = (
        event:
        React.PointerEvent<HTMLDivElement>,
    ) => {
        setDragging(
            true,
        );

        startY.current =
            event.clientY;

        startHeight.current =
            panelHeight;

        event.currentTarget
            .setPointerCapture(
                event.pointerId,
            );
    };

    /*
     * ============================================
     * ドラッグ中
     * ============================================
     */

    const handlePointerMove = (
        event:
        React.PointerEvent<HTMLDivElement>,
    ) => {
        if (
            !dragging
        ) {
            return;
        }

        const {
            low,
            high,
        } =
            getSnapHeights();

        const diff =
            startY.current -
            event.clientY;

        const nextHeight =
            startHeight.current +
            diff;

        const limitedHeight =
            Math.min(
                Math.max(
                    nextHeight,
                    low,
                ),
                high,
            );

        setPanelHeight(
            limitedHeight,
        );
    };

    /*
     * ============================================
     * 一番近い段階へ吸着
     * ============================================
     */

    const snapPanel =
        () => {
            const {
                low,
                middle,
                high,
            } =
                getSnapHeights();

            const positions = [
                low,
                middle,
                high,
            ];

            const nearest =
                positions.reduce(
                    (
                        closest,
                        current,
                    ) => {
                        const currentDistance =
                            Math.abs(
                                current -
                                panelHeight,
                            );

                        const closestDistance =
                            Math.abs(
                                closest -
                                panelHeight,
                            );

                        return currentDistance <
                        closestDistance
                            ? current
                            : closest;
                    },
                );

            setPanelHeight(
                nearest,
            );

            setDragging(
                false,
            );
        };

    /*
     * ============================================
     * ドラッグ終了
     * ============================================
     */

    const handlePointerUp = (
        event:
        React.PointerEvent<HTMLDivElement>,
    ) => {
        if (
            event.currentTarget
                .hasPointerCapture(
                    event.pointerId,
                )
        ) {
            event.currentTarget
                .releasePointerCapture(
                    event.pointerId,
                );
        }

        snapPanel();
    };

    /*
     * ============================================
     * ドラッグキャンセル
     * ============================================
     */

    const handlePointerCancel =
        () => {
            snapPanel();
        };

    /*
     * ============================================
     * 本当に一番近い駐車場
     * ============================================
     */

    let closestParkingId:
        string | null =
        null;

    if (
        target &&
        parkings.length >
        0
    ) {
        let closestDistance =
            Number.POSITIVE_INFINITY;

        for (
            const parking
            of parkings
            ) {
            const distance =
                distanceMeters(
                    target,
                    parking,
                );

            if (
                distance <
                closestDistance
            ) {
                closestDistance =
                    distance;

                closestParkingId =
                    parking.id;
            }
        }
    }

    return (
        <div
            className={`absolute inset-x-0 bottom-0 overflow-hidden rounded-t-[32px] bg-white/95 pb-4 shadow-xl backdrop-blur-xl ${
                dragging
                    ? ""
                    : "transition-[height] duration-200 ease-out"
            }`}
            style={{
                zIndex:
                    9999,

                height:
                panelHeight,
            }}
        >
            {/*
             * ====================================
             * 上下ドラッグ用ハンドル
             * ====================================
             */}

            <div
                className="flex cursor-ns-resize touch-none select-none justify-center py-3"
                onPointerDown={
                    handlePointerDown
                }
                onPointerMove={
                    handlePointerMove
                }
                onPointerUp={
                    handlePointerUp
                }
                onPointerCancel={
                    handlePointerCancel
                }
            >
                <div className="h-1.5 w-16 rounded-full bg-slate-300" />
            </div>

            {/*
             * ====================================
             * タイトル
             * ====================================
             */}

            <div className="flex justify-between px-5 pt-1">
                <div>
                    <h2 className="text-sm font-black">
                        {target
                            ? `🅿️ ${t.nearbyParking}`
                            : `📍 ${t.chooseDestination}`}
                    </h2>

                    {target &&
                        parkings.length >
                        0 && (
                            <p className="mt-1 text-[9px] font-bold text-slate-400">
                                ⭐ ParkPalおすすめ順
                            </p>
                        )}
                </div>

                {target && (
                    <span className="text-xs text-slate-400">
                        {
                            parkings.length
                        }
                        {
                            t.count
                        }
                    </span>
                )}
            </div>

            {/*
             * ====================================
             * 読み込み中
             * ====================================
             */}

            {target &&
                loading && (
                    <p className="px-5 py-3 text-center text-xs font-bold text-slate-400">
                        🅿️ 駐車場を探しています...
                    </p>
                )}

            {/*
             * ====================================
             * 駐車場なし
             * ====================================
             */}

            {target &&
                !loading &&
                parkings.length ===
                0 && (
                    <p className="p-5 text-center text-xs">
                        {
                            t.noParking
                        }
                    </p>
                )}

            {/*
             * ====================================
             * 駐車場カード一覧
             * ====================================
             */}

            <div className="flex gap-3 overflow-x-auto px-5 py-3">
                {parkings.map(
                    (
                        parking,
                        index,
                    ) => {
                        const distance =
                            target
                                ? distanceMeters(
                                    target,
                                    parking,
                                )
                                : parking.distance;

                        /*
                         * ParkPalおすすめ
                         */

                        const isRecommended =
                            index ===
                            0;

                        /*
                         * 最短
                         */

                        const isClosest =
                            parking.id ===
                            closestParkingId;

                        /*
                         * =================================
                         * 月極判定
                         * =================================
                         */

                        const isMonthly =
                            parking.rentalType ===
                            "monthly";

                        const isStudent =
                            Boolean(
                                parking.studentFriendly,
                            );

                        const rentalLabel =
                            getRentalLabel(
                                parking.rentalType,
                                language,
                            );

                        return (
                            <button
                                key={
                                    parking.id
                                }
                                type="button"
                                onClick={() =>
                                    onPick(
                                        parking,
                                    )
                                }
                                className={`relative mt-2 w-[240px] shrink-0 rounded-3xl bg-white p-3 text-left shadow-sm ${
                                    isRecommended
                                        ? "ring-2 ring-emerald-400"
                                        : isMonthly
                                            ? "ring-2 ring-violet-300"
                                            : "ring-1 ring-slate-200"
                                }`}
                            >
                                {/*
                                 * ====================================
                                 * 上部バッジ
                                 * ====================================
                                 */}

                                <div className="absolute -top-3 left-3 flex flex-wrap gap-1">
                                    {isRecommended && (
                                        <span className="rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-black text-white shadow-sm">
                                            ⭐ ParkPalおすすめ
                                        </span>
                                    )}

                                    {isClosest && (
                                        <span className="rounded-full bg-blue-500 px-2 py-1 text-[9px] font-black text-white shadow-sm">
                                            📍 最短
                                        </span>
                                    )}
                                </div>

                                {/*
                                 * ====================================
                                 * 名前
                                 * ====================================
                                 */}

                                <div className="mt-1 flex gap-3">
                                    <div
                                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl font-black text-white ${
                                            isStudent
                                                ? "bg-green-600"
                                                : isMonthly
                                                    ? "bg-violet-600"
                                                    : "bg-blue-600"
                                        }`}
                                    >
                                        {
                                            isStudent
                                                ? "S"
                                                : isMonthly
                                                    ? "M"
                                                    : "P"
                                        }
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        {/*
                                         * 時間貸し / 月極
                                         */}

                                        <div className="flex flex-wrap gap-1">
                                            {isStudent && (
                                                <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[8px] font-black text-green-700">
                                                    🎓 学生向け
                                                </span>
                                            )}

                                            <span
                                                className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-black ${
                                                    isMonthly
                                                        ? "bg-violet-100 text-violet-700"
                                                        : "bg-blue-50 text-blue-600"
                                                }`}
                                            >
                                                {
                                                    rentalLabel
                                                }
                                            </span>
                                        </div>

                                        <p className="mt-1 line-clamp-2 text-xs font-black">
                                            {
                                                parking.name
                                            }
                                        </p>

                                        <p
                                            className={`mt-1 text-[10px] font-black ${
                                                isMonthly
                                                    ? "text-violet-600"
                                                    : "text-orange-500"
                                            }`}
                                        >
                                            {
                                                parking.price
                                            }
                                        </p>

                                        {isMonthly &&
                                            parking.monthlyPrice !==
                                            null &&
                                            parking.monthlyPrice !==
                                            undefined && (
                                                <p className="mt-1 text-[9px] font-bold text-violet-500">
                                                    月額料金
                                                </p>
                                            )}
                                    </div>
                                </div>

                                {/*
                                 * ====================================
                                 * 月極案内
                                 * ====================================
                                 */}

                                {isMonthly && (
                                    <div className="mt-3 rounded-xl bg-violet-50 px-3 py-2">
                                        <p className="text-[10px] font-black text-violet-700">
                                            📅 通学向け月極
                                        </p>

                                        <p className="mt-0.5 text-[9px] font-bold text-violet-500">
                                            長期利用向けの駐車場です
                                        </p>
                                    </div>
                                )}

                                {/*
                                 * ====================================
                                 * ParkPal学生向け
                                 * ====================================
                                 */}

                                {isStudent && (
                                    <div className="mt-3 rounded-xl bg-green-50 px-3 py-2">
                                        <p className="text-[10px] font-black text-green-700">
                                            🎓 学生向け駐車場
                                        </p>

                                        <p className="mt-0.5 text-[9px] font-bold text-green-600">
                                            学生が利用しやすい駐車場として登録されています
                                        </p>
                                    </div>
                                )}

                                {/*
                                 * ====================================
                                 * 施設利用者向け注意
                                 * ====================================
                                 */}

                                {parking.isFacility && (
                                    <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2">
                                        <p className="text-[10px] font-black text-amber-700">
                                            ⚠️ 施設利用者向け
                                        </p>

                                        <p className="mt-0.5 text-[9px] font-bold text-amber-600">
                                            利用条件を確認してください
                                        </p>
                                    </div>
                                )}

                                {/*
                                 * ====================================
                                 * 駐車場の特徴
                                 * ====================================
                                 */}

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {parking.isPaid && (
                                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black text-amber-700">
                                            💰{" "}
                                            {
                                                t.paidParking
                                            }
                                        </span>
                                    )}

                                    {parking.isHidden && (
                                        <span className="rounded-full bg-violet-100 px-2 py-1 text-[9px] font-black text-violet-700">
                                            👀{" "}
                                            {
                                                t.hiddenParking
                                            }
                                        </span>
                                    )}

                                    {parking.isIndoor && (
                                        <span className="rounded-full bg-sky-100 px-2 py-1 text-[9px] font-black text-sky-700">
                                            🏢{" "}
                                            {
                                                t.indoorParking
                                            }
                                        </span>
                                    )}

                                    {parking.isFacility && (
                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black text-emerald-700">
                                            🏪{" "}
                                            {
                                                t.facilityParking
                                            }
                                        </span>
                                    )}

                                    {parking.isAccessible && (
                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-[9px] font-black text-blue-700">
                                            ♿{" "}
                                            {
                                                t.accessibleParking
                                            }
                                        </span>
                                    )}

                                    {parking.securityCamera && (
                                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-700">
                                            📷 防犯カメラ
                                        </span>
                                    )}

                                    {parking.streetLight && (
                                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-[9px] font-black text-yellow-700">
                                            💡 街灯あり
                                        </span>
                                    )}

                                    {parking.securityStaff && (
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-black text-green-700">
                                            🛡️ 管理あり
                                        </span>
                                    )}
                                </div>

                                {/*
                                 * ====================================
                                 * 徒歩・車・距離
                                 * ====================================
                                 */}

                                <div className="mt-3 flex gap-2">
                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px]">
                                        🚶{" "}
                                        {walkMinutes(
                                            distance,
                                        )}{" "}
                                        {
                                            t.minute
                                        }
                                    </span>

                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px]">
                                        🚗{" "}
                                        {driveMinutes(
                                            distance,
                                        )}{" "}
                                        {
                                            t.minute
                                        }
                                    </span>

                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px]">
                                        {Math.round(
                                            distance,
                                        )}
                                        m
                                    </span>
                                </div>

                                {/*
                                 * ====================================
                                 * 安全度
                                 * ====================================
                                 */}

                                {parking.safetyScore !==
                                    null &&
                                    parking.safetyScore !==
                                    undefined && (
                                        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700">
                                            🛡️ 安全度{" "}
                                            {
                                                parking.safetyScore
                                            }
                                            /5
                                        </div>
                                    )}

                                {/*
                                 * ====================================
                                 * 空き情報
                                 * ====================================
                                 */}

                                {!isMonthly && (
                                    <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[10px]">
                                        ⚪{" "}
                                        {
                                            t.availability
                                        }
                                        :{" "}
                                        {
                                            t.noLiveData
                                        }
                                    </div>
                                )}

                                {isMonthly && (
                                    <div className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-[10px] font-bold text-violet-700">
                                        📞 契約状況は要確認
                                    </div>
                                )}
                            </button>
                        );
                    },
                )}
            </div>
        </div>
    );
}
