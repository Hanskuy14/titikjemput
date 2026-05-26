/* =============================================================
   TITIK JEMPUT — Ojol Survival Sim
   Vanilla JS GameManager + procedural orders + crisis system
   ============================================================= */
'use strict';

const STORAGE_KEY = 'titikJemput.saveV1';

const INITIAL = {
  saldo: 50000,
  baterai: 100,
  bensin: 100,
  rating: 5.0,
  day: 1,
  orderCount: 0,
  ordersToday: 0,
  weather: 'Cerah',
  time: 'Pagi'
};

const WEATHERS = [
  { id: 'Cerah',   label: '☀️ Cerah',       fareMul: 1.0 },
  { id: 'Mendung', label: '☁️ Mendung',     fareMul: 1.1 },
  { id: 'Gerimis', label: '🌦️ Gerimis',     fareMul: 1.2 },
  { id: 'Hujan',   label: '🌧️ Hujan',       fareMul: 1.4 },
  { id: 'Badai',   label: '⛈️ Hujan Badai', fareMul: 1.7 }
];

const TIMES = [
  { id: 'Pagi',  label: '🌅 Pagi',  fareMul: 1.0 },
  { id: 'Siang', label: '☀️ Siang', fareMul: 1.0 },
  { id: 'Sore',  label: '🌇 Sore',  fareMul: 1.15 },
  { id: 'Malam', label: '🌃 Malam', fareMul: 1.3 }
];


/* ---------- 30 NPCs (mood + dest, line is short personality only) ---------- */
const NPCS = [
  { name: "Emak Dasteran",         emoji: "👩",   mood: "demanding", dest: "Pasar Senen",            line: "Mas! Cepetan ya, masakan di rumah keburu gosong nih!" },
  { name: "Anak Kos Akhir Bulan",  emoji: "🧑‍🎓", mood: "polos",     dest: "warung padang kampus",   line: "bang sumpah duit pas-pasan, tolong bgt ya bang... 😭" },
  { name: "Mbak SCBD",             emoji: "💅",   mood: "demanding", dest: "Senayan City",           line: "OMG literally I've been waiting forever, it's giving slow service deh." },
  { name: "Bocil Epep",            emoji: "👦",   mood: "panik",     dest: "warnet Cyber Gaming",    line: "BANG BURUAN GW LAGI PUSH RANK ML JANGAN AFK BANG" },
  { name: "Jamet Kuproy",          emoji: "🏍️",   mood: "chill",     dest: "kolong fly-over",        line: "Yo bro, gas pol ya. Lagi gabut mau nge-tongkrong." },
  { name: "Kang Paket Rival",      emoji: "📦",   mood: "chill",     dest: "gudang ekspedisi",       line: "Eh broo, kompetitor sih tapi tetep brotherhood ya." },
  { name: "Bapak Poskamling",      emoji: "👴",   mood: "polos",     dest: "rumah Pak RT",           line: "Wah mas ojol, tau ga politik sekarang... mas ikut nimbrung yuk?" },
  { name: "Netizen Julid",         emoji: "📱",   mood: "demanding", dest: "kantor agency",          line: "Lama amat sih?? Awas ya viral di X, follower gue 200k." },
  { name: "Suami Siaga",           emoji: "🤵",   mood: "panik",     dest: "RS Bersalin Bunda",      line: "MAAAS BURUAN ISTRI GUE MAU LAHIRAN BUKA 5 PLEASE!" },
  { name: "Cewek Galau",           emoji: "😢",   mood: "panik",     dest: "kosan temen",            line: "(huhu) bang... pacar aku selingkuh bang... jauhin aku dari sini..." },
  { name: "Orang Mabuk Amer",      emoji: "🥴",   mood: "panik",     dest: "rumah (alamat ngaco)",   line: "bnag... gw pgn plng... rmh gw dmn ya... gtau sih..." },
  { name: "Kang Ghosting",         emoji: "👻",   mood: "sus",       dest: "pin lokasi (ngaco)",     line: "[seen 5 menit lalu — pin lokasi muter-muter, chat ga dibales]" },
  { name: "Nenek Baik Hati",       emoji: "👵",   mood: "polos",     dest: "Posyandu Lansia",        line: "Cu, pelan-pelan saja ya. Tidak usah ngebut nak, nenek mabok." },
  { name: "Penipu OVO/Dana",       emoji: "🕵️",   mood: "sus",       dest: "alamat fiktif Jakbar",   line: "Halo bang, saya dari OVO. Boleh minta kode OTP buat verifikasi?" },
  { name: "Pengusaha Buru-Buru",   emoji: "💼",   mood: "panik",     dest: "Bandara Soetta T3",      line: "Bro, 30 menit harus sampe! Tip 50k kalo ngebut, telat lu tanggung." },
  { name: "Wisatawan Nyasar",      emoji: "🧳",   mood: "polos",     dest: "hotel Sudirman",         line: "Mas, saya dari Medan. Maps saya nge-blank, tolong ya mas." },
  { name: "Remaja Bucin",          emoji: "💕",   mood: "sus",       dest: "kafe Mojok",             line: "bang pelan2 ya, gw kabur dari rumah. jangan bilang ortu plis." },
  { name: "Kang Pindahan",         emoji: "📦",   mood: "chill",     dest: "kosan baru gang sempit", line: "Bang, deket kok. Deket banget. Sumpah deh, deket." },
  { name: "Selebgram Pansos",      emoji: "📸",   mood: "demanding", dest: "studio Senopati",        line: "Jangan ngomong ya, lagi live IG. Konten 'first time naik ojol'." },
  { name: "Orang Kesurupan",       emoji: "👹",   mood: "mistik",    dest: "selatan (kerajaan gaib)",line: "HOEEE... aku bukan dia... aku dari kerajaan bawah tanah..." },
  { name: "Intel Nyamar",          emoji: "🕶️",   mood: "sus",       dest: "lokasi pengintaian",     line: "Bro, daerah sini banyak narkoba gak? Tanya doang kok, gw biasa aja." },
  { name: "Ibu Hamil Tua",         emoji: "🤰",   mood: "polos",     dest: "klinik kandungan",       line: "Mas, pelan-pelan ya. Sembilan bulan nih, hindari polisi tidur." },
  { name: "Bule Nyasar",           emoji: "🧔",   mood: "polos",     dest: "Anyer (3 jam)",          line: "Hello mister! Fast way please, jalan tikus yes yes?" },
  { name: "Tukang Sayur",          emoji: "🥬",   mood: "chill",     dest: "Pasar Subuh",            line: "Mas, maaf agak amis ya. Bawa keranjang ikan asin sekarung." },
  { name: "Penumpang Pulas",       emoji: "😴",   mood: "chill",     dest: "rumah (lupa alamat)",    line: "zzz... bang... zzz... (tertidur, pin lokasi ngaco)" },
  { name: "Mahasiswa PPL",         emoji: "🎓",   mood: "polos",     dest: "kampus ruang sidang",    line: "Kak, bawa poster A0 dua biji ya. Jangan kelipet please." },
  { name: "Pelanggan VIP",         emoji: "🤵‍♂️", mood: "demanding", dest: "Hotel Indonesia",        line: "Helm udah disanitasi belum? Lap sekali lagi, alergi debu saya." },
  { name: "Pengamen Punk",         emoji: "🎸",   mood: "chill",     dest: "lampu merah HI",         line: "Oi bro, bayar receh full ya, gw belom hitung total sih cuk." },
  { name: "Tukang Parkir Gaib",    emoji: "👷",   mood: "mistik",    dest: "depan minimarket",       line: "Kiri kiri kiri mas... *padahal lurus aja* dua rebu ya bang." },
  { name: "Mantan Pacar",          emoji: "💔",   mood: "mistik",    dest: "rumah... ibumu",         line: "...lho? Ko kamu? Ojol? Eh... awkward banget anjir." }
];

/* ---------- NPC mood reactions ---------- */
const MOODS = {
  demanding: {
    event:   ["Astaga, kenapa harus sekarang sih?!", "Cepetan dong, gue gak punya waktu!", "Hellooo? Annoying banget sih."],
    good:    ["Oke deh, masih bisa dimaafin.", "Lumayan, gak sebodoh yang gue kira.", "Yaudah cukup, jangan diulang ya."],
    bad:     ["YA AMPUN PARAH BGT JADI OJOL!", "Gue komplen ke aplikasi nih awas!", "Niat narik gak sih lo?! Capek deh."]
  },
  panik: {
    event:   ["WADUH GIMANA NIH BANGG?!", "ANJIR JANTUNG GW BANG!", "GAWAT GAWAT GAWAT MAS!"],
    good:    ["FUH AMAN MAS! THANK YOU BANG!", "GACOR! MANTAP BENERAN!", "WUIH BERESS! GOKIL LU MAS!"],
    bad:     ["BANG GIMANAA SIH PARAH BGT!!", "YAH ANCUR BANG, JADI GINI!", "ANJIRRR ZONK BENERAN!"]
  },
  chill: {
    event:   ["Anjir, plot twist juga ya bro.", "Hmm, situasi rusuh nih bro.", "Tenang aja sih bang, slow."],
    good:    ["Mantap broo, GG.", "Smooth banget eksekusinya bro.", "Aman, lanjut bro. Solid."],
    bad:     ["Yah, sayang banget bro.", "Hmm, kurang gacor.", "Bocor itu mah ngab."]
  },
  polos: {
    event:   ["Astaghfirullah, gimana ya?", "Aduh saya bingung pak...", "Ya ampun, kok bisa begini."],
    good:    ["Alhamdulillah, makasih ya nak.", "Wah baik banget mas.", "Senang nih, semoga berkah."],
    bad:     ["Ya ampun, kecewa saya...", "Astaghfirullah... yaudah deh.", "Saya doakan ya mas."]
  },
  sus: {
    event:   ["Hmmm... lo tenang kan?", "Eh... jangan macam-macam ya...", "Awas ya, gw observasi lo."],
    good:    ["Nice, lo bisa diandelin.", "Mantap, gw inget muka lo.", "Lo bisa diajak bisnis nih."],
    bad:     ["Hmm.. mencurigakan banget lo...", "Awas kalo ketemu lagi...", "Lo ngapain sih sebenernya..."]
  },
  mistik: {
    event:   ["...Saya sudah tahu...", "...Pertanda buruk ini, ngab...", "...Hawa-hawanya tidak enak..."],
    good:    ["...Garis tanganmu panjang...", "...Leluhur ridha denganmu...", "...Selamat, terhindar dari sial..."],
    bad:     ["...Karma akan datang...", "...Hari ini sial menyertaimu...", "...Mandi kembang dulu sebaiknya..."]
  }
};

/* ---------- Order modes & themed dictionaries ---------- */
const FOODS = [
  "Nasi Padang Sederhana", "Mie Gacoan Lvl 5", "Ayam Geprek Bensu",
  "Pizza Hut Personal", "Boba Brown Sugar", "Seblak Kuah Pedes",
  "Indomie Telor Kornet", "Soto Mie Bogor", "Bubur Ayam Pak Karim",
  "Rice Bowl Korean BBQ", "Es Teh Solo", "Kopi Susu Kenangan",
  "Martabak Manis Bangka", "Sate Padang Mak Syukur"
];

const PACKAGES = [
  "Dokumen notaris (penting)", "Hadiah ulang tahun",
  "Obat dari apotek", "Buku COD Tokopedia",
  "Charger HP ketinggalan", "Baju lebaran anak",
  "Sepatu preloved", "Bunga mawar 1 buket",
  "Kue ulang tahun", "Galon Aqua 19L",
  "Cermin antik", "Amplop misterius"
];


/* ---------- 45 SCENARIOS ---------- */
const SCENARIOS = [
  { title: "Razia Polisi 🚓", mode: "any", event: "Di depan ada razia! Polisi cek STNK & SIM.",
    A: { label: "Putar balik diam-diam",        eff: { bensin: -15 },                       result: "Aman, lu putar balik. Bensin makin tipis." },
    B: { label: "Lewatin santai aja",           eff: { baterai: -5, saldo: 15000 },         result: "Polisi cuek. Customer puas, kasih tip." } },
  { title: "Banjir Semata Kaki 🌊", mode: "any", event: "Jalan utama banjir setinggi mata kaki.",
    A: { label: "Terobos, gas pol",             eff: { bensin: -20, saldo: 20000 },         result: "Sukses nembus banjir, customer kasih bonus berani." },
    B: { label: "Neduh dulu di halte",          eff: { baterai: -15, rating: -0.5 },        result: "Telat sampai, customer sebel. Rating turun." } },
  { title: "Portal Komplek Digembok 🚧", mode: "any", event: "Portal komplek dikunci satpam.",
    A: { label: "Muter jauh lewat belakang",    eff: { bensin: -15 },                       result: "Lewat jalur tikus, bensin boros tapi nyampe." },
    B: { label: "Suruh customer jalan kaki",    eff: { rating: -1.0 },                      result: "Customer ngomel jalan 200m. Rating jeblok." } },
  { title: "Ban Kempes 🛞", mode: "any", event: "Brebet... ban belakang kempes!",
    A: { label: "Tambal ban dulu",              eff: { baterai: -15, saldo: -20000 },       result: "Tambal ban 20rb, telat dikit tapi selamet." },
    B: { label: "Paksa jalan terus",            eff: { bensin: -25 },                       result: "Pelek kena, bensin makin boros karena drag." } },
  { title: "Penumpang Bau Muntah 🤢", mode: "ride", event: "Customer kayak abis pesta minggu malem.",
    A: { label: "Kasih tolak angin",            eff: { saldo: -5000, rating: 1.0 },         result: "Customer melek, rating bintang 5 plus tip ucapan terima kasih." },
    B: { label: "Turunin di pinggir",           eff: { rating: -2.0 },                      result: "Customer ngamuk lapor CS. Rating ancur." } },
  { title: "Diajak Ngobrol Politik 🗳️", mode: "ride", event: "Bapak-bapak ngajakin debat capres.",
    A: { label: "Iyain aja semua",              eff: { baterai: -10, rating: 1.0 },         result: "'Iya pak, betul pak.' Customer seneng banget kasih bintang 5." },
    B: { label: "Debat balik ngotot",           eff: { rating: -1.5 },                      result: "Adu mulut sampe tujuan. Customer kasih review pedes." } },
  { title: "Macet Demo 🪧", mode: "any", event: "Demo BBM di Sudirman, total gridlock.",
    A: { label: "Selap-selip trotoar",          eff: { bensin: -15, saldo: 15000 },         result: "Kreatif! Customer bonus karena buru-buru." },
    B: { label: "Pasrah nunggu",                eff: { baterai: -25 },                      result: "2 jam diem, baterai HP nyaris tewas." } },
  { title: "Penumpang Bawa Kucing 🐱", mode: "ride", event: "Kucing meong-meong di pangkuan customer.",
    A: { label: "Sabar bawa pelan",             eff: { bensin: -10 },                       result: "Sampai aman, kucingnya gak jatuh. Phew." },
    B: { label: "Cancel orderan",               eff: { rating: -0.5 },                      result: "Customer kecewa cancel. Rating turun." } },
  { title: "Map Muter-Muter 🗺️", mode: "any", event: "Google Maps suruh masuk gang buntu.",
    A: { label: "Tanya warga sekitar",          eff: { baterai: -10 },                      result: "Bapak warung tunjukin jalan. Mantap." },
    B: { label: "Nebak jalan sendiri",          eff: { bensin: -15 },                       result: "Muter-muter 4x. Bensin boros." } },
  { title: "Zona Ojek Pangkalan 🚫", mode: "ride", event: "Ada plang 'Ojek Online Dilarang Masuk'.",
    A: { label: "Sembunyiin jaket ojol",        eff: { baterai: -5 },                       result: "Pura-pura jadi pacar customer. Lolos." },
    B: { label: "Nekat masuk pake jaket",       eff: { baterai: -20, rating: 1.0 },         result: "Hampir digebukin tapi customer puas keberanian lu." } },
  { title: "Antrean Mie Gacoan 🍜", mode: "food", event: "Antrean ngular sampe parkiran.",
    A: { label: "Antre 1 jam dengan sabar",     eff: { baterai: -30, rating: 1.0 },         result: "Customer terharu, kasih bintang 5 + tip." },
    B: { label: "Cancel orderan",               eff: { rating: -1.5 },                      result: "Customer marah-marah di kolom review." } },
  { title: "Kuah Seblak Tumpah 🌶️", mode: "food", event: "Plastik bocor, kuah seblak tumpah di tas.",
    A: { label: "Jujur ke customer",            eff: { rating: -0.5 },                      result: "Customer kecewa tapi ngerti. Rating turun dikit." },
    B: { label: "Beliin baru sembunyi-sembunyi",eff: { saldo: -25000, rating: 1.0 },        result: "Customer gak tahu, malah puji rasanya. Bintang 5." } },
  { title: "Resto Tutup Tiba-tiba 🚪", mode: "food", event: "Sampai resto, ternyata tutup permanen.",
    A: { label: "Telpon CS bantuan",            eff: { baterai: -15 },                      result: "CS bantuin reroute. Aman." },
    B: { label: "Suruh customer cancel",        eff: { rating: -0.5 },                      result: "Customer kesel disuruh cancel sendiri." } },
  { title: "Orderan Fiktif 👻", mode: "food", event: "Pesanan 50rb tapi customer ga ada di lokasi.",
    A: { label: "Makan sendiri ayamnya",        eff: { saldo: -50000, baterai: 20 },        result: "Kenyang sih, tapi rugi 50k. Mood naik dikit." },
    B: { label: "Lapor & sumbang panti",        eff: { saldo: -50000, rating: 1.0 },        result: "Anak panti seneng. Karma baik, rating naik." } },
  { title: "Level Pedas Aneh 🔥", mode: "food", event: "Customer minta 'pedas level dewa' tapi resto cuma punya level 5.",
    A: { label: "Debat sama koki",              eff: { baterai: -15 },                      result: "Koki nambahin cabe rawit. Aman." },
    B: { label: "Bawa seadanya aja",            eff: { rating: -1.0 },                      result: "Customer ngamuk: 'INI MAH GAK PEDES SAMA SEKALI!'" } }
];


SCENARIOS.push(
  { title: "Hujan Badai Makanan 🌧️", mode: "food", event: "Hujan deres, makanan basah-basahan di motor.",
    A: { label: "Masukin ke jaket",             eff: { baterai: -15, rating: 1.0 },         result: "Makanan kering, customer kagum. Bintang 5." },
    B: { label: "Bawa di luar terus",           eff: { rating: -1.5 },                      result: "Pizza jadi sup. Customer murka." } },
  { title: "Antar ke Lantai 30 🏢", mode: "send", event: "Apartmen, lift rusak, customer minta diantar ke unit.",
    A: { label: "Naik tangga rela",             eff: { baterai: -20 },                      result: "Ngos-ngosan tapi sampe. Pegel banget." },
    B: { label: "Suruh turun ke lobby",         eff: { rating: -1.0 },                      result: "Customer ngomel: 'MALES BANGET LU'." } },
  { title: "Customer Gak Angkat Telpon 📵", mode: "any", event: "Sampe titik jemput, customer no respon 15 menit.",
    A: { label: "Tunggu 15 menit",              eff: { baterai: -20 },                      result: "Akhirnya nongol sambil minta maaf. Lanjut." },
    B: { label: "Titip ke satpam",              eff: { rating: -0.5 },                      result: "Satpam terima, customer komplen." } },
  { title: "Kopi Susu Tumpah ☕", mode: "food", event: "Tutup gelas kopi gak rapet.",
    A: { label: "Nyetir super pelan",           eff: { bensin: -20 },                       result: "10km/jam selama 30 menit. Bensin boros idle." },
    B: { label: "Cancel orderan",               eff: { rating: -0.5 },                      result: "Customer kecewa, kopi nya udah dingin." } },
  { title: "Suruh Talangin 100k 💸", mode: "food", event: "Customer minta lu bayarin dulu, nanti ditransfer.",
    A: { label: "Talangin 100k",                eff: { saldo: -50000 },                     result: "Customer transfer + tip 50k. Net minus 50k aja." },
    B: { label: "Tolak halus",                  eff: { rating: -0.5 },                      result: "Customer kesel, kasih bintang 3." } },
  { title: "Bawa 3 Galon Aqua 💧", mode: "send", event: "Customer pesen 3 galon, motor nya kelihatan reot.",
    A: { label: "Iket pake tali rafia",         eff: { bensin: -30, saldo: 40000 },         result: "Sampe selamet, customer kagum bonus 40k." },
    B: { label: "Cancel, kelebihan beban",      eff: { rating: -1.5 },                      result: "Customer komplen ke aplikator." } },
  { title: "Paket Ular Hidup 🐍", mode: "send", event: "Pengirim: 'Hati-hati, isinya ular sanca.'",
    A: { label: "Bawa dengan tenang",           eff: { baterai: -15, saldo: 50000 },        result: "Klien reptil seneng banget, tip gede." },
    B: { label: "Tolak orderan",                eff: { rating: -0.5 },                      result: "Pengirim kecewa. Rating turun." } },
  { title: "Kue Tart Pengantin 🎂", mode: "send", event: "Tart 3 tingkat buat hajatan.",
    A: { label: "Nyetir extra pelan",           eff: { bensin: -20, baterai: -15 },         result: "Tart utuh, kelihatan mengilap. Wuih." },
    B: { label: "Nyetir biasa aja",             eff: { rating: -2.0 },                      result: "Tart hancur jadi puding. Customer nangis." } },
  { title: "Alamat di Kuburan 🪦", mode: "any", event: "Pin lokasi tepat di tengah kuburan.",
    A: { label: "Trabas masuk kuburan",         eff: { bensin: -20, baterai: -10 },         result: "Bulu kuduk berdiri, tapi sampe juga. Aman." },
    B: { label: "Minta jemput depan gang",      eff: { rating: -1.0 },                      result: "Customer kesel disuruh jalan." } },
  { title: "Paket Kena Hujan 📦", mode: "send", event: "Paket basah karena rain cover bocor.",
    A: { label: "Keringin pake lap",            eff: { baterai: -5 },                       result: "Paket lumayan kering, customer maklum." },
    B: { label: "Langsung kasih basah",         eff: { rating: -1.0 },                      result: "Customer komplen kardus penyok basah." } },
  { title: "COD Nolak Bayar 💵", mode: "send", event: "Customer COD bilang 'duitnya gak cukup, nego lah'.",
    A: { label: "Debat keras",                  eff: { baterai: -25, rating: 0.5 },         result: "Akhirnya bayar full + minta maaf. Rating naik." },
    B: { label: "Bawa balik paketnya",          eff: { bensin: -20 },                       result: "Pulang bawa paket, capek." } },
  { title: "Angkat Kulkas 1 Pintu 🧊", mode: "send", event: "Customer minta bantu angkat ke lantai 2.",
    A: { label: "Bantuin angkat",               eff: { baterai: -30, saldo: 50000 },        result: "Pinggang remek, tapi tip 50k. Mantap." },
    B: { label: "Nolak halus",                  eff: { rating: -0.5 },                      result: "Customer kecewa, ngeluh di review." } },
  { title: "Dipalak Preman 😎", mode: "any", event: "Preman portal minta jatah 10rb.",
    A: { label: "Bayar 10rb biar aman",         eff: { saldo: -10000 },                     result: "Lolos tanpa drama. Terpaksa sih." },
    B: { label: "Adu mulut",                    eff: { baterai: -20, bensin: -10 },         result: "Hampir berantem, kabur naik motor. Aman tapi tegang." } },
  { title: "Bunga Buat Selingkuhan 💐", mode: "send", event: "Customer cowok minta antar bunga ke alamat selain rumah.",
    A: { label: "Jaga rahasia",                 eff: { saldo: 20000 },                      result: "Customer kasih tip 20k buat tutup mulut." },
    B: { label: "Cepu ke istri pas dianter",    eff: { rating: -2.0, baterai: -10 },        result: "Drama keluarga pecah. Customer marah, rating ancur." } }
);


SCENARIOS.push(
  { title: "Penerima Lagi Mandi 🚿", mode: "send", event: "Customer bilang 'tunggu 10 menit ya, abis mandi'.",
    A: { label: "Tunggu sabar",                 eff: { baterai: -15 },                      result: "Akhirnya keluar handukan. Aman." },
    B: { label: "Lempar paket ke pagar",        eff: { rating: -1.5 },                      result: "Paket nyangkut, customer marah-marah di chat." } },
  { title: "Lewat Gang Hajatan 🎉", mode: "any", event: "Gang lagi hajatan nikahan, jalan rame.",
    A: { label: "Numpang lewat pelan",          eff: { baterai: -10, rating: 0.5 },         result: "Disambut tukang shawl. Customer maklum, rating naik." },
    B: { label: "Muter jauh banget",            eff: { bensin: -20 },                       result: "Aman tapi bensin tipis." } },
  { title: "Dicegat Mata Elang (DC) 👁️", mode: "any", event: "Mata elang ngira motor lu kreditan macet.",
    A: { label: "Tancap gas kabur",             eff: { bensin: -25, saldo: 10000 },         result: "Adrenaline rush, customer kasih bonus." },
    B: { label: "Ngumpet di warkop",            eff: { baterai: -20 },                      result: "Sembunyi 30 menit. Aman tapi telat." } },
  { title: "Pura-Pura Jadi Pacar 💕", mode: "ride", event: "Customer cewek suruh akting jadi pacar pas ketemu ortu.",
    A: { label: "Akting total cinta",           eff: { baterai: -15, saldo: 50000 },        result: "Akting lu Oscar-worthy. Tip 50k. Salfok." },
    B: { label: "Tolak mentah-mentah",          eff: { rating: -1.0 },                      result: "Customer ngedrop, kasih bintang 1." } },
  { title: "Aplikasi Minta Face ID 🤳", mode: "any", event: "App suruh verifikasi muka di tengah orderan.",
    A: { label: "Minggir copot helm",           eff: { baterai: -10 },                      result: "Verifikasi sukses. Lanjut." },
    B: { label: "Paksa jalan tanpa map",        eff: { bensin: -20 },                       result: "Nyasar 2x putar balik. Bensin abis." } },
  { title: "Makanan Dimakan Kucing Liar 🐈", mode: "food", event: "Pas parkir, kucing nyolong nasi padangnya.",
    A: { label: "Jujur ke customer",            eff: { rating: -1.5 },                      result: "Customer ngomel: 'YA SUDAH GAUSAH JUJUR JUGA.'" },
    B: { label: "Beli baru diam-diam",          eff: { saldo: -30000, rating: 1.0 },        result: "Customer gak tahu, malah puji rasa. Bintang 5." } },
  { title: "Customer Kesurupan 👹", mode: "ride", event: "Di tengah jalan customer ngomong bahasa Sansekerta.",
    A: { label: "Bawa ke orang pintar",         eff: { bensin: -20, saldo: 50000 },         result: "Sembuh, keluarga kasih amplop tebel." },
    B: { label: "Turunin di pos polisi",        eff: { rating: -0.5 },                      result: "Polisi bingung, customer keluarga komplen." } },
  { title: "Ditilang Polisi 👮", mode: "any", event: "Polantas: 'STNK pak.' Lampu lu mati.",
    A: { label: "Bayar damai",                  eff: { saldo: -50000 },                     result: "Pak polisi senyum, lu lanjut jalan." },
    B: { label: "Minta surat tilang merah",     eff: { baterai: -30 },                      result: "Sidang 2 jam, baterai HP nyaris tewas." } },
  { title: "Bawa Cermin Kaca Besar 🪞", mode: "send", event: "Customer pesen cermin 1.5m dari toko mebel.",
    A: { label: "Jalan 10km/jam super hati2",   eff: { bensin: -15, baterai: -20 },         result: "Sampe utuh kinclong. Customer puas banget." },
    B: { label: "Jalan biasa aja",              eff: { rating: -2.0 },                      result: "Cermin pecah jadi puzzle. Customer murka 7 tahun sial." } },
  { title: "Maps Nyasar ke Tol 🛣️", mode: "any", event: "Eh kok masuk gerbang tol nih?!",
    A: { label: "Putar balik di celah",         eff: { bensin: -20, baterai: -10 },         result: "Selip lewat celah barikade. Selamet." },
    B: { label: "Bablas nyamper exit",          eff: { saldo: -100000 },                    result: "Kena tilang ETLE 100k. Tabungan tergerus." } },
  { title: "Customer Berantem ama Pacar 💑", mode: "ride", event: "Customer ribut sama pacar di motor lu.",
    A: { label: "Jadi penengah bijak",          eff: { baterai: -15, saldo: 20000 },        result: "Mereka damai, kasih lu tip mediator." },
    B: { label: "Pura-pura budek",              eff: { baterai: -5 },                       result: "Mereka tetep berantem sampe tujuan. Awkward max." } },
  { title: "Helm Customer Hilang 🪖", mode: "ride", event: "Helm extra lu dicuri pas parkir indomaret.",
    A: { label: "Kasih helm sendiri",           eff: { baterai: -20, rating: 1.0 },         result: "Customer terharu, bintang 5 + thank you note." },
    B: { label: "Suruh naik tanpa helm",        eff: { rating: -1.5 },                      result: "Customer takut, lapor CS." } },
  { title: "Orderan Susuk Mistik 🔮", mode: "send", event: "Pengirim: 'Antar amplop ini, isinya jenglot.'",
    A: { label: "Bawa sambil komat-kamit",      eff: { baterai: -20, saldo: 80000 },        result: "Pengirim kasih bonus 80k karena berani." },
    B: { label: "Buang ke kali",                eff: { rating: -2.0, saldo: -20000 },       result: "Customer murka, denda + rating jeblok." } },
  { title: "Ban Selip Masuk Sawah 🌾", mode: "any", event: "Pas hujan, motor nyemplung pinggir sawah.",
    A: { label: "Bayar warga buat narik",       eff: { saldo: -30000, bensin: -10 },        result: "5 bapak narik motor pake tali. Lolos." },
    B: { label: "Dorong sendiri 200m",          eff: { baterai: -35 },                      result: "Bajunya lumpur semua, capek nuelek." } },
  { title: "HP Customer Jatuh ke Jok 📱", mode: "ride", event: "Customer panik HP keselip di jok belakang.",
    A: { label: "Bongkar jok pinggir jalan",    eff: { baterai: -20, bensin: -5 },          result: "Ketemu! Customer lega, makasih." },
    B: { label: "Suruh raba sendiri",           eff: { rating: -1.0 },                      result: "Customer kesel ngeraba sambil malu." } },
  { title: "Tawuran Pelajar Depan Mata 👊", mode: "any", event: "Tawuran SMA blokir jalan, gir terbang.",
    A: { label: "Terobos badai gir",            eff: { baterai: -30, saldo: 30000 },        result: "Helm kena pelet, tapi customer kasih bonus berani." },
    B: { label: "Nunggu sampe bubar",           eff: { bensin: -10, baterai: -20 },         result: "Idle 1 jam, customer kabur duluan." } }
);


/* ============================================================
   UTILITIES
   ============================================================ */
const $ = (id) => document.getElementById(id);
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function fmtRp(n) {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(Math.round(n));
  const s = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp ${s}`;
}

function fmtShort(n) {
  if (Math.abs(n) >= 1000) {
    const v = (n / 1000);
    const r = Math.abs(v) >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    return `${r}k`;
  }
  return `${n}`;
}

function fmtEffect(eff) {
  const parts = [];
  if (eff.saldo !== undefined && eff.saldo !== 0)     parts.push(`Saldo ${eff.saldo > 0 ? '+' : ''}${fmtShort(eff.saldo)}`);
  if (eff.baterai !== undefined && eff.baterai !== 0) parts.push(`Bat ${eff.baterai > 0 ? '+' : ''}${eff.baterai}%`);
  if (eff.bensin !== undefined && eff.bensin !== 0)   parts.push(`Gas ${eff.bensin > 0 ? '+' : ''}${eff.bensin}%`);
  if (eff.rating !== undefined && eff.rating !== 0)   parts.push(`⭐ ${eff.rating > 0 ? '+' : ''}${eff.rating}`);
  return parts.join(', ');
}


/* ============================================================
   GAME MANAGER
   ============================================================ */
const Game = {
  state: { ...INITIAL },
  currentOrder: null,
  crisisActive: false,
  crisisType: null,
  gameOverFlag: false,
  awaitingChoice: false,

  /* ---------- Lifecycle ---------- */
  init() {
    // Splash → Menu
    setTimeout(() => {
      $('splash').classList.add('hidden');
      $('mainMenu').classList.remove('hidden');
      // Show continue if save exists
      if (this.hasSave()) $('btnContinue').classList.remove('hidden');
    }, 2700);

    // Menu buttons
    $('btnNewGame').addEventListener('click', () => this.startNewGame());
    $('btnContinue').addEventListener('click', () => this.continueGame());

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });

    // Narik
    $('btnCariOrderan').addEventListener('click', () => this.cariOrderan());

    // Choice & AI
    $('choiceA').addEventListener('click', () => this.choose('A'));
    $('choiceB').addEventListener('click', () => this.choose('B'));
    $('btnAskAI').addEventListener('click', () => this.useAI());

    // Crisis
    $('crisisA').addEventListener('click', () => this.resolveCrisis('A'));
    $('crisisB').addEventListener('click', () => this.resolveCrisis('B'));

    // Game Over
    $('btnBackMenu').addEventListener('click', () => this.backToMenu());

    // Shop
    document.querySelectorAll('.shop-buy').forEach(btn => {
      btn.addEventListener('click', () => this.buy(btn.dataset.shop));
    });
  },

  hasSave() {
    try { return !!localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
  },

  save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); } catch (e) {}
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.state = { ...INITIAL, ...data };
      return true;
    } catch (e) { return false; }
  },

  clearSave() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  },

  startNewGame() {
    this.clearSave();
    this.state = { ...INITIAL };
    this.currentOrder = null;
    this.crisisActive = false;
    this.gameOverFlag = false;
    this.awaitingChoice = false;
    this.save();
    this.enterGame();
  },

  continueGame() {
    if (!this.load()) { this.startNewGame(); return; }
    this.currentOrder = null;
    this.crisisActive = false;
    this.gameOverFlag = false;
    this.awaitingChoice = false;
    this.enterGame();
  },

  enterGame() {
    $('mainMenu').classList.add('hidden');
    $('phone').classList.remove('hidden');
    this.clearChat(true);
    this.switchTab('screenNarik');
    this.render();
  },

  backToMenu() {
    $('gameOverModal').classList.add('hidden');
    $('phone').classList.add('hidden');
    $('mainMenu').classList.remove('hidden');
    if (this.hasSave()) $('btnContinue').classList.remove('hidden');
    else $('btnContinue').classList.add('hidden');
  },


  /* ---------- Render ---------- */
  render() {
    const s = this.state;
    $('statSaldo').textContent = fmtRp(s.saldo);
    $('statBaterai').textContent = `${Math.round(s.baterai)}%`;
    $('statBensin').textContent = `${Math.round(s.bensin)}%`;
    $('statRating').textContent = s.rating.toFixed(1);
    $('infoDay').textContent = `Hari ${s.day}`;
    $('infoOrder').textContent = `Order #${s.orderCount}`;
    const w = WEATHERS.find(x => x.id === s.weather) || WEATHERS[0];
    const t = TIMES.find(x => x.id === s.time) || TIMES[0];
    $('infoWeather').textContent = w.label;
    $('infoTime').textContent = t.label;

    // Warn / danger styling on stats
    const setLevel = (el, val) => {
      el.classList.remove('warn', 'danger');
      if (val <= 10) el.classList.add('danger');
      else if (val <= 25) el.classList.add('warn');
    };
    setLevel(document.querySelector('[data-stat="baterai"]'), s.baterai);
    setLevel(document.querySelector('[data-stat="bensin"]'), s.bensin);

    // Saldo warn
    const saldoEl = document.querySelector('[data-stat="saldo"]');
    saldoEl.classList.remove('warn', 'danger');
    if (s.saldo <= -30000) saldoEl.classList.add('danger');
    else if (s.saldo <= 0) saldoEl.classList.add('warn');

    // Rating warn
    const rateEl = document.querySelector('[data-stat="rating"]');
    rateEl.classList.remove('warn', 'danger');
    if (s.rating <= 3.3) rateEl.classList.add('danger');
    else if (s.rating <= 4.0) rateEl.classList.add('warn');

    // Shop buttons enable/disable
    document.querySelectorAll('.shop-buy').forEach(btn => {
      const price = SHOP[btn.dataset.shop]?.price ?? 0;
      btn.disabled = s.saldo < price;
    });

    // AI button enable
    $('btnAskAI').disabled = s.baterai < 15 || !this.awaitingChoice;
  },

  /* ---------- Tabs ---------- */
  switchTab(id) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    if (id === 'screenChat') $('chatBadge').classList.add('hidden');
  },

  bumpStat(key) {
    const el = document.querySelector(`[data-stat="${key}"]`);
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth; // reflow
    el.classList.add('bump');
  },

  floatChange(text, gain) {
    const div = document.createElement('div');
    div.className = `float-item ${gain ? 'gain' : 'lose'}`;
    div.textContent = text;
    $('floatFeed').appendChild(div);
    setTimeout(() => div.remove(), 1700);
  },


  /* ---------- Apply effects ---------- */
  applyEffects(eff, opts = {}) {
    const order = ['saldo', 'baterai', 'bensin', 'rating'];
    const labels = {
      saldo:   (v) => `${v > 0 ? '+' : ''}${fmtRp(v).replace('Rp ', 'Rp')}`,
      baterai: (v) => `🔋 ${v > 0 ? '+' : ''}${v}%`,
      bensin:  (v) => `⛽ ${v > 0 ? '+' : ''}${v}%`,
      rating:  (v) => `⭐ ${v > 0 ? '+' : ''}${v.toFixed(1)}`
    };
    let delay = 0;
    order.forEach(k => {
      if (eff[k] === undefined || eff[k] === 0) return;
      const v = eff[k];
      if (k === 'saldo')        this.state.saldo += v;
      else if (k === 'baterai') this.state.baterai = clamp(this.state.baterai + v, 0, 100);
      else if (k === 'bensin')  this.state.bensin  = clamp(this.state.bensin + v, 0, 100);
      else if (k === 'rating')  this.state.rating  = clamp(this.state.rating + v, 0, 5.0);
      // schedule animations slightly staggered
      setTimeout(() => {
        this.floatChange(labels[k](v), v > 0);
        this.bumpStat(k);
        this.render();
      }, delay);
      delay += 140;
    });
    // Save & checks (after animations queued)
    setTimeout(() => {
      this.save();
      if (!opts.skipChecks) this.runChecks();
    }, delay + 30);
  },

  runChecks() {
    if (this.gameOverFlag || this.crisisActive) return;
    // True game over takes priority
    if (this.state.rating < 3.0) {
      this.triggerGameOver('rating'); return;
    }
    if (this.state.saldo < -50000) {
      this.triggerGameOver('bankrupt'); return;
    }
    // Crises
    if (this.state.baterai <= 0) { this.showCrisis(1); return; }
    if (this.state.bensin  <= 0) { this.showCrisis(2); return; }
  },


  /* ---------- Chat helpers ---------- */
  appendChat(type, text) {
    const body = $('chatBody');
    // Remove empty placeholder if exists
    const empty = body.querySelector('.chat-empty');
    if (empty) empty.remove();
    const el = document.createElement('div');
    el.className = `chat-msg ${type}`;
    el.innerHTML = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  },

  clearChat(showEmpty) {
    const body = $('chatBody');
    body.innerHTML = '';
    if (showEmpty) {
      body.innerHTML = `
        <div class="chat-empty">
          <p>📭 Inbox masih sepi.</p>
          <p>Buka tab <b>Narik</b>, klik <b>Cari Orderan</b>.</p>
        </div>`;
    }
    $('chatName').textContent = 'Inbox Kosong';
    $('chatStatus').textContent = 'belum ada orderan masuk';
    $('chatAvatar').textContent = '🛵';
    $('choiceButtons').classList.add('hidden');
    $('btnAskAI').classList.add('hidden');
  },

  /* ---------- Order flow ---------- */
  cariOrderan() {
    if (this.gameOverFlag || this.crisisActive) return;
    if (this.currentOrder) {
      $('radarStatus').textContent = 'Masih ada orderan aktif. Buka tab Chat.';
      this.switchTab('screenChat');
      return;
    }
    // Need some bensin & baterai to take an order
    if (this.state.baterai <= 0) { this.showCrisis(1); return; }
    if (this.state.bensin  <= 0) { this.showCrisis(2); return; }

    // Generate
    const npc = pick(NPCS);
    const scenario = pick(SCENARIOS);
    const weather = pick(WEATHERS);
    const time = pick(TIMES);
    this.state.weather = weather.id;
    this.state.time = time.id;
    // Resolve order mode (scenario.mode "any" → randomized)
    const mode = scenario.mode === 'any' ? pick(['ride','food','send']) : scenario.mode;
    let modeBrief;
    if (mode === 'food') {
      const food = pick(FOODS);
      modeBrief = `🍔 <b>GoFood</b> • Pesanan: <i>${food}</i><br>📦 Antar ke <b>${npc.name}</b>`;
    } else if (mode === 'send') {
      const item = pick(PACKAGES);
      modeBrief = `📦 <b>GoSend</b> • Paket: <i>${item}</i><br>👤 Antar ke <b>${npc.name}</b>`;
    } else {
      modeBrief = `🛵 <b>GoRide</b> • Jemput <b>${npc.name}</b><br>📍 Tujuan: <i>${npc.dest}</i>`;
    }
    this.currentOrder = { npc, scenario, weather, time, mode };

    // Small startup cost (mengantar = pakai bensin & baterai)
    const startBat = -(rand(3) + 2);  // -2..-4
    const startGas = -(rand(4) + 3);  // -3..-6
    this.applyEffects({ baterai: startBat, bensin: startGas }, { skipChecks: true });

    // Setup chat
    this.clearChat(false);
    $('chatAvatar').textContent = npc.emoji;
    $('chatName').textContent = npc.name;
    $('chatStatus').textContent = `online — ${weather.label.replace(/^\S+\s/,'')} / ${time.label.replace(/^\S+\s/,'')}`;
    // ONE consolidated order card
    this.appendChat('event',
      `📍 <b>Order #${this.state.orderCount + 1}</b><br>${weather.label} • ${time.label}<br>${modeBrief}`);
    this.appendChat('npc', `<b>${npc.name}:</b> ${npc.line}`);
    setTimeout(() => {
      // Scenario kicks in (no awkward "di tengah perjalanan" bridge — event card stands alone)
      this.appendChat('event', `⚠️ <b>${scenario.title}</b><br>${scenario.event}`);
      // NPC reacts to event in their mood
      const moodSet = MOODS[npc.mood] || MOODS.chill;
      const reaction = pick(moodSet.event);
      this.appendChat('npc', `<b>${npc.name}:</b> ${reaction}`);
      // Show choices
      $('choiceA').innerHTML = `<span class="choice-tag">A</span>${scenario.A.label}`;
      $('choiceB').innerHTML = `<span class="choice-tag">B</span>${scenario.B.label}`;
      $('choiceA').disabled = false;
      $('choiceB').disabled = false;
      $('choiceButtons').classList.remove('hidden');
      $('btnAskAI').classList.remove('hidden');
      this.awaitingChoice = true;
      this.render();
    }, 700);

    // Notify
    $('chatBadge').classList.remove('hidden');
    this.switchTab('screenChat');
    $('radarStatus').textContent = 'Order ketemu! Cek tab Chat.';
    this.save();
  },

  computeFare() {
    const w = WEATHERS.find(x => x.id === this.state.weather) || WEATHERS[0];
    const t = TIMES.find(x => x.id === this.state.time) || TIMES[0];
    const base = 9000 + rand(7000); // 9-16k
    return Math.round(base * w.fareMul * t.fareMul);
  },


  choose(option) {
    if (!this.currentOrder || !this.awaitingChoice) return;
    const order = this.currentOrder;
    const opt = order.scenario[option];
    this.awaitingChoice = false;
    $('choiceA').disabled = true;
    $('choiceB').disabled = true;
    $('choiceButtons').classList.add('hidden');
    $('btnAskAI').classList.add('hidden');

    // Player message
    this.appendChat('me', `<b>Lu:</b> ${opt.label}`);

    // Effect
    this.applyEffects(opt.eff, { skipChecks: true });

    // Result narration (third-person, NOT NPC speech)
    setTimeout(() => {
      this.appendChat('narration', `📖 ${opt.result}`);
      // NPC mood reaction is keyed to RATING delta only
      // (gas/baterai cost is player overhead — customer doesn't care about that)
      const moodSet = MOODS[order.npc.mood] || MOODS.chill;
      const ratingDelta = opt.eff.rating ?? 0;
      const isGood = ratingDelta >= 0; // no rating drop = customer fine
      setTimeout(() => {
        const flavor = pick(isGood ? moodSet.good : moodSet.bad);
        this.appendChat('npc', `<b>${order.npc.name}:</b> ${flavor}`);
      }, 500);

      const fare = this.computeFare();
      setTimeout(() => {
        this.appendChat('system', `🪙 Tarif diterima: <b>+${fmtRp(fare)}</b>`);
        this.applyEffects({ saldo: fare }, { skipChecks: true });

        // Tip chance — based on rating
        if (this.state.rating >= 4.5 && Math.random() < 0.30) {
          const tip = (rand(7) + 2) * 1000; // 2-8k
          setTimeout(() => {
            this.appendChat('system', `💸 Customer kasih tip ekstra: <b>+${fmtRp(tip)}</b>`);
            this.applyEffects({ saldo: tip }, { skipChecks: true });
          }, 600);
        }
      }, 1100);

      // End order after a beat — then run checks
      setTimeout(() => {
        this.endOrder();
        this.runChecks();
      }, 2200);
    }, 700);
  },

  endOrder() {
    this.state.orderCount++;
    this.state.ordersToday++;
    if (this.state.ordersToday >= 5) {
      this.state.day++;
      this.state.ordersToday = 0;
      this.appendChat('system', `🌙 Hari berganti — selamat datang di <b>Hari ${this.state.day}</b>.`);
    }
    this.currentOrder = null;
    this.appendChat('system', `✅ Order selesai. Buka tab <b>Narik</b> buat orderan baru.`);
    $('radarStatus').textContent = 'Standby. Klik tombol di bawah buat cari orderan.';
    this.save();
    this.render();
  },


  /* ---------- AI Assistant (Si Tuyul Pintar) ---------- */
  scoreOption(eff) {
    const s = eff.saldo   ?? 0;
    const b = eff.baterai ?? 0;
    const g = eff.bensin  ?? 0;
    const r = eff.rating  ?? 0;
    // Weights tuned to game economy
    return s + b * 250 + g * 350 + r * 30000;
  },

  useAI() {
    if (!this.currentOrder || !this.awaitingChoice) return;
    if (this.state.baterai < 15) {
      this.appendChat('system', `🤖 Baterai tipis bro, gak bisa buka AI.`);
      return;
    }
    // Cost
    this.applyEffects({ baterai: -15 }, { skipChecks: true });
    const order = this.currentOrder;
    const A = order.scenario.A, B = order.scenario.B;
    const sA = this.scoreOption(A.eff);
    const sB = this.scoreOption(B.eff);
    const better = sA >= sB ? 'A' : 'B';
    const worse  = better === 'A' ? 'B' : 'A';
    const verdicts = [
      `Mending pilih <b>${better}</b> ngab, ${worse} mah boncos.`,
      `Kalo gw sih <b>${better}</b> aja, ${worse} riskan banget.`,
      `Gas <b>${better}</b>, ${worse} ngabis-ngabisin doang.`,
      `Pilih <b>${better}</b> save bro. ${worse} bisa bikin nangis.`,
      `<b>${better}</b> lebih cuan. ${worse} cuma jebakan batman.`,
      `Otak gw bilang <b>${better}</b>. ${worse} = ngenes.`
    ];
    const verdict = pick(verdicts);
    const html = `
      🤖 <b>Si Tuyul Pintar</b> nge-analisa...<br>
      📊 Pilih A: <i>${fmtEffect(A.eff) || '(efek minim)'}</i> → skor ${Math.round(sA)}<br>
      📊 Pilih B: <i>${fmtEffect(B.eff) || '(efek minim)'}</i> → skor ${Math.round(sB)}<br>
      💡 ${verdict}
    `;
    this.appendChat('ai', html);
    this.runChecks();
  },


  /* ---------- Crisis ---------- */
  showCrisis(num) {
    if (this.crisisActive || this.gameOverFlag) return;
    this.crisisActive = true;
    this.crisisType = num;
    const m = $('crisisModal');
    if (num === 1) {
      $('crisisIcon').textContent = '🔋';
      $('crisisTitle').textContent = 'STATUS DARURAT — HP MATI!';
      $('crisisText').textContent  = 'Waduh, HP Mati! Orderan belum kelar! Lu mau gimana?';
      $('crisisA').innerHTML = `<b>A.</b> Beli kopi di Warkop biar bisa numpang ngecas. <span style="color:#ff5470">(-Rp15k, Bat +20%, ⭐ -0.5)</span>`;
      $('crisisB').innerHTML = `<b>B.</b> Melas pinjem powerbank ke orang lewat. <span style="color:#ff5470">(⭐ -1.0, Bat +10%)</span>`;
    } else {
      $('crisisIcon').textContent = '⛽';
      $('crisisTitle').textContent = 'STATUS DARURAT — MOTOR MOGOK!';
      $('crisisText').textContent  = 'Brebet.. brebet.. Motor mogok kehabisan bensin!';
      $('crisisA').innerHTML = `<b>A.</b> Dorong motor cari bensin eceran harga getok. <span style="color:#ff5470">(-Rp25k, Gas +30%, Bat -10%)</span>`;
      $('crisisB').innerHTML = `<b>B.</b> Telpon temen ojol buat stut/dorongin. <span style="color:#ff5470">(-Rp10k, ⭐ -1.0)</span>`;
    }
    m.classList.remove('hidden');
  },

  resolveCrisis(option) {
    if (!this.crisisActive) return;
    const num = this.crisisType;
    let eff;
    let cost;
    if (num === 1) {
      if (option === 'A') { eff = { saldo: -15000, baterai: 20, rating: -0.5 }; cost = 15000; }
      else                { eff = { baterai: 10, rating: -1.0 };                 cost = 0; }
    } else {
      if (option === 'A') { eff = { saldo: -25000, bensin: 30, baterai: -10 };   cost = 25000; }
      else                { eff = { saldo: -10000, rating: -1.0 };               cost = 10000; }
    }
    // Check bankruptcy if cost would push saldo below -50k
    if (this.state.saldo - cost < -50000) {
      $('crisisModal').classList.add('hidden');
      this.crisisActive = false;
      // Apply rating effect anyway then bankrupt
      this.triggerGameOver('bankrupt');
      return;
    }
    // Hide modal first
    $('crisisModal').classList.add('hidden');
    this.crisisActive = false;
    this.appendChat('event', `🚨 Status Darurat diatasi: ${option === 'A' ? 'Pilihan A' : 'Pilihan B'}`);
    this.applyEffects(eff);
  },


  /* ---------- Game Over ---------- */
  triggerGameOver(reason) {
    if (this.gameOverFlag) return;
    this.gameOverFlag = true;
    this.crisisActive = false;
    $('crisisModal').classList.add('hidden');
    if (reason === 'rating') {
      $('goTitle').textContent = '💀 AKUN KENA SUSPEND!';
      $('goText').textContent = 'Akun lu kena suspend / gagu pak! Rating jeblok di bawah 3.0. Pulang aja gih.';
    } else {
      $('goTitle').textContent = '💀 BANGKRUT!';
      $('goText').textContent = 'Motor lu ditarik leasing, dikejar pinjol. Lu bangkrut total ngab.';
    }
    $('goDay').textContent = this.state.day;
    $('goOrders').textContent = this.state.orderCount;
    $('goSaldo').textContent = fmtRp(this.state.saldo);
    $('gameOverModal').classList.remove('hidden');
    this.clearSave();
  },

  /* ---------- Shop ---------- */
  buy(itemId) {
    if (this.gameOverFlag) return;
    const item = SHOP[itemId];
    if (!item) return;
    if (this.state.saldo < item.price) {
      this.floatChange('Saldo kurang!', false);
      return;
    }
    // Deduct + apply
    const eff = { saldo: -item.price, ...item.eff };
    this.appendChat('event', `☕ Beli di Warkop: <b>${item.name}</b>`);
    this.applyEffects(eff);
    // If was in crisis but bensin/baterai now > 0, dismiss crisis modal
    if (this.crisisActive) {
      if ((this.crisisType === 1 && this.state.baterai > 0) ||
          (this.crisisType === 2 && this.state.bensin  > 0)) {
        $('crisisModal').classList.add('hidden');
        this.crisisActive = false;
      }
    }
  }
};

/* ---------- Shop catalog ---------- */
const SHOP = {
  bensin1:    { name: 'Bensin Eceran 1L',         price: 12000, eff: { bensin: 35 } },
  bensinFull: { name: 'Bensin Full Tank',         price: 25000, eff: { bensin: 80 } },
  cas1:       { name: 'Numpang Ngecas 15 menit',  price: 8000,  eff: { baterai: 30 } },
  cas2:       { name: 'Cas Penuh + Kopi',         price: 18000, eff: { baterai: 70, rating: 0.1 } },
  mie:        { name: 'Indomie Telor',            price: 10000, eff: { rating: 0.2 } }
};

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => Game.init());
