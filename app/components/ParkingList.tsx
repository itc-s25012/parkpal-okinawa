"use client";

import {
    distanceMeters,
    driveMinutes,
    walkMinutes,
} from "@/lib/okinawa-data";

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
     * 駐車場の特徴
     */
    isPaid?: boolean;
    isHidden?: boolean;
    isIndoor?: boolean;
    isFacility?: boolean;
    isAccessible?: boolean;
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

export function ParkingList({
                                parkings,
                                target,
                                loading,
                                language,
                                onPick,
                            }: ParkingListProps) {
    const t =
        TEXT[language];

    return (
        <div
            className="absolute inset-x-0 bottom-0 rounded-t-[32px] bg-white/95 pb-4 shadow-xl backdrop-blur-xl"
            style={{
                zIndex: 1050,
            }}
        >
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-slate-300" />

            <div className="flex justify-between px-5 pt-3">
                <h2 className="text-sm font-black">
                    {target
                        ? `🅿️ ${t.nearbyParking}`
                        : `📍 ${t.chooseDestination}`}
                </h2>

                {target && (
                    <span className="text-xs text-slate-400">
                        {parkings.length}
                        {t.count}
                    </span>
                )}
            </div>

            {target &&
                !loading &&
                parkings.length === 0 && (
                    <p className="p-5 text-center text-xs">
                        {t.noParking}
                    </p>
                )}

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
                                className={`relative w-[240px] shrink-0 rounded-3xl bg-white p-3 text-left ${
                                    index === 0
                                        ? "ring-2 ring-emerald-400"
                                        : "ring-1 ring-slate-200"
                                }`}
                            >
                                {index === 0 && (
                                    <span className="absolute -top-2 rounded-full bg-emerald-500 px-2 py-1 text-[9px] text-white">
                                        {
                                            t.closest
                                        }
                                    </span>
                                )}

                                <div className="flex gap-3">
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-xl font-black text-white">
                                        P
                                    </div>

                                    <div className="min-w-0">
                                        <p className="line-clamp-2 text-xs font-black">
                                            {
                                                parking.name
                                            }
                                        </p>

                                        <p className="mt-1 text-[10px] font-bold text-orange-500">
                                            {
                                                parking.price
                                            }
                                        </p>
                                    </div>
                                </div>

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
                                </div>

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
                            </button>
                        );
                    },
                )}
            </div>
        </div>
    );
}