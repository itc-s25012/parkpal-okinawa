import type {
    Landmark,
} from "@/lib/landmark-types";

/*
 * ============================================
 * 南部専門学校
 * 浦添市
 *
 * vs24 ～ vs25
 *
 * 検索対応：
 * 日本語
 * English
 * 中文（简体）
 * 中文（繁體）
 * 한국어
 * ============================================
 */

export const URASOE_VOCATIONAL_SCHOOLS:
    Landmark[] = [

    /*
     * ========================================
     * vs24
     * インターナショナルデザインアカデミー
     * ========================================
     */

    {
        id: "vs24",

        name:
            "インターナショナルデザインアカデミー",

        aliases: [
            // 日本語
            "インターナショナルデザインアカデミー",
            "IDA",
            "アイディーエー",
            "デザインアカデミー",
            "インターナショナルデザイン",
            "KBC",
            "KBCデザイン＆アート専門学校",
            "KBCデザイン&アート専門学校",

            // English
            "International Design Academy",
            "International Design Academy Okinawa",
            "KBC Design and Art College",
            "KBC Design & Art College",
            "Design Academy",
            "IDA",

            // 中文・簡体字
            "国际设计学院",
            "冲绳国际设计学院",
            "设计艺术学院",
            "KBC设计艺术专门学校",
            "IDA",

            // 中文・繁體字
            "國際設計學院",
            "沖繩國際設計學院",
            "設計藝術學院",
            "KBC設計藝術專門學校",
            "IDA",

            // 한국어
            "인터내셔널 디자인 아카데미",
            "오키나와 국제 디자인 아카데미",
            "국제 디자인 아카데미",
            "KBC 디자인 아트 전문학교",
            "IDA",
        ],

        lat:
            26.267362238405926,

        lng:
            127.71938533695494,

        category:
            "vocational",

        area:
            "浦添市牧港",

        address:
            "沖縄県浦添市牧港1丁目60-14",
    },

    /*
     * ========================================
     * vs25
     * 琉球調理製菓専門学校
     * ========================================
     */

    {
        id: "vs25",

        name:
            "琉球調理製菓専門学校",

        aliases: [
            // 日本語
            "琉球調理製菓専門学校",
            "琉球調理",
            "琉球製菓",
            "調理製菓",
            "琉調",
            "りゅうちょう",
            "琉球調理師専修学校",

            // English
            "Ryukyu Culinary and Confectionery College",
            "Ryukyu Culinary College",
            "Ryukyu Cooking and Confectionery School",
            "Ryukyu Cooking School",
            "Ryukyu Culinary",

            // 中文・簡体字
            "琉球烹饪制果专门学校",
            "琉球烹饪糕点专门学校",
            "琉球烹饪学校",
            "琉球制果学校",
            "琉球烹饪",

            // 中文・繁體字
            "琉球烹飪製菓專門學校",
            "琉球烹飪糕點專門學校",
            "琉球烹飪學校",
            "琉球製菓學校",
            "琉球烹飪",

            // 한국어
            "류큐 조리 제과 전문학교",
            "류큐 요리 제과 전문학교",
            "류큐 조리학교",
            "류큐 제과학교",
            "류큐 조리",
        ],

        lat:
            26.245,

        lng:
            127.73,

        category:
            "vocational",

        area:
            "浦添市前田",

        address:
            "沖縄県浦添市前田3丁目15-3",
    },
];