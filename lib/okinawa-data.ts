export type Landmark = {
    id: string;
    name: string;
    kana?: string;
    aliases: string[];
    lat: number;
    lng: number;
    category: "vocational" | "cram" | "area" | "tourist";
    area?: string;
};

export type ParkingSpot = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    price: string;
    maxPrice?: string;
    tags: string[];
    emoji: string;
    photo: string;
};

export const VOCATIONAL_SCHOOLS: Landmark[] = [
    {
        id: "v1",
        name: "専門学校ITカレッジ沖縄",
        aliases: ["ITカレッジ", "IT college", "itcollege", "アイティー"],
        lat: 26.2185,
        lng: 127.6912,
        category: "vocational",
        area: "那覇市樋川",
    },
    {
        id: "v2",
        name: "沖縄大原簿記公務員専門学校",
        aliases: ["大原", "大原簿記", "oohara"],
        lat: 26.212,
        lng: 127.6785,
        category: "vocational",
        area: "那覇市旭町",
    },
    {
        id: "v3",
        name: "国際電子ビジネス専門学校 (KBC)",
        aliases: ["KBC", "国際電子", "電子ビジネス"],
        lat: 26.2045,
        lng: 127.683,
        category: "vocational",
        area: "那覇市壺川",
    },
    {
        id: "v4",
        name: "ビューティーモードカレッジ (KBC)",
        aliases: ["ビューティーモード", "KBC", "beauty mode"],
        lat: 26.2122,
        lng: 127.674,
        category: "vocational",
        area: "那覇市東町",
    },
    {
        id: "v5",
        name: "インターナショナルリゾートカレッジ (KBC)",
        aliases: ["インターナショナルリゾート", "KBC", "IRC"],
        lat: 26.195,
        lng: 127.662,
        category: "vocational",
        area: "那覇市金城",
    },
    {
        id: "v6",
        name: "沖縄ペットワールド専門学校",
        aliases: ["ペットワールド", "pet world"],
        lat: 26.2125,
        lng: 127.6745,
        category: "vocational",
        area: "那覇市東町",
    },
    {
        id: "v7",
        name: "沖縄みらいAI&IT専門学校 (三幸学園)",
        aliases: ["みらいAI", "三幸", "みらい"],
        lat: 26.2225,
        lng: 127.688,
        category: "vocational",
        area: "那覇市泊",
    },
    {
        id: "v8",
        name: "沖縄ビューティー＆ブライダル専門学校 (三幸学園)",
        aliases: ["ビューティーブライダル", "三幸", "ブライダル"],
        lat: 26.226,
        lng: 127.69,
        category: "vocational",
        area: "那覇市上之屋",
    },
    {
        id: "v9",
        name: "沖縄リゾート＆スポーツ専門学校 (三幸学園)",
        aliases: ["リゾートスポーツ", "三幸", "スポーツ専門"],
        lat: 26.226,
        lng: 127.69,
        category: "vocational",
        area: "那覇市上之屋",
    },
    {
        id: "v10",
        name: "沖縄こども専門学校 (三幸学園)",
        aliases: ["こども専門", "三幸", "kodomo"],
        lat: 26.2215,
        lng: 127.6875,
        category: "vocational",
        area: "那覇市泊",
    },
    {
        id: "v11",
        name: "尚学院公務員法律大学校",
        aliases: ["尚学院", "公務員法律", "shougakuin"],
        lat: 26.223,
        lng: 127.6895,
        category: "vocational",
        area: "那覇市泊",
    },
    {
        id: "v12",
        name: "尚学院国際ビジネスアカデミー",
        aliases: ["尚学院", "国際ビジネス"],
        lat: 26.2235,
        lng: 127.689,
        category: "vocational",
        area: "那覇市泊",
    },
    {
        id: "v13",
        name: "沖縄ラフ＆ピース専門学校",
        aliases: ["ラフピース", "ラフ＆ピース", "laugh peace"],
        lat: 26.2155,
        lng: 127.688,
        category: "vocational",
        area: "那覇市松尾",
    },
    {
        id: "v14",
        name: "沖縄ビジネス外語学院",
        aliases: ["ビジネス外語", "外語学院"],
        lat: 26.215,
        lng: 127.6815,
        category: "vocational",
        area: "那覇市久茂地",
    },
    {
        id: "v15",
        name: "大育情報ビジネス専門学校",
        aliases: ["大育", "大育情報", "daiiku"],
        lat: 26.219,
        lng: 127.697,
        category: "vocational",
        area: "那覇市大道",
    },
];

export const CRAM_SCHOOLS: Landmark[] = [
    {
        id: "c1",
        name: "即解ゼミ127°E おもろまち本校",
        aliases: ["即解ゼミ", "即解", "おもろまち"],
        lat: 26.223,
        lng: 127.696,
        category: "cram",
    },
    {
        id: "c2",
        name: "即解ゼミ 首里校",
        aliases: ["即解ゼミ", "即解", "首里"],
        lat: 26.218,
        lng: 127.715,
        category: "cram",
    },
    {
        id: "c3",
        name: "即解ゼミ 沖縄市校",
        aliases: ["即解ゼミ", "即解", "沖縄市"],
        lat: 26.3355,
        lng: 127.798,
        category: "cram",
    },
    {
        id: "c4",
        name: "沖ゼミ 那覇本校",
        aliases: ["沖ゼミ", "那覇本校"],
        lat: 26.221,
        lng: 127.694,
        category: "cram",
    },
    {
        id: "c5",
        name: "沖ゼミ 宜野湾校",
        aliases: ["沖ゼミ", "宜野湾"],
        lat: 26.273,
        lng: 127.738,
        category: "cram",
    },
    {
        id: "c6",
        name: "沖ゼミ 沖縄市校",
        aliases: ["沖ゼミ", "沖縄市"],
        lat: 26.336,
        lng: 127.799,
        category: "cram",
    },
];

export const AREAS: Landmark[] = [
    {
        id: "a1",
        name: "開南エリア",
        aliases: ["開南"],
        lat: 26.2105,
        lng: 127.6842,
        category: "area",
    },
    {
        id: "a2",
        name: "安里エリア",
        aliases: ["安里"],
        lat: 26.2185,
        lng: 127.694,
        category: "area",
    },
    {
        id: "a3",
        name: "壺川エリア",
        aliases: ["壺川"],
        lat: 26.205,
        lng: 127.678,
        category: "area",
    },
    {
        id: "a4",
        name: "コザ (沖縄市中心)",
        aliases: ["コザ", "沖縄市"],
        lat: 26.3365,
        lng: 127.7981,
        category: "area",
    },
    {
        id: "a5",
        name: "おもろまち・新都心",
        aliases: ["おもろまち", "新都心"],
        lat: 26.223,
        lng: 127.6955,
        category: "area",
    },
];

export const TOURIST_SPOTS: Landmark[] = [
    {
        id: "t1",
        name: "国際通り",
        aliases: ["国際通り", "kokusai", "牧志"],
        lat: 26.2145,
        lng: 127.6858,
        category: "tourist",
        area: "那覇市",
    },
    {
        id: "t2",
        name: "首里城公園",
        aliases: ["首里城", "shuri", "shurijo"],
        lat: 26.217,
        lng: 127.7194,
        category: "tourist",
        area: "那覇市首里",
    },
    {
        id: "t3",
        name: "波の上ビーチ・波の上宮",
        aliases: ["波の上", "naminoue"],
        lat: 26.2237,
        lng: 127.672,
        category: "tourist",
        area: "那覇市若狭",
    },
    {
        id: "t4",
        name: "美浜アメリカンビレッジ",
        aliases: ["アメリカンビレッジ", "美浜", "mihama", "chatan"],
        lat: 26.3167,
        lng: 127.755,
        category: "tourist",
        area: "北谷町美浜",
    },
    {
        id: "t5",
        name: "残波岬",
        aliases: ["残波", "zanpa"],
        lat: 26.4425,
        lng: 127.7075,
        category: "tourist",
        area: "読谷村",
    },
    {
        id: "t6",
        name: "沖縄美ら海水族館",
        aliases: ["美ら海", "水族館", "churaumi"],
        lat: 26.6944,
        lng: 127.8778,
        category: "tourist",
        area: "本部町",
    },
    {
        id: "t7",
        name: "古宇利島・古宇利大橋",
        aliases: ["古宇利", "kouri"],
        lat: 26.7038,
        lng: 128.0207,
        category: "tourist",
        area: "今帰仁村",
    },
    {
        id: "t8",
        name: "斎場御嶽 (せーふぁうたき)",
        aliases: ["斎場御嶽", "セーファ", "sefa"],
        lat: 26.1717,
        lng: 127.8283,
        category: "tourist",
        area: "南城市",
    },
    {
        id: "t9",
        name: "ひめゆりの塔・平和祈念資料館",
        aliases: ["ひめゆり", "himeyuri"],
        lat: 26.1006,
        lng: 127.7267,
        category: "tourist",
        area: "糸満市",
    },
];

export const ALL_LANDMARKS: Landmark[] = [
    ...VOCATIONAL_SCHOOLS,
    ...CRAM_SCHOOLS,
    ...AREAS,
    ...TOURIST_SPOTS,
];

export const PARKING_SPOTS: ParkingSpot[] = [
    {
        id: "p1",
        name: "タイムズ那覇樋川",
        lat: 26.2182,
        lng: 127.6918,
        price: "料金要確認",
        maxPrice: "現地・公式情報を確認",
        tags: ["ITカレッジ周辺", "コインパーキング"],
        emoji: "🅿️",
        photo: "",
    },
    {
        id: "p2",
        name: "リパーク那覇市樋川1丁目",
        lat: 26.2188,
        lng: 127.6905,
        price: "料金要確認",
        maxPrice: "現地・公式情報を確認",
        tags: ["ITカレッジ周辺", "コインパーキング"],
        emoji: "🅿️",
        photo: "",
    },
    {
        id: "p3",
        name: "アップルパーク壺川駅前",
        lat: 26.2052,
        lng: 127.6785,
        price: "料金要確認",
        maxPrice: "現地・公式情報を確認",
        tags: ["壺川駅周辺", "コインパーキング"],
        emoji: "🅿️",
        photo: "",
    },
    {
        id: "p4",
        name: "タイムズ旭橋駅前",
        lat: 26.2118,
        lng: 127.678,
        price: "料金要確認",
        maxPrice: "現地・公式情報を確認",
        tags: ["旭橋駅周辺", "コインパーキング"],
        emoji: "🅿️",
        photo: "",
    },
    {
        id: "p5",
        name: "タイムズおもろまち",
        lat: 26.2232,
        lng: 127.6965,
        price: "料金要確認",
        maxPrice: "現地・公式情報を確認",
        tags: ["おもろまち周辺", "コインパーキング"],
        emoji: "🅿️",
        photo: "",
    },
];

export function distanceMeters(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
): number {
    const R = 6371000;

    const toRad = (degree: number) =>
        (degree * Math.PI) / 180;

    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);

    const value =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) *
        Math.cos(toRad(b.lat)) *
        Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(value));
}

export function walkMinutes(meters: number) {
    return Math.max(
        1,
        Math.round(meters / 80),
    );
}

export function driveMinutes(meters: number) {
    return Math.max(
        1,
        Math.round(meters / 500),
    );
}