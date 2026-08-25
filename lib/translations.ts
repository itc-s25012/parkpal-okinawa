export type Language =
    | "ja"
    | "en"
    | "zh-CN"
    | "zh-TW"
    | "ko";

export const LANGUAGE_LABELS:
    Record<Language, string> = {
    ja: "🇯🇵 日本語",
    en: "🇺🇸 English",
    "zh-CN": "🇨🇳 简体中文",
    "zh-TW": "🇹🇼 繁體中文",
    ko: "🇰🇷 한국어",
};

export const TEXT = {
    /*
     * ========================================
     * 日本語
     * ========================================
     */

    ja: {
        student: "学生",
        tourist: "観光",
        searchStudent: "学校・塾・エリアを検索",
        searchTourist: "観光地・エリアを検索",
        chooseDestination: "目的地を選んでください",
        nearbyParking: "目的地に近い駐車場",
        loadingParking: "近くの駐車場を検索中…",
        noParking: "近くに駐車場が見つかりませんでした",
        availability: "空き情報",
        noLiveData: "まだLIVE情報なし",
        closest: "一番近い",
        walk: "徒歩",
        drive: "車",
        parkingInfo: "駐車場情報",
        route: "Google Mapsでナビ",
        count: "件",
        minute: "分",
        distance: "距離",
        safety: "安全度",
        camera: "防犯カメラ",
        lighting: "街灯",
        yes: "あり",
        no: "情報なし",

        /*
         * 駐車場の特徴
         */
        paidParking: "有料",
        hiddenParking: "穴場",
        indoorParking: "屋内",
        facilityParking: "施設併設",
        accessibleParking: "バリアフリー",

        error: "駐車場情報を取得できませんでした",
    },

    /*
     * ========================================
     * 英語
     * ========================================
     */

    en: {
        student: "Student",
        tourist: "Travel",
        searchStudent: "Search school, cram school or area",
        searchTourist: "Search tourist spot or area",
        chooseDestination: "Choose a destination",
        nearbyParking: "Nearby parking",
        loadingParking: "Searching nearby parking…",
        noParking: "No parking found nearby",
        availability: "Availability",
        noLiveData: "No live data yet",
        closest: "Closest",
        walk: "Walk",
        drive: "Drive",
        parkingInfo: "Parking information",
        route: "Navigate with Google Maps",
        count: "",
        minute: "min",
        distance: "Distance",
        safety: "Safety score",
        camera: "Security camera",
        lighting: "Lighting",
        yes: "Available",
        no: "No data",

        /*
         * Parking features
         */
        paidParking: "Paid",
        hiddenParking: "Hidden gem",
        indoorParking: "Indoor",
        facilityParking: "Facility parking",
        accessibleParking: "Accessible",

        error: "Could not load parking information",
    },

    /*
     * ========================================
     * 中国語（簡体字）
     * ========================================
     */

    "zh-CN": {
        student: "学生",
        tourist: "观光",
        searchStudent: "搜索学校、补习班或地区",
        searchTourist: "搜索景点或地区",
        chooseDestination: "请选择目的地",
        nearbyParking: "附近停车场",
        loadingParking: "正在搜索附近停车场…",
        noParking: "附近没有找到停车场",
        availability: "空位信息",
        noLiveData: "暂无实时信息",
        closest: "最近",
        walk: "步行",
        drive: "驾车",
        parkingInfo: "停车场信息",
        route: "使用 Google Maps 导航",
        count: "个",
        minute: "分钟",
        distance: "距离",
        safety: "安全评分",
        camera: "监控摄像头",
        lighting: "照明",
        yes: "有",
        no: "暂无信息",

        /*
         * 停车场特点
         */
        paidParking: "收费",
        hiddenParking: "隐藏好去处",
        indoorParking: "室内",
        facilityParking: "设施附属",
        accessibleParking: "无障碍",

        error: "无法获取停车场信息",
    },

    /*
     * ========================================
     * 中国語（繁体字）
     * ========================================
     */

    "zh-TW": {
        student: "學生",
        tourist: "觀光",
        searchStudent: "搜尋學校、補習班或地區",
        searchTourist: "搜尋景點或地區",
        chooseDestination: "請選擇目的地",
        nearbyParking: "附近停車場",
        loadingParking: "正在搜尋附近停車場…",
        noParking: "附近找不到停車場",
        availability: "空位資訊",
        noLiveData: "暫無即時資訊",
        closest: "最近",
        walk: "步行",
        drive: "開車",
        parkingInfo: "停車場資訊",
        route: "使用 Google Maps 導航",
        count: "個",
        minute: "分鐘",
        distance: "距離",
        safety: "安全評分",
        camera: "監視器",
        lighting: "照明",
        yes: "有",
        no: "暫無資訊",

        /*
         * 停車場特色
         */
        paidParking: "收費",
        hiddenParking: "私房好去處",
        indoorParking: "室內",
        facilityParking: "設施附設",
        accessibleParking: "無障礙",

        error: "無法取得停車場資訊",
    },

    /*
     * ========================================
     * 韓国語
     * ========================================
     */

    ko: {
        student: "학생",
        tourist: "관광",
        searchStudent: "학교·학원·지역 검색",
        searchTourist: "관광지·지역 검색",
        chooseDestination: "목적지를 선택하세요",
        nearbyParking: "주변 주차장",
        loadingParking: "주변 주차장을 찾는 중…",
        noParking: "주변 주차장을 찾지 못했습니다",
        availability: "주차 가능 여부",
        noLiveData: "실시간 정보 없음",
        closest: "가장 가까움",
        walk: "도보",
        drive: "차량",
        parkingInfo: "주차장 정보",
        route: "Google Maps로 길찾기",
        count: "개",
        minute: "분",
        distance: "거리",
        safety: "안전도",
        camera: "방범 카메라",
        lighting: "조명",
        yes: "있음",
        no: "정보 없음",

        /*
         * 주차장 특징
         */
        paidParking: "유료",
        hiddenParking: "숨은 명소",
        indoorParking: "실내",
        facilityParking: "시설 부설",
        accessibleParking: "배리어프리",

        error: "주차장 정보를 가져오지 못했습니다",
    },
} satisfies Record<
    Language,
    Record<string, string>
>;