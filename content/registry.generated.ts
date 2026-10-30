// Tự sinh bởi scripts/gen-content.mjs — ĐỪNG sửa tay. Chạy `pnpm content` để cập nhật.
import type { SceneConfig } from "@/core/types";
import type { SceneSetup } from "@/core/engine/world";

export type ChapterEntry = {
  dir: string;
  config: () => Promise<{ default: SceneConfig }>;
  scene: () => Promise<{ default: SceneSetup }>;
};

/** Các chương, xếp theo thời gian. */
export const registry: Record<string, ChapterEntry> = {
  "nui-do": {
    dir: "nui-do",
    config: () => import("./nui-do/scene.config"),
    scene: () => import("./nui-do/scene"),
  },
  "son-vi": {
    dir: "son-vi",
    config: () => import("./son-vi/scene.config"),
    scene: () => import("./son-vi/scene"),
  },
  "con-moong": {
    dir: "con-moong",
    config: () => import("./con-moong/scene.config"),
    scene: () => import("./con-moong/scene"),
  },
  "hoa-binh": {
    dir: "hoa-binh",
    config: () => import("./hoa-binh/scene.config"),
    scene: () => import("./hoa-binh/scene"),
  },
  "bac-son": {
    dir: "bac-son",
    config: () => import("./bac-son/scene.config"),
    scene: () => import("./bac-son/scene"),
  },
  "quynh-van": {
    dir: "quynh-van",
    config: () => import("./quynh-van/scene.config"),
    scene: () => import("./quynh-van/scene"),
  },
  "phung-nguyen": {
    dir: "phung-nguyen",
    config: () => import("./phung-nguyen/scene.config"),
    scene: () => import("./phung-nguyen/scene"),
  },
  "dong-dau": {
    dir: "dong-dau",
    config: () => import("./dong-dau/scene.config"),
    scene: () => import("./dong-dau/scene"),
  },
  "con-rong-chau-tien": {
    dir: "con-rong-chau-tien",
    config: () => import("./con-rong-chau-tien/scene.config"),
    scene: () => import("./con-rong-chau-tien/scene"),
  },
  "dong-son": {
    dir: "dong-son",
    config: () => import("./dong-son/scene.config"),
    scene: () => import("./dong-son/scene"),
  },
  "co-loa": {
    dir: "co-loa",
    config: () => import("./co-loa/scene.config"),
    scene: () => import("./co-loa/scene"),
  },
  "trieu-da-179tcn": {
    dir: "trieu-da-179tcn",
    config: () => import("./trieu-da-179tcn/scene.config"),
    scene: () => import("./trieu-da-179tcn/scene"),
  },
  "hai-ba-trung-40": {
    dir: "hai-ba-trung-40",
    config: () => import("./hai-ba-trung-40/scene.config"),
    scene: () => import("./hai-ba-trung-40/scene"),
  },
  "ba-trieu-248": {
    dir: "ba-trieu-248",
    config: () => import("./ba-trieu-248/scene.config"),
    scene: () => import("./ba-trieu-248/scene"),
  },
  "van-xuan-544": {
    dir: "van-xuan-544",
    config: () => import("./van-xuan-544/scene.config"),
    scene: () => import("./van-xuan-544/scene"),
  },
  "mai-thuc-loan-722": {
    dir: "mai-thuc-loan-722",
    config: () => import("./mai-thuc-loan-722/scene.config"),
    scene: () => import("./mai-thuc-loan-722/scene"),
  },
  "phung-hung-791": {
    dir: "phung-hung-791",
    config: () => import("./phung-hung-791/scene.config"),
    scene: () => import("./phung-hung-791/scene"),
  },
  "khuc-thua-du-905": {
    dir: "khuc-thua-du-905",
    config: () => import("./khuc-thua-du-905/scene.config"),
    scene: () => import("./khuc-thua-du-905/scene"),
  },
  "duong-dinh-nghe-931": {
    dir: "duong-dinh-nghe-931",
    config: () => import("./duong-dinh-nghe-931/scene.config"),
    scene: () => import("./duong-dinh-nghe-931/scene"),
  },
  "bach-dang-938": {
    dir: "bach-dang-938",
    config: () => import("./bach-dang-938/scene.config"),
    scene: () => import("./bach-dang-938/scene"),
  },
  "dai-co-viet-968": {
    dir: "dai-co-viet-968",
    config: () => import("./dai-co-viet-968/scene.config"),
    scene: () => import("./dai-co-viet-968/scene"),
  },
  "chong-tong-981": {
    dir: "chong-tong-981",
    config: () => import("./chong-tong-981/scene.config"),
    scene: () => import("./chong-tong-981/scene"),
  },
  "le-hoan-982": {
    dir: "le-hoan-982",
    config: () => import("./le-hoan-982/scene.config"),
    scene: () => import("./le-hoan-982/scene"),
  },
  "doi-do-1010": {
    dir: "doi-do-1010",
    config: () => import("./doi-do-1010/scene.config"),
    scene: () => import("./doi-do-1010/scene"),
  },
  "van-mieu-1070": {
    dir: "van-mieu-1070",
    config: () => import("./van-mieu-1070/scene.config"),
    scene: () => import("./van-mieu-1070/scene"),
  },
  "nhu-nguyet-1077": {
    dir: "nhu-nguyet-1077",
    config: () => import("./nhu-nguyet-1077/scene.config"),
    scene: () => import("./nhu-nguyet-1077/scene"),
  },
  "dong-bo-dau-1258": {
    dir: "dong-bo-dau-1258",
    config: () => import("./dong-bo-dau-1258/scene.config"),
    scene: () => import("./dong-bo-dau-1258/scene"),
  },
  "dien-hong-1284": {
    dir: "dien-hong-1284",
    config: () => import("./dien-hong-1284/scene.config"),
    scene: () => import("./dien-hong-1284/scene"),
  },
  "ham-tu-1285": {
    dir: "ham-tu-1285",
    config: () => import("./ham-tu-1285/scene.config"),
    scene: () => import("./ham-tu-1285/scene"),
  },
  "bach-dang-1288": {
    dir: "bach-dang-1288",
    config: () => import("./bach-dang-1288/scene.config"),
    scene: () => import("./bach-dang-1288/scene"),
  },
  "che-bong-nga-1377": {
    dir: "che-bong-nga-1377",
    config: () => import("./che-bong-nga-1377/scene.config"),
    scene: () => import("./che-bong-nga-1377/scene"),
  },
  "nha-ho-1400": {
    dir: "nha-ho-1400",
    config: () => import("./nha-ho-1400/scene.config"),
    scene: () => import("./nha-ho-1400/scene"),
  },
  "hau-tran-1408": {
    dir: "hau-tran-1408",
    config: () => import("./hau-tran-1408/scene.config"),
    scene: () => import("./hau-tran-1408/scene"),
  },
  "lam-son-1418": {
    dir: "lam-son-1418",
    config: () => import("./lam-son-1418/scene.config"),
    scene: () => import("./lam-son-1418/scene"),
  },
  "tot-dong-1426": {
    dir: "tot-dong-1426",
    config: () => import("./tot-dong-1426/scene.config"),
    scene: () => import("./tot-dong-1426/scene"),
  },
  "chi-lang-1427": {
    dir: "chi-lang-1427",
    config: () => import("./chi-lang-1427/scene.config"),
    scene: () => import("./chi-lang-1427/scene"),
  },
  "binh-ngo-1428": {
    dir: "binh-ngo-1428",
    config: () => import("./binh-ngo-1428/scene.config"),
    scene: () => import("./binh-ngo-1428/scene"),
  },
  "chu-dau-1450": {
    dir: "chu-dau-1450",
    config: () => import("./chu-dau-1450/scene.config"),
    scene: () => import("./chu-dau-1450/scene"),
  },
  "do-ban-1471": {
    dir: "do-ban-1471",
    config: () => import("./do-ban-1471/scene.config"),
    scene: () => import("./do-ban-1471/scene"),
  },
  "hong-duc-1483": {
    dir: "hong-duc-1483",
    config: () => import("./hong-duc-1483/scene.config"),
    scene: () => import("./hong-duc-1483/scene"),
  },
  "nha-mac-1527": {
    dir: "nha-mac-1527",
    config: () => import("./nha-mac-1527/scene.config"),
    scene: () => import("./nha-mac-1527/scene"),
  },
  "thuan-hoa-1558": {
    dir: "thuan-hoa-1558",
    config: () => import("./thuan-hoa-1558/scene.config"),
    scene: () => import("./thuan-hoa-1558/scene"),
  },
  "hoi-an-1617": {
    dir: "hoi-an-1617",
    config: () => import("./hoi-an-1617/scene.config"),
    scene: () => import("./hoi-an-1617/scene"),
  },
  "trinh-nguyen-1627": {
    dir: "trinh-nguyen-1627",
    config: () => import("./trinh-nguyen-1627/scene.config"),
    scene: () => import("./trinh-nguyen-1627/scene"),
  },
  "luy-thay-1631": {
    dir: "luy-thay-1631",
    config: () => import("./luy-thay-1631/scene.config"),
    scene: () => import("./luy-thay-1631/scene"),
  },
  "pho-hien-1637": {
    dir: "pho-hien-1637",
    config: () => import("./pho-hien-1637/scene.config"),
    scene: () => import("./pho-hien-1637/scene"),
  },
  "gia-dinh-1698": {
    dir: "gia-dinh-1698",
    config: () => import("./gia-dinh-1698/scene.config"),
    scene: () => import("./gia-dinh-1698/scene"),
  },
  "ha-tien-1708": {
    dir: "ha-tien-1708",
    config: () => import("./ha-tien-1708/scene.config"),
    scene: () => import("./ha-tien-1708/scene"),
  },
  "nguyen-huu-cau-1741": {
    dir: "nguyen-huu-cau-1741",
    config: () => import("./nguyen-huu-cau-1741/scene.config"),
    scene: () => import("./nguyen-huu-cau-1741/scene"),
  },
  "tay-son-1771": {
    dir: "tay-son-1771",
    config: () => import("./tay-son-1771/scene.config"),
    scene: () => import("./tay-son-1771/scene"),
  },
  "rach-gam-1785": {
    dir: "rach-gam-1785",
    config: () => import("./rach-gam-1785/scene.config"),
    scene: () => import("./rach-gam-1785/scene"),
  },
  "dong-da-1789": {
    dir: "dong-da-1789",
    config: () => import("./dong-da-1789/scene.config"),
    scene: () => import("./dong-da-1789/scene"),
  },
  "gia-long-1802": {
    dir: "gia-long-1802",
    config: () => import("./gia-long-1802/scene.config"),
    scene: () => import("./gia-long-1802/scene"),
  },
  "nguyen-du-1810": {
    dir: "nguyen-du-1810",
    config: () => import("./nguyen-du-1810/scene.config"),
    scene: () => import("./nguyen-du-1810/scene"),
  },
  "vinh-te-1819": {
    dir: "vinh-te-1819",
    config: () => import("./vinh-te-1819/scene.config"),
    scene: () => import("./vinh-te-1819/scene"),
  },
  "le-van-khoi-1833": {
    dir: "le-van-khoi-1833",
    config: () => import("./le-van-khoi-1833/scene.config"),
    scene: () => import("./le-van-khoi-1833/scene"),
  },
  "da-nang-1858": {
    dir: "da-nang-1858",
    config: () => import("./da-nang-1858/scene.config"),
    scene: () => import("./da-nang-1858/scene"),
  },
  "can-giuoc-1861": {
    dir: "can-giuoc-1861",
    config: () => import("./can-giuoc-1861/scene.config"),
    scene: () => import("./can-giuoc-1861/scene"),
  },
  "truong-dinh-1864": {
    dir: "truong-dinh-1864",
    config: () => import("./truong-dinh-1864/scene.config"),
    scene: () => import("./truong-dinh-1864/scene"),
  },
  "cau-giay-1873": {
    dir: "cau-giay-1873",
    config: () => import("./cau-giay-1873/scene.config"),
    scene: () => import("./cau-giay-1873/scene"),
  },
  "bai-say-1883": {
    dir: "bai-say-1883",
    config: () => import("./bai-say-1883/scene.config"),
    scene: () => import("./bai-say-1883/scene"),
  },
  "giap-than-1884": {
    dir: "giap-than-1884",
    config: () => import("./giap-than-1884/scene.config"),
    scene: () => import("./giap-than-1884/scene"),
  },
  "yen-the-1884": {
    dir: "yen-the-1884",
    config: () => import("./yen-the-1884/scene.config"),
    scene: () => import("./yen-the-1884/scene"),
  },
  "can-vuong-1885": {
    dir: "can-vuong-1885",
    config: () => import("./can-vuong-1885/scene.config"),
    scene: () => import("./can-vuong-1885/scene"),
  },
  "ba-dinh-1886": {
    dir: "ba-dinh-1886",
    config: () => import("./ba-dinh-1886/scene.config"),
    scene: () => import("./ba-dinh-1886/scene"),
  },
  "huong-khe-1885": {
    dir: "huong-khe-1885",
    config: () => import("./huong-khe-1885/scene.config"),
    scene: () => import("./huong-khe-1885/scene"),
  },
  "cau-long-bien-1898": {
    dir: "cau-long-bien-1898",
    config: () => import("./cau-long-bien-1898/scene.config"),
    scene: () => import("./cau-long-bien-1898/scene"),
  },
  "dong-du-1905": {
    dir: "dong-du-1905",
    config: () => import("./dong-du-1905/scene.config"),
    scene: () => import("./dong-du-1905/scene"),
  },
  "dong-kinh-nghia-thuc-1907": {
    dir: "dong-kinh-nghia-thuc-1907",
    config: () => import("./dong-kinh-nghia-thuc-1907/scene.config"),
    scene: () => import("./dong-kinh-nghia-thuc-1907/scene"),
  },
  "ben-nha-rong-1911": {
    dir: "ben-nha-rong-1911",
    config: () => import("./ben-nha-rong-1911/scene.config"),
    scene: () => import("./ben-nha-rong-1911/scene"),
  },
  "yen-bai-1930": {
    dir: "yen-bai-1930",
    config: () => import("./yen-bai-1930/scene.config"),
    scene: () => import("./yen-bai-1930/scene"),
  },
};
