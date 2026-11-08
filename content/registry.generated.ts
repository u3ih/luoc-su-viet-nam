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
  "chua-mot-cot-1049": {
    dir: "chua-mot-cot-1049",
    config: () => import("./chua-mot-cot-1049/scene.config"),
    scene: () => import("./chua-mot-cot-1049/scene"),
  },
  "y-lan-1069": {
    dir: "y-lan-1069",
    config: () => import("./y-lan-1069/scene.config"),
    scene: () => import("./y-lan-1069/scene"),
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
  "to-hien-thanh-1175": {
    dir: "to-hien-thanh-1175",
    config: () => import("./to-hien-thanh-1175/scene.config"),
    scene: () => import("./to-hien-thanh-1175/scene"),
  },
  "tran-thay-ly-1226": {
    dir: "tran-thay-ly-1226",
    config: () => import("./tran-thay-ly-1226/scene.config"),
    scene: () => import("./tran-thay-ly-1226/scene"),
  },
  "dong-bo-dau-1258": {
    dir: "dong-bo-dau-1258",
    config: () => import("./dong-bo-dau-1258/scene.config"),
    scene: () => import("./dong-bo-dau-1258/scene"),
  },
  "le-van-huu-1272": {
    dir: "le-van-huu-1272",
    config: () => import("./le-van-huu-1272/scene.config"),
    scene: () => import("./le-van-huu-1272/scene"),
  },
  "dien-hong-1284": {
    dir: "dien-hong-1284",
    config: () => import("./dien-hong-1284/scene.config"),
    scene: () => import("./dien-hong-1284/scene"),
  },
  "hich-tuong-si-1284": {
    dir: "hich-tuong-si-1284",
    config: () => import("./hich-tuong-si-1284/scene.config"),
    scene: () => import("./hich-tuong-si-1284/scene"),
  },
  "ham-tu-1285": {
    dir: "ham-tu-1285",
    config: () => import("./ham-tu-1285/scene.config"),
    scene: () => import("./ham-tu-1285/scene"),
  },
  "tran-binh-trong-1285": {
    dir: "tran-binh-trong-1285",
    config: () => import("./tran-binh-trong-1285/scene.config"),
    scene: () => import("./tran-binh-trong-1285/scene"),
  },
  "van-don-1288": {
    dir: "van-don-1288",
    config: () => import("./van-don-1288/scene.config"),
    scene: () => import("./van-don-1288/scene"),
  },
  "bach-dang-1288": {
    dir: "bach-dang-1288",
    config: () => import("./bach-dang-1288/scene.config"),
    scene: () => import("./bach-dang-1288/scene"),
  },
  "truc-lam-1299": {
    dir: "truc-lam-1299",
    config: () => import("./truc-lam-1299/scene.config"),
    scene: () => import("./truc-lam-1299/scene"),
  },
  "huyen-tran-1306": {
    dir: "huyen-tran-1306",
    config: () => import("./huyen-tran-1306/scene.config"),
    scene: () => import("./huyen-tran-1306/scene"),
  },
  "mac-dinh-chi-1308": {
    dir: "mac-dinh-chi-1308",
    config: () => import("./mac-dinh-chi-1308/scene.config"),
    scene: () => import("./mac-dinh-chi-1308/scene"),
  },
  "chu-van-an-1350": {
    dir: "chu-van-an-1350",
    config: () => import("./chu-van-an-1350/scene.config"),
    scene: () => import("./chu-van-an-1350/scene"),
  },
  "che-bong-nga-1377": {
    dir: "che-bong-nga-1377",
    config: () => import("./che-bong-nga-1377/scene.config"),
    scene: () => import("./che-bong-nga-1377/scene"),
  },
  "tue-tinh-1385": {
    dir: "tue-tinh-1385",
    config: () => import("./tue-tinh-1385/scene.config"),
    scene: () => import("./tue-tinh-1385/scene"),
  },
  "nha-ho-1400": {
    dir: "nha-ho-1400",
    config: () => import("./nha-ho-1400/scene.config"),
    scene: () => import("./nha-ho-1400/scene"),
  },
  "ho-nguyen-trung-1405": {
    dir: "ho-nguyen-trung-1405",
    config: () => import("./ho-nguyen-trung-1405/scene.config"),
    scene: () => import("./ho-nguyen-trung-1405/scene"),
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
  "lam-kinh-1433": {
    dir: "lam-kinh-1433",
    config: () => import("./lam-kinh-1433/scene.config"),
    scene: () => import("./lam-kinh-1433/scene"),
  },
  "le-chi-vien-1442": {
    dir: "le-chi-vien-1442",
    config: () => import("./le-chi-vien-1442/scene.config"),
    scene: () => import("./le-chi-vien-1442/scene"),
  },
  "chu-dau-1450": {
    dir: "chu-dau-1450",
    config: () => import("./chu-dau-1450/scene.config"),
    scene: () => import("./chu-dau-1450/scene"),
  },
  "luong-the-vinh-1463": {
    dir: "luong-the-vinh-1463",
    config: () => import("./luong-the-vinh-1463/scene.config"),
    scene: () => import("./luong-the-vinh-1463/scene"),
  },
  "do-ban-1471": {
    dir: "do-ban-1471",
    config: () => import("./do-ban-1471/scene.config"),
    scene: () => import("./do-ban-1471/scene"),
  },
  "toan-thu-1479": {
    dir: "toan-thu-1479",
    config: () => import("./toan-thu-1479/scene.config"),
    scene: () => import("./toan-thu-1479/scene"),
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
  "nguyen-binh-khiem-1535": {
    dir: "nguyen-binh-khiem-1535",
    config: () => import("./nguyen-binh-khiem-1535/scene.config"),
    scene: () => import("./nguyen-binh-khiem-1535/scene"),
  },
  "thuan-hoa-1558": {
    dir: "thuan-hoa-1558",
    config: () => import("./thuan-hoa-1558/scene.config"),
    scene: () => import("./thuan-hoa-1558/scene"),
  },
  "dong-ho-1600": {
    dir: "dong-ho-1600",
    config: () => import("./dong-ho-1600/scene.config"),
    scene: () => import("./dong-ho-1600/scene"),
  },
  "thien-mu-1601": {
    dir: "thien-mu-1601",
    config: () => import("./thien-mu-1601/scene.config"),
    scene: () => import("./thien-mu-1601/scene"),
  },
  "phu-yen-1611": {
    dir: "phu-yen-1611",
    config: () => import("./phu-yen-1611/scene.config"),
    scene: () => import("./phu-yen-1611/scene"),
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
  "but-thap-1647": {
    dir: "but-thap-1647",
    config: () => import("./but-thap-1647/scene.config"),
    scene: () => import("./but-thap-1647/scene"),
  },
  "quoc-ngu-1651": {
    dir: "quoc-ngu-1651",
    config: () => import("./quoc-ngu-1651/scene.config"),
    scene: () => import("./quoc-ngu-1651/scene"),
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
  "chinh-phu-ngam-1745": {
    dir: "chinh-phu-ngam-1745",
    config: () => import("./chinh-phu-ngam-1745/scene.config"),
    scene: () => import("./chinh-phu-ngam-1745/scene"),
  },
  "hoang-cong-chat-1758": {
    dir: "hoang-cong-chat-1758",
    config: () => import("./hoang-cong-chat-1758/scene.config"),
    scene: () => import("./hoang-cong-chat-1758/scene"),
  },
  "lan-ong-1770": {
    dir: "lan-ong-1770",
    config: () => import("./lan-ong-1770/scene.config"),
    scene: () => import("./lan-ong-1770/scene"),
  },
  "tay-son-1771": {
    dir: "tay-son-1771",
    config: () => import("./tay-son-1771/scene.config"),
    scene: () => import("./tay-son-1771/scene"),
  },
  "le-quy-don-1776": {
    dir: "le-quy-don-1776",
    config: () => import("./le-quy-don-1776/scene.config"),
    scene: () => import("./le-quy-don-1776/scene"),
  },
  "rach-gam-1785": {
    dir: "rach-gam-1785",
    config: () => import("./rach-gam-1785/scene.config"),
    scene: () => import("./rach-gam-1785/scene"),
  },
  "phu-le-diet-trinh-1786": {
    dir: "phu-le-diet-trinh-1786",
    config: () => import("./phu-le-diet-trinh-1786/scene.config"),
    scene: () => import("./phu-le-diet-trinh-1786/scene"),
  },
  "phuong-hoang-trung-do-1788": {
    dir: "phuong-hoang-trung-do-1788",
    config: () => import("./phuong-hoang-trung-do-1788/scene.config"),
    scene: () => import("./phuong-hoang-trung-do-1788/scene"),
  },
  "dong-da-1789": {
    dir: "dong-da-1789",
    config: () => import("./dong-da-1789/scene.config"),
    scene: () => import("./dong-da-1789/scene"),
  },
  "thi-nai-1801": {
    dir: "thi-nai-1801",
    config: () => import("./thi-nai-1801/scene.config"),
    scene: () => import("./thi-nai-1801/scene"),
  },
  "gia-long-1802": {
    dir: "gia-long-1802",
    config: () => import("./gia-long-1802/scene.config"),
    scene: () => import("./gia-long-1802/scene"),
  },
  "tran-ninh-1802": {
    dir: "tran-ninh-1802",
    config: () => import("./tran-ninh-1802/scene.config"),
    scene: () => import("./tran-ninh-1802/scene"),
  },
  "kinh-thanh-hue-1805": {
    dir: "kinh-thanh-hue-1805",
    config: () => import("./kinh-thanh-hue-1805/scene.config"),
    scene: () => import("./kinh-thanh-hue-1805/scene"),
  },
  "nguyen-du-1810": {
    dir: "nguyen-du-1810",
    config: () => import("./nguyen-du-1810/scene.config"),
    scene: () => import("./nguyen-du-1810/scene"),
  },
  "hoang-sa-1815": {
    dir: "hoang-sa-1815",
    config: () => import("./hoang-sa-1815/scene.config"),
    scene: () => import("./hoang-sa-1815/scene"),
  },
  "vinh-te-1819": {
    dir: "vinh-te-1819",
    config: () => import("./vinh-te-1819/scene.config"),
    scene: () => import("./vinh-te-1819/scene"),
  },
  "phan-ba-vanh-1821": {
    dir: "phan-ba-vanh-1821",
    config: () => import("./phan-ba-vanh-1821/scene.config"),
    scene: () => import("./phan-ba-vanh-1821/scene"),
  },
  "nguyen-cong-tru-1828": {
    dir: "nguyen-cong-tru-1828",
    config: () => import("./nguyen-cong-tru-1828/scene.config"),
    scene: () => import("./nguyen-cong-tru-1828/scene"),
  },
  "le-van-khoi-1833": {
    dir: "le-van-khoi-1833",
    config: () => import("./le-van-khoi-1833/scene.config"),
    scene: () => import("./le-van-khoi-1833/scene"),
  },
  "dai-nam-1838": {
    dir: "dai-nam-1838",
    config: () => import("./dai-nam-1838/scene.config"),
    scene: () => import("./dai-nam-1838/scene"),
  },
  "nguyen-dinh-chieu-1850": {
    dir: "nguyen-dinh-chieu-1850",
    config: () => import("./nguyen-dinh-chieu-1850/scene.config"),
    scene: () => import("./nguyen-dinh-chieu-1850/scene"),
  },
  "cao-ba-quat-1854": {
    dir: "cao-ba-quat-1854",
    config: () => import("./cao-ba-quat-1854/scene.config"),
    scene: () => import("./cao-ba-quat-1854/scene"),
  },
  "da-nang-1858": {
    dir: "da-nang-1858",
    config: () => import("./da-nang-1858/scene.config"),
    scene: () => import("./da-nang-1858/scene"),
  },
  "gia-dinh-1859": {
    dir: "gia-dinh-1859",
    config: () => import("./gia-dinh-1859/scene.config"),
    scene: () => import("./gia-dinh-1859/scene"),
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
  "nguyen-truong-to-1863": {
    dir: "nguyen-truong-to-1863",
    config: () => import("./nguyen-truong-to-1863/scene.config"),
    scene: () => import("./nguyen-truong-to-1863/scene"),
  },
  "phan-thanh-gian-1867": {
    dir: "phan-thanh-gian-1867",
    config: () => import("./phan-thanh-gian-1867/scene.config"),
    scene: () => import("./phan-thanh-gian-1867/scene"),
  },
  "cau-giay-1873": {
    dir: "cau-giay-1873",
    config: () => import("./cau-giay-1873/scene.config"),
    scene: () => import("./cau-giay-1873/scene"),
  },
  "hoang-dieu-1882": {
    dir: "hoang-dieu-1882",
    config: () => import("./hoang-dieu-1882/scene.config"),
    scene: () => import("./hoang-dieu-1882/scene"),
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
  "yersin-1893": {
    dir: "yersin-1893",
    config: () => import("./yersin-1893/scene.config"),
    scene: () => import("./yersin-1893/scene"),
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
  "duy-tan-trung-ky-1906": {
    dir: "duy-tan-trung-ky-1906",
    config: () => import("./duy-tan-trung-ky-1906/scene.config"),
    scene: () => import("./duy-tan-trung-ky-1906/scene"),
  },
  "dong-kinh-nghia-thuc-1907": {
    dir: "dong-kinh-nghia-thuc-1907",
    config: () => import("./dong-kinh-nghia-thuc-1907/scene.config"),
    scene: () => import("./dong-kinh-nghia-thuc-1907/scene"),
  },
  "chong-thue-1908": {
    dir: "chong-thue-1908",
    config: () => import("./chong-thue-1908/scene.config"),
    scene: () => import("./chong-thue-1908/scene"),
  },
  "ben-nha-rong-1911": {
    dir: "ben-nha-rong-1911",
    config: () => import("./ben-nha-rong-1911/scene.config"),
    scene: () => import("./ben-nha-rong-1911/scene"),
  },
  "ntrang-long-1912": {
    dir: "ntrang-long-1912",
    config: () => import("./ntrang-long-1912/scene.config"),
    scene: () => import("./ntrang-long-1912/scene"),
  },
  "duy-tan-1916": {
    dir: "duy-tan-1916",
    config: () => import("./duy-tan-1916/scene.config"),
    scene: () => import("./duy-tan-1916/scene"),
  },
  "thai-nguyen-1917": {
    dir: "thai-nguyen-1917",
    config: () => import("./thai-nguyen-1917/scene.config"),
    scene: () => import("./thai-nguyen-1917/scene"),
  },
  "yen-bai-1930": {
    dir: "yen-bai-1930",
    config: () => import("./yen-bai-1930/scene.config"),
    scene: () => import("./yen-bai-1930/scene"),
  },
  "duong-sat-1936": {
    dir: "duong-sat-1936",
    config: () => import("./duong-sat-1936/scene.config"),
    scene: () => import("./duong-sat-1936/scene"),
  },
};
