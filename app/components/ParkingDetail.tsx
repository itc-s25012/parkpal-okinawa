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

import type {
    ParkingSpot,
    Target,
} from "@/app/components/ParkingList";

type ParkingDetailProps = {
    spot: ParkingSpot;
    target: Target | null;
    language: Language;
    onClose: () => void;
};

export function ParkingDetail({
                                  spot,
                                  target,
                                  language,
                                  onClose,
                              }: ParkingDetailProps) {
    const t =
        TEXT[language];

    const distance =
        target
            ? distanceMeters(
                target,
                spot,
            )
            : spot.distance;

    const navigationUrl =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${spot.lat},${spot.lng}` +
        `&travelmode=driving` +
        `&dir_action=navigate`;

    return (
        <div
            className="absolute inset-x-0 bottom-0 rounded-t-[32px] bg-white p-5 shadow-xl"
            style={{
                zIndex: 1100,
            }}
        >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-300" />

            <div className="flex gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-xl font-black text-white">
                    P
                </div>

                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400">
                        {t.parkingInfo}
                    </p>

                    <h3 className="font-black">
                        {spot.name}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <Info
                    label={t.walk}
                    value={`${walkMinutes(
                        distance,
                    )} ${t.minute}`}
                />

                <Info
                    label={t.drive}
                    value={`${driveMinutes(
                        distance,
                    )} ${t.minute}`}
                />

                <Info
                    label={t.distance}
                    value={`${Math.round(
                        distance,
                    )}m`}
                />
            </div>

            <div className="mt-3 rounded-2xl bg-orange-50 p-4">
                <p className="text-[10px] font-black text-orange-400">
                    PRICE
                </p>

                <p className="font-black text-orange-600">
                    {spot.price}
                </p>
            </div>

            {/*
             * ====================================
             * 駐車場の特徴
             * ====================================
             */}

            {(spot.isPaid ||
                spot.isHidden ||
                spot.isIndoor ||
                spot.isFacility ||
                spot.isAccessible) && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {spot.isPaid && (
                        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-black text-amber-700">
                            💰{" "}
                            {
                                t.paidParking
                            }
                        </span>
                    )}

                    {spot.isHidden && (
                        <span className="rounded-full bg-violet-100 px-3 py-1.5 text-[10px] font-black text-violet-700">
                            👀{" "}
                            {
                                t.hiddenParking
                            }
                        </span>
                    )}

                    {spot.isIndoor && (
                        <span className="rounded-full bg-sky-100 px-3 py-1.5 text-[10px] font-black text-sky-700">
                            🏢{" "}
                            {
                                t.indoorParking
                            }
                        </span>
                    )}

                    {spot.isFacility && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                            🏪{" "}
                            {
                                t.facilityParking
                            }
                        </span>
                    )}

                    {spot.isAccessible && (
                        <span className="rounded-full bg-blue-100 px-3 py-1.5 text-[10px] font-black text-blue-700">
                            ♿{" "}
                            {
                                t.accessibleParking
                            }
                        </span>
                    )}
                </div>
            )}

            {spot.safetyScore !==
                null &&
                spot.safetyScore !==
                undefined && (
                    <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs font-bold">
                            {t.safety}
                        </p>

                        <p className="text-lg font-black">
                            {
                                spot.safetyScore
                            }
                            /100
                        </p>
                    </div>
                )}

            <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-slate-50 p-3">
                    📷 {t.camera}

                    <p className="font-bold">
                        {spot.securityCamera
                            ? t.yes
                            : t.no}
                    </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-3">
                    💡 {t.lighting}

                    <p className="font-bold">
                        {spot.streetLight
                            ? t.yes
                            : t.no}
                    </p>
                </div>
            </div>

            {spot.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {spot.tags.map(
                        (
                            tag,
                        ) => (
                            <span
                                key={
                                    tag
                                }
                                className="rounded-full bg-sky-50 px-3 py-1 text-[10px]"
                            >
                                {
                                    tag
                                }
                            </span>
                        ),
                    )}
                </div>
            )}

            <a
                href={
                    navigationUrl
                }
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex justify-center rounded-2xl bg-slate-950 py-3 text-sm font-black text-white"
            >
                🚗 {t.route}
            </a>
        </div>
    );
}

function Info({
                  label,
                  value,
              }: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl bg-slate-100 p-3 text-center">
            <p className="text-[9px] text-slate-400">
                {label}
            </p>

            <p className="text-xs font-black">
                {value}
            </p>
        </div>
    );
}