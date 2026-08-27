
"use client";

import type { ReactNode } from "react";

import {
    driveMinutes,
    walkMinutes,
} from "@/lib/okinawa-data";

import {
    TEXT,
    type Language,
} from "@/lib/translations";

import type {
    ParkingSpot,
} from "@/app/components/ParkingList";

type Props = {
    spot: ParkingSpot;
    distance: number;
    language: Language;
    onClose: () => void;
};

function getRentalLabel(
    rentalType: string | null | undefined,
    language: Language,
) {
    const monthly =
        rentalType === "monthly";

    if (language === "en") {
        return monthly ? "Monthly" : "Hourly";
    }

    if (language === "zh-CN") {
        return monthly ? "月租" : "临时停车";
    }

    if (language === "zh-TW") {
        return monthly ? "月租" : "臨時停車";
    }

    if (language === "ko") {
        return monthly ? "월정기" : "시간제";
    }

    return monthly ? "月極" : "時間貸し";
}

export function ParkingInfoSection({
                                       spot,
                                       distance,
                                       language,
                                       onClose,
                                   }: Props) {
    const t =
        TEXT[language];

    const isMonthly =
        spot.rentalType === "monthly";

    const rentalLabel =
        getRentalLabel(
            spot.rentalType,
            language,
        );

    return (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
            <div className="flex gap-3">
                <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl font-black text-white ${
                        isMonthly
                            ? "bg-violet-600"
                            : "bg-blue-600"
                    }`}
                >
                    {isMonthly ? "M" : "P"}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[10px] font-black text-slate-400">
                            {t.parkingInfo}
                        </p>

                        <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                                isMonthly
                                    ? "bg-violet-100 text-violet-700"
                                    : "bg-blue-50 text-blue-600"
                            }`}
                        >
                            {isMonthly
                                ? `📅 ${rentalLabel}`
                                : `🅿️ ${rentalLabel}`}
                        </span>
                    </div>

                    <h3 className="mt-1 font-black">
                        {spot.name}
                    </h3>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-lg font-black text-slate-500"
                >
                    ×
                </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <Info
                    label={t.walk}
                    value={`${walkMinutes(distance)} ${t.minute}`}
                />

                <Info
                    label={t.drive}
                    value={`${driveMinutes(distance)} ${t.minute}`}
                />

                <Info
                    label={t.distance}
                    value={`${Math.round(distance)}m`}
                />
            </div>

            <div
                className={`mt-3 rounded-2xl p-4 ${
                    isMonthly
                        ? "bg-violet-50"
                        : "bg-orange-50"
                }`}
            >
                <p
                    className={`text-[10px] font-black ${
                        isMonthly
                            ? "text-violet-400"
                            : "text-orange-400"
                    }`}
                >
                    {isMonthly
                        ? "MONTHLY PRICE"
                        : "PRICE"}
                </p>

                <p
                    className={`mt-1 font-black ${
                        isMonthly
                            ? "text-violet-700"
                            : "text-orange-600"
                    }`}
                >
                    {spot.price}
                </p>

                {isMonthly &&
                    spot.monthlyPrice !== null &&
                    spot.monthlyPrice !== undefined && (
                        <p className="mt-1 text-[10px] font-bold text-violet-500">
                            月額{" "}
                            {spot.monthlyPrice.toLocaleString(
                                "ja-JP",
                            )}
                            円
                        </p>
                    )}
            </div>

            {isMonthly && (
                <div className="mt-3 rounded-2xl bg-violet-50 p-4">
                    <p className="text-xs font-black text-violet-700">
                        📅 月極駐車場
                    </p>

                    <p className="mt-1 text-[10px] font-bold leading-relaxed text-violet-600">
                        通学などの長期利用向けです。
                        契約状況や空き状況は運営元へ確認してください。
                    </p>
                </div>
            )}

            {spot.openingHours && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black text-slate-400">
                        OPEN
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-700">
                        🕒 {spot.openingHours}
                    </p>
                </div>
            )}

            {(spot.isPaid ||
                spot.isHidden ||
                spot.isIndoor ||
                spot.isFacility ||
                spot.isAccessible ||
                isMonthly) && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {isMonthly && (
                        <Tag className="bg-violet-100 text-violet-700">
                            📅 月極
                        </Tag>
                    )}

                    {spot.isPaid && (
                        <Tag className="bg-amber-100 text-amber-700">
                            💰 {t.paidParking}
                        </Tag>
                    )}

                    {spot.isHidden && (
                        <Tag className="bg-violet-100 text-violet-700">
                            👀 {t.hiddenParking}
                        </Tag>
                    )}

                    {spot.isIndoor && (
                        <Tag className="bg-sky-100 text-sky-700">
                            🏢 {t.indoorParking}
                        </Tag>
                    )}

                    {spot.isFacility && (
                        <Tag className="bg-emerald-100 text-emerald-700">
                            🏪 {t.facilityParking}
                        </Tag>
                    )}

                    {spot.isAccessible && (
                        <Tag className="bg-blue-100 text-blue-700">
                            ♿ {t.accessibleParking}
                        </Tag>
                    )}
                </div>
            )}

            {spot.studentFriendly && (
                <div className="mt-3 rounded-2xl bg-indigo-50 p-4">
                    <p className="text-xs font-black text-indigo-700">
                        🎓 学生におすすめ
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-indigo-500">
                        ParkPal確認済み情報
                    </p>
                </div>
            )}

            {spot.safetyScore !== null &&
                spot.safetyScore !== undefined && (
                    <div className="mt-3 rounded-2xl bg-emerald-50 p-4">
                        <p className="text-xs font-bold">
                            {t.safety}
                        </p>

                        <p className="text-lg font-black">
                            {spot.safetyScore}/100
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
                    {spot.tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full bg-sky-50 px-3 py-1 text-[10px]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
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

function Tag({
                 children,
                 className,
             }: {
    children: ReactNode;
    className: string;
}) {
    return (
        <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-black ${className}`}
        >
            {children}
        </span>
    );
}
