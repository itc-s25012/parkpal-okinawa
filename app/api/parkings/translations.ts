import type {
    Language,
} from "./types";

export const TEXT = {
    ja: {
        parking:
            "駐車場",

        operator:
            "運営",

        spaces:
            "台",

        free:
            "無料",

        paid:
            "有料",

        paidUnknown:
            "有料・料金未登録",

        priceUnknown:
            "料金情報なし",

        customers:
            "施設利用者向け",

        surface:
            "平面駐車場",

        multiStorey:
            "立体駐車場",

        underground:
            "地下駐車場",

        rooftop:
            "屋上駐車場",

        registered:
            "OpenStreetMap登録駐車場",

        camera:
            "📷 防犯カメラあり",

        light:
            "💡 街灯あり",

        staff:
            "🛡️ 管理スタッフあり",

        student:
            "🎓 学生向け",
    },

    en: {
        parking:
            "Parking",

        operator:
            "Operator",

        spaces:
            " spaces",

        free:
            "Free",

        paid:
            "Paid",

        paidUnknown:
            "Paid · Price unavailable",

        priceUnknown:
            "Price unavailable",

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

        registered:
            "OpenStreetMap parking",

        camera:
            "📷 Security camera",

        light:
            "💡 Lighting available",

        staff:
            "🛡️ Staff on site",

        student:
            "🎓 Student friendly",
    },

    "zh-CN": {
        parking:
            "停车场",

        operator:
            "运营",

        spaces:
            "个车位",

        free:
            "免费",

        paid:
            "收费",

        paidUnknown:
            "收费 · 暂无价格信息",

        priceUnknown:
            "暂无价格信息",

        customers:
            "仅限设施用户",

        surface:
            "地面停车场",

        multiStorey:
            "立体停车场",

        underground:
            "地下停车场",

        rooftop:
            "屋顶停车场",

        registered:
            "OpenStreetMap登记停车场",

        camera:
            "📷 有监控摄像头",

        light:
            "💡 有照明",

        staff:
            "🛡️ 有管理人员",

        student:
            "🎓 学生友好",
    },

    "zh-TW": {
        parking:
            "停車場",

        operator:
            "營運",

        spaces:
            "個車位",

        free:
            "免費",

        paid:
            "收費",

        paidUnknown:
            "收費 · 暫無價格資訊",

        priceUnknown:
            "暫無價格資訊",

        customers:
            "僅限設施使用者",

        surface:
            "平面停車場",

        multiStorey:
            "立體停車場",

        underground:
            "地下停車場",

        rooftop:
            "屋頂停車場",

        registered:
            "OpenStreetMap登記停車場",

        camera:
            "📷 有監視器",

        light:
            "💡 有照明",

        staff:
            "🛡️ 有管理人員",

        student:
            "🎓 學生友善",
    },

    ko: {
        parking:
            "주차장",

        operator:
            "운영",

        spaces:
            "대",

        free:
            "무료",

        paid:
            "유료",

        paidUnknown:
            "유료 · 요금 정보 없음",

        priceUnknown:
            "요금 정보 없음",

        customers:
            "시설 이용자 전용",

        surface:
            "평면 주차장",

        multiStorey:
            "입체 주차장",

        underground:
            "지하 주차장",

        rooftop:
            "옥상 주차장",

        registered:
            "OpenStreetMap 등록 주차장",

        camera:
            "📷 방범 카메라 있음",

        light:
            "💡 조명 있음",

        staff:
            "🛡️ 관리 직원 있음",

        student:
            "🎓 학생 친화",
    },
} satisfies Record<
    Language,
    Record<
        string,
        string
    >
>;

export function normalizeLanguage(
    value:
        string | null,
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