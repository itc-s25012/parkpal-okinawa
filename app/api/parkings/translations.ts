import type {
    Language,
} from "./types";

/*
 * ============================================
 * 言語コードをParkPal用に変換
 * ============================================
 */

export function normalizeLanguage(
    value: string | null,
): Language {
    if (
        value === "en" ||
        value === "zh-CN" ||
        value === "zh-TW" ||
        value === "ko"
    ) {
        return value;
    }

    return "ja";
}

/*
 * ============================================
 * 言語ラベル
 * ============================================
 */

export const LANGUAGE_LABELS:
    Record<Language, string> = {
    ja: "🇯🇵 日本語",
    en: "🇺🇸 English",
    "zh-CN": "🇨🇳 简体中文",
    "zh-TW": "🇹🇼 繁體中文",
    ko: "🇰🇷 한국어",
};

/*
 * ============================================
 * API用 翻訳
 * ============================================
 */

export const TEXT = {
    ja: {
        parking:
            "駐車場",

        free:
            "無料",

        paid:
            "有料",

        paidUnknown:
            "有料・料金要確認",

        priceUnknown:
            "料金要確認",

        camera:
            "防犯カメラ",

        light:
            "街灯あり",

        staff:
            "管理スタッフ",

        student:
            "学生向け",

        registered:
            "駐車場",

        operator:
            "運営",

        spaces:
            "台",

        customers:
            "利用者専用",

        surface:
            "平面駐車場",

        multiStorey:
            "立体駐車場",

        underground:
            "地下駐車場",

        rooftop:
            "屋上駐車場",
    },

    en: {
        parking:
            "Parking",

        free:
            "Free",

        paid:
            "Paid",

        paidUnknown:
            "Paid · Price unknown",

        priceUnknown:
            "Price unknown",

        camera:
            "Security camera",

        light:
            "Lighting",

        staff:
            "Security staff",

        student:
            "Student friendly",

        registered:
            "Parking",

        operator:
            "Operator",

        spaces:
            " spaces",

        customers:
            "Customers only",

        surface:
            "Surface parking",

        multiStorey:
            "Multi-storey parking",

        underground:
            "Underground parking",

        rooftop:
            "Rooftop parking",
    },

    "zh-CN": {
        parking:
            "停车场",

        free:
            "免费",

        paid:
            "收费",

        paidUnknown:
            "收费・价格待确认",

        priceUnknown:
            "价格待确认",

        camera:
            "监控摄像头",

        light:
            "有照明",

        staff:
            "有管理人员",

        student:
            "适合学生",

        registered:
            "停车场",

        operator:
            "运营方",

        spaces:
            "个车位",

        customers:
            "仅限顾客",

        surface:
            "地面停车场",

        multiStorey:
            "立体停车场",

        underground:
            "地下停车场",

        rooftop:
            "屋顶停车场",
    },

    "zh-TW": {
        parking:
            "停車場",

        free:
            "免費",

        paid:
            "收費",

        paidUnknown:
            "收費・價格待確認",

        priceUnknown:
            "價格待確認",

        camera:
            "監視器",

        light:
            "有照明",

        staff:
            "有管理人員",

        student:
            "適合學生",

        registered:
            "停車場",

        operator:
            "營運方",

        spaces:
            "個車位",

        customers:
            "僅限顧客",

        surface:
            "平面停車場",

        multiStorey:
            "立體停車場",

        underground:
            "地下停車場",

        rooftop:
            "屋頂停車場",
    },

    ko: {
        parking:
            "주차장",

        free:
            "무료",

        paid:
            "유료",

        paidUnknown:
            "유료 · 요금 확인 필요",

        priceUnknown:
            "요금 확인 필요",

        camera:
            "방범 카메라",

        light:
            "조명 있음",

        staff:
            "관리 직원",

        student:
            "학생 추천",

        registered:
            "주차장",

        operator:
            "운영",

        spaces:
            "대",

        customers:
            "이용객 전용",

        surface:
            "노상 외 평면 주차장",

        multiStorey:
            "입체 주차장",

        underground:
            "지하 주차장",

        rooftop:
            "옥상 주차장",
    },
} satisfies Record<
    Language,
    Record<string, string>
>;