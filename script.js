// =========================================================================
// AGRI-DIRECT REAL-TIME FIREBASE ENGINE
// =========================================================================
// Replace the placeholder values below with your Firebase Web App configuration:
// (Firebase Console -> Project Settings -> General -> Your apps -> Web app)

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-NZGy7XLD98K5tvqxW2JWbPi0FzsDW-w",
  authDomain: "agridirect-d189f.firebaseapp.com",
  projectId: "agridirect-d189f",
  storageBucket: "agridirect-d189f.firebasestorage.app",
  messagingSenderId: "130901995399",
  appId: "1:130901995399:web:215bee695781862750ad22",
  measurementId: "G-LT333QP3QH"
};

// Initialize Firebase App & Firestore Database
let db = null;
let isFirebaseConfigured = false;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        isFirebaseConfigured = true;
        console.log("✅ Firebase Realtime Engine Connected Successfully!");
    } else {
        console.warn("⚠️ Firebase configuration keys not replaced yet. Running in local fallback mode.");
    }
} catch (err) {
    console.error("Firebase initialization error:", err);
}

// LOCAL STORAGE KEYS & IN-MEMORY STATE CACHE
// LOCAL STORAGE KEYS
const USERS_KEY = 'agri_users';
const SESSION_KEY = 'agri_session';
const PRODUCTS_KEY = 'agri_products';
const ORDERS_KEY = 'agri_orders';
const REVIEWS_KEY = 'agri_reviews';
const MESSAGES_KEY = 'agri_messages';
const QA_KEY = 'agri_qa';

// CROP GRADE DEFINITIONS & EXPLANATIONS
const CROP_GRADES = {
    "Grade A": {
        label: "Grade A (Export / Supermarket Premium)",
        badgeClass: "grade-a",
        description: "Export / Supermarket Premium: Superior appearance, uniform size, vibrant color, and zero visible surface defects."
    },
    "Grade B": {
        label: "Grade B (Commercial / Fresh Local Market)",
        badgeClass: "grade-b",
        description: "Commercial / Fresh Market: High freshness and excellent taste with minor cosmetic blemishes or slight size variation."
    },
    "Grade C": {
        label: "Grade C (Processing / Kitchen Grade)",
        badgeClass: "grade-c",
        description: "Processing / Kitchen Grade: Imperfect shape or size, ideal for cooking, juicing, canning, or commercial food prep."
    },
    "Organic": {
        label: "Organic Certified (Chemical-Free)",
        badgeClass: "grade-organic",
        description: "Certified Organic: Grown without synthetic pesticides, chemical fertilizers, or GMOs in organic-certified soil."
    },
    "Naturally Grown": {
        label: "Naturally Grown (Pesticide-Free)",
        badgeClass: "grade-natural",
        description: "Naturally Grown: Grown using traditional eco-friendly methods without harmful synthetic pesticides by local smallholders."
    }
};

// PHILIPPINE ADMINISTRATIVE HIERARCHY (PSGC 2026 REFERENCE)
const PH_LOCATIONS = {
    "National Capital Region (NCR)": {
        "NCR": ["Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong", "Manila", "Marikina", "Muntinlupa", "Navotas", "Parañaque", "Pasay", "Pasig", "Quezon City", "San Juan", "Taguig", "Valenzuela", "Pateros"]
    },
    "Cordillera Administrative Region (CAR)": {
        "Abra": ["Bangued", "Boliney", "Bucay", "Bucloc", "Daguioman", "Danglas", "Dolores", "La Paz", "Lacub", "Lagangilang", "Lagayan", "Langiden", "Licuan-Baay", "Luba", "Malibcong", "Manabo", "Peñarrubia", "Pidigan", "Pilar", "Sallapadan", "San Isidro", "San Juan", "San Quintin", "Tayum", "Tineg", "Tubo", "Villaviciosa"],
        "Benguet": ["Atok", "Bakun", "Bokod", "Buguias", "Baguio City", "Itogon", "Kabayan", "Kapangan", "Kibungan", "La Trinidad", "Mankayan", "Sablan", "Tuba", "Tublay"],
        "Ifugao": ["Aguinaldo", "Alfonso Lista", "Asipulo", "Banaue", "Hingyon", "Hungduan", "Kiangan", "Lagawe", "Lamut", "Mayoyao", "Tinoc"],
        "Kalinga": ["Balbalan", "Tabuk City", "Lubuagan", "Pasil", "Pinukpuk", "Rizal", "Tanudan", "Tinglayan"],
        "Mountain Province": ["Barlig", "Bauko", "Besao", "Bontoc", "Natonin", "Paracelis", "Sabangan", "Sadanga", "Sagada", "Tadian"],
        "Apayao": ["Calanasan", "Conner", "Flora", "Kabugao", "Luna", "Pudtol", "Santa Marcela"]
    },
    "Ilocos Region (Region I)": {
        "Ilocos Norte": ["Adams", "Bacarra", "Badoc", "Bangui", "Banna (Espiritu)", "Burgos", "Carasi", "Batac City", "Laoag City", "Currimao", "Dingras", "Dumalneg", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
        "Ilocos Sur": ["Alilem", "Banayoyo", "Bantay", "Burgos", "Cabugao", "Caoayan", "Cervantes", "Candon City", "Vigan City", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin"],
        "La Union": ["Agoo", "Aringay", "Bacnotan", "Bagulin", "Balaoan", "Bangar", "Bauang", "Burgos", "Caba", "San Fernando City", "Luna", "Naguilian", "Pugo", "Rosario", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
        "Pangasinan": ["Agno", "Aguilar", "Alcala", "Anda", "Asingan", "Balungao", "Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Alaminos City", "Dagupan City", "San Carlos City", "Urdaneta City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urbiztondo", "Villasis"]
    },
    "Cagayan Valley (Region II)": {
        "Batanes": ["Basco", "Itbayat", "Ivana", "Mahatao", "Sabtang", "Uyugan"],
        "Cagayan": ["Abulug", "Alcala", "Allacapan", "Amulung", "Aparri", "Baggao", "Ballesteros", "Buguey", "Calayan", "Camalaniugan", "Claveria", "Enrile", "Gattaran", "Gonzaga", "Iguig", "Lal-lo", "Lasam", "Pamplona", "Peñablanca", "Piat", "Rizal", "Sanchez-Mira", "Santa Ana", "Santa Praxedes", "Santa Teresita", "Santo Niño (Faire)", "Solana", "Tuao", "Tuguegarao City"],
        "Isabela": ["Alicia", "Angadanan", "Aurora", "Benito Soliven", "Burgos", "Cabagan", "Cabatuan", "Cauayan City", "Ilagan City", "Santiago City", "Cordon", "Delfin Albano", "Dinapigue", "Divilacan", "Echague", "Gamu", "Jones", "Luna", "Maconacon", "Mallig", "Naguilian", "Palanan", "Quezon", "Quirino", "Ramon", "Reina Mercedes", "Roxas", "San Agustin", "San Guillermo", "San Isidro", "San Manuel", "San Mariano", "San Mateo", "San Pablo", "Santa Maria", "Santo Tomas", "Tumauini"],
        "Nueva Vizcaya": ["Alfonso Castañeda", "Ambaguio", "Aritao", "Bagabag", "Bambang", "Bayombong", "Diadi", "Dupax Norte", "Dupax Sur", "Kasibu", "Kayapa", "Quezon", "Santa Fe", "Solano", "Villaverde"],
        "Quirino": ["Aglipay", "Cabarroguis", "Diffun", "Maddela", "Nagtipunan", "Saguday"]
    },
    "Central Luzon (Region III)": {
        "Aurora": ["Baler", "Casiguran", "Dilasag", "Dinalungan", "Dingalan", "Dipaculao", "Maria Aurora", "San Luis"],
        "Bataan": ["Abucay", "Bagac", "Balanga City", "Dinalupihan", "Hermosa", "Limay", "Mariveles", "Morong", "Orani", "Orion", "Pilar", "Samal"],
        "Bulacan": ["Angat", "Balagtas", "Baliuag", "Bocaue", "Bulacan", "Bustos", "Calumpit", "Malolos City", "Meycauayan City", "San Jose del Monte City", "Doña Remedios Trinidad", "Guiguinto", "Hagonoy", "Marilao", "Norzagaray", "Obando", "Pandi", "Paombong", "Plaridel", "Pulilan", "San Ildefonso", "San Miguel", "San Rafael", "Santa Maria"],
        "Nueva Ecija": ["Aliaga", "Bongabon", "Cabiao", "Carranglan", "Cabanatuan City", "Gapan City", "Palayan City", "Cuyapo", "Gabaldon", "General Mamerto Natividad", "General Tinio", "Guimba", "Jaen", "Laur", "Licab", "Llanera", "Lupao", "Nampicuan", "Pantabangan", "Peñaranda", "Quezon", "Rizal", "San Antonio", "San Isidro", "San Jose City", "San Leonardo", "Santa Rosa", "Santo Domingo", "Science City of Muñoz", "Talavera", "Talugtug", "Zaragoza"],
        "Pampanga": ["Apalit", "Arayat", "Bacolor", "Candaba", "Angeles City", "San Fernando City", "Floridablanca", "Guagua", "Lubao", "Mabalacat City", "Macabebe", "Magalang", "Masantol", "Mexico", "Minalin", "Porac", "San Luis", "San Simon", "Santa Ana", "Santa Rita", "Santo Tomas", "Sasmuan"],
        "Tarlac": ["Anao", "Bamban", "Camiling", "Capas", "Tarlac City", "Concepcion", "Gerona", "La Paz", "Mayantoc", "Moncada", "Paniqui", "Pura", "Ramos", "San Clemente", "San Jose", "San Manuel", "Santa Ignacia", "Victoria"],
        "Zambales": ["Botolan", "Cabangan", "Candelaria", "Castillejos", "Olongapo City", "Iba", "Masinloc", "Palauig", "San Antonio", "San Felipe", "San Marcelino", "San Narciso", "Santa Cruz", "Subic"]
    },
    "CALABARZON (Region IV-A)": {
        "Batangas": ["Agoncillo", "Alitagtag", "Balayan", "Balete", "Batangas City", "Bauan", "Calaca", "Calatagan", "Lipa City", "Tanauan City", "Cuenca", "Ibaan", "Laurel", "Lemery", "Lian", "Lobo", "Mabini", "Malvar", "Mataasnakahoy", "Nasugbu", "Padre Garcia", "Rosario", "San Jose", "San Juan", "San Luis", "San Nicolas", "San Pascual", "Santa Teresita", "Santo Tomas", "Taal", "Talisay", "Taysan", "Tingloy", "Tuy"],
        "Cavite": ["Alfonso", "Amadeo", "Carmona", "Bacoor City", "Cavite City", "Dasmariñas City", "General Trias City", "Imus City", "Tagaytay City", "Trece Martires City", "General Mariano Alvarez", "General Emilio Aguinaldo", "Indang", "Kawit", "Magallanes", "Maragondon", "Mendez", "Naic", "Noveleta", "Rosario", "Silang", "Tanza", "Ternate"],
        "Laguna": ["Alaminos", "Bay", "Calauan", "Cavinti", "Biñan City", "Cabuyao City", "Calamba City", "San Pablo City", "San Pedro City", "Santa Rosa City", "Famy", "Kalayaan", "Liliw", "Los Baños", "Luisiana", "Lumban", "Mabitac", "Magdalena", "Majayjay", "Nagcarlan", "Paete", "Pagsanjan", "Pakil", "Pangil", "Pila", "Rizal", "Santa Cruz", "Santa Maria", "Siniloan", "Victoria"],
        "Quezon": ["Agdangan", "Alabat", "Atimonan", "Buenavista", "Burdeos", "Calauag", "Candelaria", "Catanauan", "Lucena City", "Tayabas City", "Dolores", "General Luna", "General Nakar", "Guinayangan", "Gumaca", "Infanta", "Jomalig", "Lopez", "Lucban", "Macalelon", "Mauban", "Mulanay", "Padre Burgos", "Pagbilao", "Panukulan", "Patnanungan", "Perez", "Pitogo", "Plaridel", "Polillo", "Quezon", "Real", "Sampaloc", "San Andres", "San Antonio", "San Francisco (Aurora)", "San Narciso", "Sariaya", "Tagkawayan", "Tiaong", "Unisan"],
        "Rizal": ["Angono", "Baras", "Binangonan", "Cainta", "Cardona", "Antipolo City", "Jala-Jala", "Morong", "Pililla", "Rodriguez", "San Mateo", "Tanay", "Taytay", "Teresa"]
    },
    "MIMAROPA Region (Region IV-B)": {
        "Marinduque": ["Boac", "Buenavista", "Gasan", "Mogpog", "Santa Cruz", "Torrijos"],
        "Occidental Mindoro": ["Abra de Ilog", "Calintaan", "Looc", "Lubang", "Magsaysay", "Mamburao", "Paluan", "Rizal", "Sablayan", "San Jose", "Santa Cruz"],
        "Oriental Mindoro": ["Baco", "Bansud", "Bongabong", "Bulalacao", "Calapan City", "Gloria", "Mansalay", "Naujan", "Pinamalayan", "Pola", "Puerto Galera", "Roxas", "San Teodoro", "Socorro", "Victoria"],
        "Palawan": ["Aborlan", "Agutaya", "Araceli", "Balabac", "Bataraza", "Brooke's Point", "Busuanga", "Cagayancillo", "Puerto Princesa City", "Coron", "Culion", "Cuyo", "Dumaran", "El Nido", "Kalayaan", "Linapacan", "Magsaysay", "Narra", "Quezon", "Rizal", "Roxas", "San Vicente", "Sofronio Española", "Taytay"],
        "Romblon": ["Alcantara", "Banton", "Cajidiocan", "Calatrava", "Concepcion", "Corcuera", "Ferrol", "Looc", "Magdiwang", "Odiongan", "Romblon", "San Agustin", "San Andres", "San Fernando", "San Jose", "Santa Fe", "Santa Maria"]
    },
    "Bicol Region (Region V)": {
        "Albay": ["Bacacay", "Camalig", "Legazpi City", "Ligao City", "Tabaco City", "Daraga", "Guinobatan", "Jovellar", "Libon", "Malilipot", "Malinao", "Manito", "Oas", "Pio Duran", "Polangui", "Rapu-Rapu", "Santo Domingo", "Tiwi"],
        "Camarines Norte": ["Basud", "Capalonga", "Daet", "Jose Panganiban", "Labo", "Mercedes", "Paracale", "San Lorenzo Ruiz", "San Vicente", "Santa Elena", "Talisay", "Vinzons"],
        "Camarines Sur": ["Baao", "Balatan", "Bato", "Bombon", "Buhi", "Bula", "Cabusao", "Calabanga", "Camaligan", "Canaman", "Caramoan", "Iriga City", "Naga City", "Del Gallego", "Gainza", "Garchitorena", "Goa", "Lagonoy", "Libmanan", "Lupi", "Magarao", "Milaor", "Minalabac", "Nabua", "Ocampo", "Pamplona", "Pasacao", "Pili", "Presentacion", "Ragay", "Sagñay", "San Fernando", "San Jose", "Sipocot", "Siruma", "Tigaon", "Tinambac"],
        "Catanduanes": ["Bagamanoc", "Baras", "Bato", "Caramoran", "Gigmoto", "Pandan", "Panganiban", "San Andres", "San Miguel", "Viga", "Virac"],
        "Masbate": ["Aroroy", "Baleno", "Balud", "Batuan", "Cataingan", "Cawayan", "Masbate City", "Claveria", "Dimasalang", "Esperanza", "Mandaon", "Milagros", "Mobo", "Monreal", "Palanas", "Pio V. Corpuz", "Placer", "San Fernando", "San Jacinto", "San Pascual", "Uson"],
        "Sorsogon": ["Barcelona", "Bulan", "Bulusan", "Casiguran", "Castilla", "Sorsogon City", "Donsol", "Gubat", "Irosin", "Juban", "Magallanes", "Matnog", "Pilar", "Prieto Diaz", "Santa Magdalena"]
    },
    "Western Visayas (Region VI)": {
        "Aklan": ["Altavas", "Balete", "Banga", "Batan", "Buruanga", "Ibajay", "Kalibo", "Lezo", "Libacao", "Madalag", "Makato", "Malay", "Malinao", "Nabas", "New Washington", "Numancia", "Tangalan"],
        "Antique": ["Anini-y", "Barbaza", "Belison", "Bugasong", "Caluya", "Culasi", "Hamtic", "Laua-an", "Libertad", "Pandan", "Patnongon", "San Jose", "San Remigio", "Sebaste", "Sibalom", "Tibiao", "Tobias Fornier", "Valderrama Capiz"],
        "Capiz": ["Roxas City", "Cuartero", "Dao", "Dumalag", "Dumarao", "Ivisan", "Jamindan", "Ma-Ayon", "Mambusao", "Panay", "Panitan", "Pilar", "Pontevedra", "President Roxas", "Sapi-An", "Sigma", "Tapaz"],
        "Iloilo": ["Ajuy", "Alimodian", "Anilao", "Badiangan", "Balasan", "Banate", "Barotac Nuevo", "Barotac Viejo", "Batad", "Bingawan", "Cabatuan", "Calinog", "Carles", "Iloilo City", "Passi City", "Concepcion", "Dingle", "Dueñas", "Dumangas", "Estancia", "Guimbal", "Igbaras", "Janiuay", "Lambunao", "Leganes", "Lemery", "Leon", "Maasin", "Miagao", "Mina", "New Lucena", "Oton", "Pavia", "Pototan", "San Dionisio", "San Enrique", "San Joaquin", "San Miguel", "San Rafael", "Santa Barbara", "Sara", "Tigbauan", "Tubungan", "Zarraga"],
        "Guimaras": ["Buenavista", "Jordan", "Nueva Valencia", "San Lorenzo", "Sibunag"]
    },
    "Negros Island Region (NIR)": {
        "Negros Occidental": ["Binalbagan", "Calatrava", "Candoni", "Cauayan", "Bacolod City", "Bago City", "Cadiz City", "Escalante City", "Himamaylan City", "Kabankalan City", "La Carlota City", "Sagay City", "San Carlos City", "Silay City", "Sipalay City", "Talisay City", "Victorias City", "Enrique B. Magalona", "Hinigaran", "Hinoba-an", "Ilog", "Isabela", "La Castellana", "Manapla", "Moises Padilla", "Murcia", "Pontevedra", "Pulupandan", "Salvador Benedicto", "San Enrique", "Toboso", "Valladolid"],
        "Negros Oriental": ["Amlan", "Ayungon", "Bacong", "Basay", "Bindoy", "Bais City", "Bayawan City", "Canlaon City", "Dumaguete City", "Guihulngan City", "Tanjay City", "Dauin", "Jimalalud", "La Libertad", "Mabinay", "Manjuyod", "Pamplona", "San Jose", "Santa Catalina", "Siaton", "Sibulan", "Tayasan", "Valencia", "Vallehermoso", "Zamboanguita"],
        "Siquijor": ["Enrique Villanueva", "Larena", "Lazi", "Maria", "San Juan", "Siquijor"]
    },
    "Central Visayas (Region VII)": {
        "Bohol": ["Alburquerque", "Alicia", "Anda", "Antequera", "Baclayon", "Balilihan", "Batuan", "Bien Unido", "Bilar", "Buenavista", "Calape", "Candijay", "Carmen", "Catigbian", "Tagbilaran City", "Clarin", "Corella", "Cortes", "Dagohoy", "Danao", "Dauis", "Dimiao", "Duero", "Garcia Hernandez", "Getafe", "Guindulman", "Inabanga", "Jagna", "Lila", "Loay", "Loboc", "Loon", "Mabini", "Maribojoc", "Panglao", "Pilar", "Pres. Carlos P. Garcia", "Sagbayan", "San Isidro", "San Miguel", "Sevilla", "Sierra Bullones", "Sikatuna", "Talibon", "Trinidad", "Tubigon", "Ubay", "Valencia"],
        "Cebu": ["Alcantara", "Alcoy", "Alegria", "Aloguinsan", "Argao", "Asturias", "Badian", "Balamban", "Bantayan", "Barili", "Boljoon", "Borbon", "Carmen", "Catmon", "Bogo City", "Carcar City", "Cebu City", "Lapu-Lapu City", "Mandaue City", "Naga City", "Talisay City", "Toledo City", "Compostela", "Consolacion", "Cordova", "Daanbantayan", "Dalaguete", "Danao City", "Dumanjug", "Ginatilan", "Liloan", "Madridejos", "Malabuyoc", "Medellin", "Minglanilla", "Moalboal", "Oslob", "Pilar", "Pinamungahan", "Poro", "Ronda", "Samboan", "San Fernando", "San Francisco", "San Remigio", "Santa Fe", "Santander", "Sibonga", "Sogod", "Tabogon", "Tabuelan", "Tuburan", "Tudela"]
    },
    "Eastern Visayas (Region VIII)": {
        "Eastern Samar": ["Arteche", "Balangiga", "Balangkayan", "Borongan City", "Can-avid", "Dolores", "General MacArthur", "Giporlos", "Guiuan", "Hernani", "Jipapad", "Lawaan", "Maslog", "Llorente", "Maydolong", "Mercedes", "Oras", "Quinapondan", "Salcedo", "San Julian", "San Policarpo", "Sulat", "Taft"],
        "Leyte": ["Abuyog", "Alangalang", "Albuera", "Babatngon", "Barugo", "Bato", "Burauen", "Calubian", "Capoocan", "Carigara", "Baybay City", "Tacloban City", "Dagami", "Dulag", "Hilongos", "Hindang", "Inopacan", "Isabel", "Jaro", "Javier", "Julita", "Kananga", "La Paz", "Leyte", "MacArthur", "Mahaplag", "Matag-ob", "Matalom", "Mayorga", "Merida", "Ormoc City", "Palo", "Palompon", "Pastrana", "San Isidro", "San Miguel", "Santa Fe", "Tabango", "Tabontabon", "Tanauan", "Tolosa", "Tunga", "Villaba"],
        "Northern Samar": ["Allen", "Biri", "Bobon", "Capul", "Catarman", "Catubig", "Gamay", "Laoang", "Lapinig", "Las Navas", "Lavezares", "Lope de Vega", "Mapanas", "Mondragon", "Palapag", "Pambujan", "Rosario", "San Antonio", "San Isidro", "San Jose", "San Roque", "San Vicente", "Silvino Lobos", "Victoria"],
        "Samar": ["Almagro", "Basey", "Calbiga", "Calbayog City", "Catbalogan City", "Daram", "Gandara", "Hinabangan", "Jiabong", "Marabut", "Matuguinao", "Motiong", "Pagsanghan", "Paranas", "Pinabacdao", "San Jorge", "San Jose de Buan", "San Sebastian", "Santa Margarita", "Santa Rita", "Santo Niño", "Tagapul-an", "Talalora", "Tarangnan", "Villareal", "Zumarraga"],
        "Southern Leyte": ["Anahawan", "Bontoc", "Maasin City", "Hinunangan", "Hinundayan", "Libagon", "Liloan", "Limasawa", "Macrohon", "Malitbog", "Padre Burgos", "Pintuyan", "Saint Bernard", "San Francisco", "San Juan", "San Ricardo", "Silago", "Sogod", "Tomas Oppus"],
        "Biliran": ["Almeria", "Biliran", "Cabucgayan", "Caibiran", "Culaba", "Kawayan", "Maripipi", "Naval"]
    },
    "Zamboanga Peninsula (Region IX)": {
        "Sulu": ["Hadji Panglima Tahil", "Indanan", "Jolo", "Kalingalan Caluang", "Lugus", "Luuk", "Maimbung", "Old Panamao", "Omar", "Pandami", "Panglima Estino", "Pangutaran", "Parang", "Pata", "Patikul", "Siasi", "Talipao", "Tapul", "Tongkil"],
        "Zamboanga del Norte": ["Bacungan (Leon T. Postigo)", "Baliguian", "Dapitan City", "Dipolog City", "Godod", "Gutalac", "Jose Dalman", "Kalawit", "Katipunan", "La Libertad", "Labason", "Liloy", "Manukan", "Mutia", "Piñan", "Polanco", "Pres. Manuel A. Roxas", "Rizal", "Salug", "Sergio Osmeña Sr.", "Siayan", "Sibuco", "Sibutad", "Sindangan", "Siocon", "Sirawai", "Tampilisan"],
        "Zamboanga del Sur": ["Aurora", "Bayog", "Pagadian City", "Zamboanga City", "Dimataling", "Dinas", "Dumalinao", "Dumingag", "Guipos", "Josefina", "Kumalarang", "Labangan", "Lakewood", "Lapuyan", "Mahayag", "Margosatubig", "Midsalip", "Molave", "Pitogo", "Ramon Magsaysay", "San Miguel", "San Pablo", "Sominot", "Tabina", "Tambulig", "Tigbao", "Tukuran", "Vincenzo A. Sagun"],
        "Zamboanga Sibugay": ["Alicia", "Buug", "Diplahan", "Imelda", "Ipil", "Kabasalan", "Mabuhay", "Malangas", "Naga", "Olutanga", "Payao", "Roseller Lim", "Siay", "Talusan", "Titay", "Tungawan"],
        "Basilan": ["Isabela City"]
    },
    "Northern Mindanao (Region X)": {
        "Bukidnon": ["Baungon", "Cabanglasan", "Malaybalay City", "Valencia City", "Damulog", "Dangcagan", "Don Carlos", "Impasug-ong", "Kadingilan", "Kalilangan", "Kibawe", "Kitaotao", "Lantapan", "Libona", "Malitbog", "Manolo Fortich", "Maramag", "Pangantucan", "Quezon", "San Fernando", "Sumilao", "Talakag"],
        "Camiguin": ["Catarman", "Guinsiliban", "Mahinog", "Mambajao", "Sagay"],
        "Lanao del Norte": ["Bacolod", "Baloi", "Baroy", "Iligan City", "Kapatagan", "Kauswagan", "Kolambugan", "Lala", "Linamon", "Magsaysay", "Maigo", "Matungao", "Munai", "Nunungan", "Pantao Ragat", "Pantar", "Poona Piagapo", "Salvador", "Sapad", "Sultan Naga Dimaporo", "Tagoloan", "Tangcal", "Tubod"],
        "Misamis Occidental": ["Aloran", "Baliangao", "Bonifacio", "Calamba", "Oroquieta City", "Ozamiz City", "Tangub City", "Clarin", "Concepcion", "Don Victoriano", "Jimenez", "Lopez Jaena", "Panaon", "Plaridel", "Sapang Dalaga", "Sinacaban", "Tudela"],
        "Misamis Oriental": ["Alubijid", "Balingasag", "Balingoan", "Binuangan", "Cagayan de Oro City", "El Salvador City", "Gingoog City", "Claveria", "Gitagum", "Initao", "Jasaan", "Kinoguitan", "Lagonglong", "Laguindingan", "Libertad", "Lugait", "Magsaysay", "Manticao", "Medina", "Naawan", "Opol", "Salay", "Sugbongcogon", "Tagoloan", "Talisayan", "Villanueva"]
    },
    "Davao Region (Region XI)": {
        "Davao del Norte": ["Asuncion", "Braulio E. Dujali", "Carmen", "Panabo City", "Tagum City", "Island Garden City of Samal", "Kapalong", "New Corella", "Sawata", "Santo Tomas", "Talaingod"],
        "Davao del Sur": ["Bansalan", "Davao City", "Digos City", "Hagonoy", "Kiblawan", "Magsaysay", "Malalag", "Matanao", "Padada", "Santa Cruz", "Sulop"],
        "Davao Oriental": ["Baganga", "Banaybanay", "Boston", "Caraga", "Cateel", "Mati City", "Governor Generoso", "Lupon", "Manay", "San Isidro", "Tarragona"],
        "Davao de Oro": ["Compostela", "Laak", "Mabini", "Maco", "Maragusan", "Mawab", "Monkayo", "Montevista", "Nabunturan", "New Bataan", "Pantukan"],
        "Davao Occidental": ["Don Marcelino", "Jose Abad Santos", "Malita", "Santa Maria", "Sarangani"]
    },
    "SOCCSKSARGEN (Region XII)": {
        "Cotabato": ["Alamada", "Aleosan", "Antipas", "Arakan", "Banisilan", "Carmen", "Kidapawan City", "Kabacan", "Libungan", "Mlang", "Magpet", "Makilala", "Matalam", "Midsayap", "Pigcawayan", "Pikit", "President Roxas", "Tulunan"],
        "South Cotabato": ["Banga", "General Santos City", "Koronadal City", "Lake Sebu", "Norala", "Polomolok", "Santo Niño", "Surallah", "Tboli", "Tampakan", "Tantangan", "Tupi"],
        "Sultan Kudarat": ["Bagumbayan", "Tacurong City", "Columbio", "Esperanza", "Isulan", "Kalamansig", "Lambayong", "Lebak", "Lutayan", "Palimbang", "President Quirino", "Senator Ninoy Aquino"],
        "Sarangani": ["Alabel", "Glan", "Kiamba", "Maasim", "Maitum", "Malapatan", "Malungon"]
    },
    "Caraga (Region XIII)": {
        "Agusan del Norte": ["Buenavista", "Carmen", "Butuan City", "Cabadbaran City", "Jabonga", "Kitcharao", "Las Nieves", "Magallanes", "Nasipit", "Remedios T. Romualdez", "Santiago", "Tubay"],
        "Agusan del Sur": ["Bunawan", "Bayugan City", "Esperanza", "La Paz", "Loreto", "Prosperidad", "Rosario", "San Francisco", "San Luis", "Santa Josefa", "Sibagat", "Talacogon", "Trento", "Veruela"],
        "Surigao del Norte": ["Alegria", "Bacuag", "Burgos", "Surigao City", "Claver", "Dapa", "Del Carmen", "General Luna", "Gigaquit", "Mainit", "Malimono", "Pilar", "Placer", "San Benito", "San Francisco (Anao-aon)", "San Isidro", "San Jose", "Santa Monica", "Sison", "Socorro", "Tagana-an", "Tubod"],
        "Surigao del Sur": ["Barobo", "Bayabas", "Cagwait", "Cantilan", "Carmen", "Carrascal", "Bislig City", "Tandag City", "Cortes", "Hinatuan", "Lanuza", "Lianga", "Lingig", "Madrid", "Marihatag", "San Agustin", "San Miguel", "Tagbina", "Tago"],
        "Dinagat Islands": ["Basilisa", "Cagdianao", "Dinagat", "Libjo", "Loreto", "San Jose", "Tubajon"]
    },
    "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)": {
        "Basilan": ["Akbar", "Al-Barka", "Lamitan City", "Hadji Mohammad Ajul", "Hadji Muhtamad", "Isabela", "Lantawan", "Maluso", "Sumisip", "Tabuan-Lasa", "Tipo-Tipo", "Tuburan", "Ungkaya Pukan"],
        "Lanao del Sur": ["Amai Manabilang", "Bacolod-Kalawi", "Balabagan", "Balindong", "Bayang", "Binidayan", "Buadiposo-Buntong", "Bubong", "Butig", "Calanogas", "Marawi City", "Ditsaan-Ramain", "Ganassi", "Kapai", "Kapatagan", "Lumba-Bayabao", "Lumbaca-Unayan", "Lumbatan", "Lumbayanague", "Madalum", "Madamba", "Maguing", "Malabang", "Marantao", "Marogong", "Masiu", "Mulondo", "Pagayawan", "Piagapo", "Picong", "Poona Bayabao", "Pualas", "Saguiaran", "Sultan Dumalondong", "Tagoloan II", "Tamparan", "Taraka", "Tubaran", "Tugaya", "Wao"],
        "Maguindanao del Norte": ["Barira", "Buldon", "Datu Blah T. Sinsuat", "Datu Odin Sinsuat", "Kabuntalan", "Matanog", "Northern Kabuntalan", "Parang", "Sultan Kudarat (Nuling)", "Sultan Mastura", "Talitay", "Upi Maguindanao del Sur"],
        "Maguindanao del Sur": ["Ampatuan", "Buluan", "Datu Abdullah Sangki", "Datu Anggal Midtimbang", "Datu Hoffer Ampatuan", "Datu Paglas", "Datu Piang", "Datu Salibo", "Datu Saudi-Ampatuan", "Datu Unsay", "General S. K. Pendatun", "Guindulungan", "Mamasapano", "Mangudadatu", "Pagagawan", "Pagalungan", "Paglat", "Pandag", "Rajah Buayan", "Shariff Aguak", "Shariff Saydona Mustapha", "South Upi", "Sultan sa Barongis", "Talayan"],
        "Tawi-Tawi": ["Bongao", "Languyan", "Mapun", "Panglima Sugala", "Sapa-Sapa", "Sibutu", "Simunul", "Sitangkai", "South Ubian", "Tandubas", "Turtle Islands"]
    }
};

let cart = [];
let activeCategory = 'all';
let currentModalProductId = null;
let activeChatEmail = null;
let currentFarmerViewMode = 'buy'; // 'buy' or 'sell'

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    initAddressDropdowns();
    checkSession();
});

// INITIALIZE LOCAL STORAGE WITH PRE-POPULATED SAMPLE DATA
function initStorage() {
    if (!localStorage.getItem(USERS_KEY)) {
        const initialUsers = [
            // 1 Transportation Company
            {
                name: "Express Crop Transport",
                email: "transpo@test.com",
                password: "123",
                role: "transpo_company",
                phone: "09171112222",
                region: "CALABARZON (Region IV-A)",
                province: "Batangas",
                city: "Lipa City",
                street: "Logistics Hub 1",
                address: "Lipa City, Batangas, CALABARZON (Region IV-A)",
                desc: "Regional agricultural cold-chain and courier logistics provider."
            },

            // 5 Farmers in 5 Distinct Provinces
            {
                name: "Maria Farmer",
                email: "farmer1@test.com",
                password: "123",
                role: "farmer",
                phone: "09171234561",
                farmName: "Batangas Organic Farms",
                region: "CALABARZON (Region IV-A)",
                province: "Batangas",
                city: "Lipa City",
                street: "Barangay Marawoy",
                address: "Barangay Marawoy, Lipa City, Batangas, CALABARZON (Region IV-A)",
                desc: "Organic vegetable farm in volcanic Batangas soil specializing in root crops."
            },
            {
                name: "Juan Farmer",
                email: "farmer2@test.com",
                password: "123",
                role: "farmer",
                phone: "09171234562",
                farmName: "Highland Greens Cavite",
                region: "CALABARZON (Region IV-A)",
                province: "Cavite",
                city: "Dasmariñas City",
                street: "Pala-Pala Road",
                address: "Pala-Pala Road, Dasmariñas City, Cavite, CALABARZON (Region IV-A)",
                desc: "Highland leafy greens, lettuce, and cool-climate vegetables."
            },
            {
                name: "Pedro Farmer",
                email: "farmer3@test.com",
                password: "123",
                role: "farmer",
                phone: "09171234563",
                farmName: "Laguna Fresh Produce",
                region: "CALABARZON (Region IV-A)",
                province: "Laguna",
                city: "Santa Rosa City",
                street: "Greenfields Estate",
                address: "Greenfields Estate, Santa Rosa City, Laguna, CALABARZON (Region IV-A)",
                desc: "Hydroponic sweet corn, berries, and greenhouse crops."
            },
            {
                name: "Mateo Farmer",
                email: "farmer4@test.com",
                password: "123",
                role: "farmer",
                phone: "09171234564",
                farmName: "Pangasinan Crop Masters",
                region: "Ilocos Region (Region I)",
                province: "Pangasinan",
                city: "Dagupan City",
                street: "Lucao District",
                address: "Lucao District, Dagupan City, Pangasinan, Ilocos Region (Region I)",
                desc: "Aromatic native garlic, red onions, and lowland vegetables."
            },
            {
                name: "Rosa Farmer",
                email: "farmer5@test.com",
                password: "123",
                role: "farmer",
                phone: "09171234565",
                farmName: "Davao Fruit Orchards",
                region: "Davao Region (Region XI)",
                province: "Davao del Sur",
                city: "Davao City",
                street: "Calinan District",
                address: "Calinan District, Davao City, Davao del Sur, Davao Region (Region XI)",
                desc: "Premium bananas, durian, and export-quality tropical fruits."
            },

            // 5 Buyers in 5 Distinct Provinces
            {
                name: "Ana Santos",
                email: "buyer1@test.com",
                password: "123",
                role: "consumer",
                phone: "09189876541",
                region: "CALABARZON (Region IV-A)",
                province: "Batangas",
                city: "Lipa City",
                street: "123 Sabang Street",
                address: "123 Sabang Street, Lipa City, Batangas, CALABARZON (Region IV-A)",
                desc: "Fresh produce buyer in Batangas."
            },
            {
                name: "Carlos Cruz",
                email: "buyer2@test.com",
                password: "123",
                role: "consumer",
                phone: "09189876542",
                region: "CALABARZON (Region IV-A)",
                province: "Cavite",
                city: "Dasmariñas City",
                street: "45 Salawag Ave",
                address: "45 Salawag Ave, Dasmariñas City, Cavite, CALABARZON (Region IV-A)",
                desc: "Home cook and restaurant manager."
            },
            {
                name: "Elena Reyes",
                email: "buyer3@test.com",
                password: "123",
                role: "consumer",
                phone: "09189876543",
                region: "CALABARZON (Region IV-A)",
                province: "Laguna",
                city: "Santa Rosa City",
                street: "88 Nuvali Blvd",
                address: "88 Nuvali Blvd, Santa Rosa City, Laguna, CALABARZON (Region IV-A)",
                desc: "Organic food advocate."
            },
            {
                name: "Fernando Poe",
                email: "buyer4@test.com",
                password: "123",
                role: "consumer",
                phone: "09189876544",
                region: "Ilocos Region (Region I)",
                province: "Pangasinan",
                city: "Dagupan City",
                street: "12 Arellano Street",
                address: "12 Arellano Street, Dagupan City, Pangasinan, Ilocos Region (Region I)",
                desc: "Wholesale food distributor."
            },
            {
                name: "Grace Tan",
                email: "buyer5@test.com",
                password: "123",
                role: "consumer",
                phone: "09189876545",
                region: "Davao Region (Region XI)",
                province: "Davao del Sur",
                city: "Davao City",
                street: "77 Bajada Road",
                address: "77 Bajada Road, Davao City, Davao del Sur, Davao Region (Region XI)",
                desc: "Fresh fruit and smoothie bar owner."
            },

            // 10 Riders (2 Riders per Province across the 5 Provinces)
            {
                name: "Ricardo Dalisay",
                email: "rider1@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110001",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "CALABARZON (Region IV-A)",
                province: "Batangas",
                city: "Lipa City",
                street: "Rider Station 1",
                address: "Lipa City, Batangas, CALABARZON (Region IV-A)"
            },
            {
                name: "Benigno Ramos",
                email: "rider2@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110002",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "CALABARZON (Region IV-A)",
                province: "Batangas",
                city: "Lipa City",
                street: "Rider Station 2",
                address: "Lipa City, Batangas, CALABARZON (Region IV-A)"
            },
            {
                name: "Crisanto Cruz",
                email: "rider3@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110003",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "CALABARZON (Region IV-A)",
                province: "Cavite",
                city: "Dasmariñas City",
                street: "Rider Station 3",
                address: "Dasmariñas City, Cavite, CALABARZON (Region IV-A)"
            },
            {
                name: "Danilo Santos",
                email: "rider4@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110004",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "CALABARZON (Region IV-A)",
                province: "Cavite",
                city: "Dasmariñas City",
                street: "Rider Station 4",
                address: "Dasmariñas City, Cavite, CALABARZON (Region IV-A)"
            },
            {
                name: "Eduardo Lim",
                email: "rider5@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110005",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "CALABARZON (Region IV-A)",
                province: "Laguna",
                city: "Santa Rosa City",
                street: "Rider Station 5",
                address: "Santa Rosa City, Laguna, CALABARZON (Region IV-A)"
            },
            {
                name: "Francisco Gomez",
                email: "rider6@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110006",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "CALABARZON (Region IV-A)",
                province: "Laguna",
                city: "Santa Rosa City",
                street: "Rider Station 6",
                address: "Santa Rosa City, Laguna, CALABARZON (Region IV-A)"
            },
            {
                name: "Gabriel Mercado",
                email: "rider7@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110007",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "Ilocos Region (Region I)",
                province: "Pangasinan",
                city: "Dagupan City",
                street: "Rider Station 7",
                address: "Dagupan City, Pangasinan, Ilocos Region (Region I)"
            },
            {
                name: "Hector Navarro",
                email: "rider8@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110008",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "Ilocos Region (Region I)",
                province: "Pangasinan",
                city: "Dagupan City",
                street: "Rider Station 8",
                address: "Dagupan City, Pangasinan, Ilocos Region (Region I)"
            },
            {
                name: "Ignacio Reyes",
                email: "rider9@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110009",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "Davao Region (Region XI)",
                province: "Davao del Sur",
                city: "Davao City",
                street: "Rider Station 9",
                address: "Davao City, Davao del Sur, Davao Region (Region XI)"
            },
            {
                name: "Joaquin Aquino",
                email: "rider10@test.com",
                password: "123",
                role: "transpo_rider",
                phone: "09191110010",
                companyName: "Express Crop Transport",
                companyEmail: "transpo@test.com",
                status: "verified",
                dutyStatus: "Online / Available",
                region: "Davao Region (Region XI)",
                province: "Davao del Sur",
                city: "Davao City",
                street: "Rider Station 10",
                address: "Davao City, Davao del Sur, Davao Region (Region XI)"
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    }

    if (!localStorage.getItem(PRODUCTS_KEY)) {
        const initialProducts = [
            {
                id: 1,
                farmerEmail: "farmer1@test.com",
                farmName: "Batangas Organic Farms",
                farmRegion: "CALABARZON (Region IV-A)",
                farmProvince: "Batangas",
                farmCity: "Lipa City",
                farm: "Batangas Organic Farms (Lipa City, Batangas)",
                title: "Organic Red Onions (50kg Bag)",
                category: "Vegetables",
                price: 920,
                unit: "sack",
                stock: 250,
                grade: "Organic",
                image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=400",
                desc: "Hand-sorted organic red onions grown in volcanic Batangas soil. Long shelf life."
            },
            {
                id: 2,
                farmerEmail: "farmer2@test.com",
                farmName: "Highland Greens Cavite",
                farmRegion: "CALABARZON (Region IV-A)",
                farmProvince: "Cavite",
                farmCity: "Dasmariñas City",
                farm: "Highland Greens Cavite (Dasmariñas City, Cavite)",
                title: "Crisp Iceberg & Romaine Lettuce",
                category: "Vegetables",
                price: 120,
                unit: "kg",
                stock: 400,
                grade: "Grade A",
                image: "https://images.unsplash.com/photo-1556801712-76c8eb07e9f1?w=400",
                desc: "Hydroponically grown highland lettuce harvested fresh daily from Tagaytay ridge farms."
            },
            {
                id: 3,
                farmerEmail: "farmer3@test.com",
                farmName: "Laguna Fresh Produce",
                farmRegion: "CALABARZON (Region IV-A)",
                farmProvince: "Laguna",
                farmCity: "Santa Rosa City",
                farm: "Laguna Fresh Produce (Santa Rosa City, Laguna)",
                title: "Fresh Sweet Corn (Per Dozen)",
                category: "Grains",
                price: 150,
                unit: "bag",
                stock: 180,
                grade: "Grade B",
                image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400",
                desc: "Plump, juicy sweet yellow corn picked early morning in Laguna fields."
            },
            {
                id: 4,
                farmerEmail: "farmer4@test.com",
                farmName: "Pangasinan Crop Masters",
                farmRegion: "Ilocos Region (Region I)",
                farmProvince: "Pangasinan",
                farmCity: "Dagupan City",
                farm: "Pangasinan Crop Masters (Dagupan City, Pangasinan)",
                title: "Aromatic Native White Garlic Crate",
                category: "Vegetables",
                price: 450,
                unit: "crate",
                stock: 120,
                grade: "Grade A",
                image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=400",
                desc: "Aromatic native Pangasinan garlic with high oil content and pungent flavor."
            },
            {
                id: 5,
                farmerEmail: "farmer5@test.com",
                farmName: "Davao Fruit Orchards",
                farmRegion: "Davao Region (Region XI)",
                farmProvince: "Davao del Sur",
                farmCity: "Davao City",
                farm: "Davao Fruit Orchards (Davao City, Davao del Sur)",
                title: "Export Quality Cavendish Bananas",
                category: "Fruits",
                price: 85,
                unit: "kg",
                stock: 1500,
                grade: "Grade A",
                image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
                desc: "Sweet, nutrient-dense Cavendish bananas harvested directly from Mindanao orchards."
            }
        ];
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
    }

    if (!localStorage.getItem(REVIEWS_KEY)) {
        localStorage.setItem(REVIEWS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(ORDERS_KEY)) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(MESSAGES_KEY)) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(QA_KEY)) {
        localStorage.setItem(QA_KEY, JSON.stringify([]));
    }
}

// ADDRESS DROPDOWN INITIALIZATION & HELPERS
function initAddressDropdowns() {
    const regSelects = ['reg-region', 'acc-region', 'region-filter'];
    regSelects.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = id === 'region-filter' ? '<option value="all">All Regions</option>' : '<option value="">Select Region...</option>';
        Object.keys(PH_LOCATIONS).forEach(reg => {
            const opt = document.createElement('option');
            opt.value = reg;
            opt.textContent = reg;
            el.appendChild(opt);
        });
    });
}

function onRegionChange(prefix) {
    const regVal = document.getElementById(`${prefix}-region`).value;
    const provSelect = document.getElementById(`${prefix}-province`);
    const citySelect = document.getElementById(`${prefix}-city`);

    provSelect.innerHTML = '<option value="">Select Province...</option>';
    if (citySelect) citySelect.innerHTML = '<option value="">Select City/Municipality...</option>';

    if (!regVal || !PH_LOCATIONS[regVal]) return;

    Object.keys(PH_LOCATIONS[regVal]).forEach(prov => {
        const opt = document.createElement('option');
        opt.value = prov;
        opt.textContent = prov;
        provSelect.appendChild(opt);
    });
}

function onProvinceChange(prefix) {
    const regVal = document.getElementById(`${prefix}-region`).value;
    const provVal = document.getElementById(`${prefix}-province`).value;
    const citySelect = document.getElementById(`${prefix}-city`);

    if (!citySelect) return;
    citySelect.innerHTML = '<option value="">Select City/Municipality...</option>';

    if (!regVal || !provVal || !PH_LOCATIONS[regVal] || !PH_LOCATIONS[regVal][provVal]) return;

    PH_LOCATIONS[regVal][provVal].forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
    });
}

function onMarketplaceRegionChange() {
    const regVal = document.getElementById('region-filter').value;
    const provSelect = document.getElementById('province-filter');

    provSelect.innerHTML = '<option value="all">All Provinces</option>';

    if (regVal !== 'all' && PH_LOCATIONS[regVal]) {
        Object.keys(PH_LOCATIONS[regVal]).forEach(prov => {
            const opt = document.createElement('option');
            opt.value = prov;
            opt.textContent = prov;
            provSelect.appendChild(opt);
        });
    }

    applyFilters();
}

// GRADE DESCRIPTION HINT UPDATER
function updateGradeDescriptionHint(prefix) {
    const gradeVal = document.getElementById(`${prefix}-p-grade`).value;
    const hintTextEl = document.getElementById(`${prefix}-p-grade-hint-text`);
    if (hintTextEl && CROP_GRADES[gradeVal]) {
        hintTextEl.textContent = CROP_GRADES[gradeVal].description;
    }
}

// SESSION CONTROL & ROLE MANAGEMENT
function checkSession() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const authScreen = document.getElementById('auth-screen');
    const appScreen = document.getElementById('app-screen');

    if (session) {
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');

        document.getElementById('user-display-name').innerText = session.name;
        
        let roleTitle = 'Consumer';
        if (session.role === 'farmer') roleTitle = 'Farmer';
        else if (session.role === 'transpo_company') roleTitle = 'Transpo Co.';
        else if (session.role === 'transpo_rider') roleTitle = 'Rider';

        document.getElementById('user-display-role').innerText = roleTitle;

        // Hide all portals first
        document.getElementById('consumer-portal').classList.add('hidden');
        document.getElementById('farmer-portal').classList.add('hidden');
        document.getElementById('transpo-portal').classList.add('hidden');
        document.getElementById('rider-portal').classList.add('hidden');
        document.getElementById('farmer-mode-switcher').classList.add('hidden');
        document.getElementById('rider-duty-container').classList.add('hidden');

        if (session.role === 'farmer') {
            document.getElementById('farmer-mode-switcher').classList.remove('hidden');
            document.getElementById('nav-cart-btn').classList.remove('hidden');
            document.getElementById('search-container').classList.remove('hidden');
            switchFarmerMode(currentFarmerViewMode);
        } else if (session.role === 'transpo_company') {
            document.getElementById('transpo-portal').classList.remove('hidden');
            document.getElementById('nav-cart-btn').classList.add('hidden');
            document.getElementById('search-container').classList.add('hidden');
            document.getElementById('orders-btn-label').innerText = "Hub Operations";
            renderTranspoDashboard();
        } else if (session.role === 'transpo_rider') {
            document.getElementById('rider-portal').classList.remove('hidden');
            document.getElementById('nav-cart-btn').classList.add('hidden');
            document.getElementById('search-container').classList.add('hidden');
            document.getElementById('rider-duty-container').classList.remove('hidden');
            document.getElementById('rider-duty-select').value = session.dutyStatus || "Online / Available";
            document.getElementById('orders-btn-label').innerText = "Delivery Jobs";
            renderRiderDashboard();
        } else {
            // Consumer
            document.getElementById('consumer-portal').classList.remove('hidden');
            document.getElementById('nav-cart-btn').classList.remove('hidden');
            document.getElementById('search-container').classList.remove('hidden');
            document.getElementById('orders-btn-label').innerText = "My Orders";
            renderMarketplace();
        }

        updateUnreadMessagesCount();
    } else {
        authScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
    }
}

function switchFarmerMode(mode) {
    currentFarmerViewMode = mode;
    const isBuy = mode === 'buy';
    document.getElementById('mode-buy-btn').classList.toggle('active', isBuy);
    document.getElementById('mode-sell-btn').classList.toggle('active', !isBuy);

    if (isBuy) {
        document.getElementById('consumer-portal').classList.remove('hidden');
        document.getElementById('farmer-portal').classList.add('hidden');
        document.getElementById('orders-btn-label').innerText = "My Purchases";
        renderMarketplace();
    } else {
        document.getElementById('consumer-portal').classList.add('hidden');
        document.getElementById('farmer-portal').classList.remove('hidden');
        document.getElementById('orders-btn-label').innerText = "Customer Orders";
        renderFarmerDashboard();
    }
}

function updateRiderDutyStatus(newStatus) {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session || session.role !== 'transpo_rider') return;

    session.dutyStatus = newStatus;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const idx = users.findIndex(u => u.email === session.email);
    if (idx !== -1) {
        users[idx].dutyStatus = newStatus;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    alert(`Your rider status updated to: ${newStatus}`);
}

function handleRoleChange(role) {
    const riderCompField = document.getElementById('reg-rider-company-field');
    if (role === 'transpo_rider') {
        riderCompField.classList.remove('hidden');
        populateRiderCompanyDropdown();
    } else {
        riderCompField.classList.add('hidden');
    }
}

function populateRiderCompanyDropdown() {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const compSelect = document.getElementById('reg-rider-company');
    compSelect.innerHTML = '';

    const companies = users.filter(u => u.role === 'transpo_company');
    if (companies.length === 0) {
        compSelect.innerHTML = '<option value="">No registered transport company</option>';
        return;
    }

    companies.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.email;
        opt.textContent = `${c.name} (${c.province})`;
        compSelect.appendChild(opt);
    });
}

function switchAuthMode(mode) {
    const isLogin = mode === 'login';
    document.getElementById('tab-login').classList.toggle('active', isLogin);
    document.getElementById('tab-register').classList.toggle('active', !isLogin);

    if (isLogin) {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    } else {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert("Invalid email or password!");
        return;
    }

    if (user.role === 'transpo_rider' && user.status === 'pending') {
        alert(`Your registration request with ${user.companyName} is currently pending verification.`);
        return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    checkSession();
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const role = document.getElementById('reg-role').value;

    const region = document.getElementById('reg-region').value;
    const province = document.getElementById('reg-province').value;
    const city = document.getElementById('reg-city').value;
    const street = document.getElementById('reg-street').value.trim();

    if (!region || !province || !city || !street) {
        alert("Please complete all location address fields!");
        return;
    }

    const fullAddress = `${street}, ${city}, ${province}, ${region}`;

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    if (users.find(u => u.email === email)) {
        alert("An account with this email already exists!");
        return;
    }

    let newUser = {
        name,
        email,
        phone,
        password,
        role,
        region,
        province,
        city,
        street,
        address: fullAddress,
        desc: role === 'farmer' ? "Local agricultural producer." : "Marketplace user."
    };

    if (role === 'farmer') {
        newUser.farmName = `${name}'s Organic Farm`;
    }

    if (role === 'transpo_rider') {
        const compSelect = document.getElementById('reg-rider-company');
        const selectedOption = compSelect.options[compSelect.selectedIndex];
        
        if (!compSelect.value) {
            alert("Please select a valid Transportation Company!");
            return;
        }

        newUser.companyEmail = compSelect.value;
        newUser.companyName = selectedOption.text.split(' (')[0];
        newUser.status = 'pending';
        newUser.dutyStatus = 'Online / Available';
    }

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    if (role === 'transpo_rider') {
        alert(`Registration submitted! Your application has been sent to ${newUser.companyName} for verification.`);
        document.getElementById('register-form').reset();
        switchAuthMode('login');
    } else {
        localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        checkSession();
    }
}

function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    checkSession();
}

// CONSUMER MARKETPLACE
function renderMarketplace() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));

    const searchKeyword = document.getElementById('global-search').value.toLowerCase();
    const maxPrice = Number(document.getElementById('price-range').value);
    const selectedRegion = document.getElementById('region-filter').value;
    const selectedProvince = document.getElementById('province-filter').value;
    const selectedGrade = document.getElementById('grade-filter').value;
    const sortOption = document.getElementById('sort-filter').value;

    let filtered = products.filter(p => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.title.toLowerCase().includes(searchKeyword) || (p.farm || '').toLowerCase().includes(searchKeyword);
        const matchesPrice = p.price <= maxPrice;
        const matchesRegion = selectedRegion === 'all' || p.farmRegion === selectedRegion;
        const matchesProvince = selectedProvince === 'all' || p.farmProvince === selectedProvince;
        const matchesGrade = selectedGrade === 'all' || p.grade === selectedGrade;

        return matchesCategory && matchesSearch && matchesPrice && matchesRegion && matchesProvince && matchesGrade;
    });

    if (sortOption === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
        filtered.sort((a, b) => getProductRatingSummary(b.id).avg - getProductRatingSummary(a.id).avg);
    }

    document.getElementById('results-count').innerText = `Showing ${filtered.length} products`;

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No produce match your selected filters.</div>`;
        return;
    }

    filtered.forEach(p => {
        const ratingSummary = getProductRatingSummary(p.id);
        const isSelfListing = session && session.email === p.farmerEmail;
        const gradeObj = CROP_GRADES[p.grade] || CROP_GRADES["Grade A"];

        let actionBtnHtml = `<button type="button" class="btn-primary flex-1" onclick="addToCart(${p.id}, 1)">Add Order</button>`;
        if (isSelfListing) {
            actionBtnHtml = `<button type="button" class="btn-secondary flex-1" disabled style="opacity:0.65;">Your Listing</button>`;
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="card-img-wrapper" onclick="openProductModal(${p.id})">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'">
                <span class="grade-badge ${gradeObj.badgeClass}">${p.grade || 'Grade A'}</span>
            </div>
            <div class="card-content">
                <div class="card-meta-row">
                    <span class="category-tag">${p.category}</span>
                    <span class="card-rating">★ ${ratingSummary.avg} (${ratingSummary.count})</span>
                </div>
                <h4 class="product-title" onclick="openProductModal(${p.id})">${p.title}</h4>
                <p class="farm-info clickable-farm" onclick="openFarmerProfileModal('${p.farmerEmail}')">📍 ${p.farm || 'Local Farm'}</p>
                <div class="price-row">
                    <div>
                        <span class="price-amount">₱${p.price}</span>
                        <span class="price-unit">/${p.unit || 'kg'}</span>
                    </div>
                    <span class="stock-badge">${p.stock || 0} left</span>
                </div>
                <div class="card-actions">
                    <button type="button" class="btn-secondary flex-1" onclick="openProductModal(${p.id})">Inspect</button>
                    ${actionBtnHtml}
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

function setCategory(cat, element) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    activeCategory = cat;
    renderMarketplace();
}

function updatePriceLabel(val) {
    document.getElementById('price-val').innerText = `₱${val}`;
}

function applyFilters() {
    renderMarketplace();
}

// FARMER PROFILE & STOREFRONT MODAL
function openFarmerProfileModal(farmerEmail) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];

    const farmer = users.find(u => u.email === farmerEmail);
    if (!farmer) return;

    document.getElementById('storefront-farm-name').innerText = farmer.farmName || `${farmer.name}'s Farm`;
    document.getElementById('storefront-owner-name').innerText = `Owner: ${farmer.name}`;
    document.getElementById('storefront-location').innerText = `📍 ${farmer.address || 'Local Farm'}`;
    document.getElementById('storefront-phone').innerText = `📞 ${farmer.phone || 'N/A'}`;
    document.getElementById('storefront-bio').innerText = farmer.desc || "Verified local agricultural producer.";

    const msgBtn = document.getElementById('storefront-msg-btn');
    msgBtn.onclick = () => {
        toggleFarmerProfileModal();
        openChatWith(farmer.email, farmer.farmName || farmer.name, 'farmer');
    };

    const grid = document.getElementById('storefront-products-grid');
    grid.innerHTML = '';

    const farmerProducts = products.filter(p => p.farmerEmail === farmerEmail);
    if (farmerProducts.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1;">No active produce listings available at this moment.</p>`;
    } else {
        farmerProducts.forEach(p => {
            const gradeObj = CROP_GRADES[p.grade] || CROP_GRADES["Grade A"];
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="card-img-wrapper" onclick="toggleFarmerProfileModal(); openProductModal(${p.id});">
                    <img src="${p.image}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'">
                    <span class="grade-badge ${gradeObj.badgeClass}">${p.grade || 'Grade A'}</span>
                </div>
                <div class="card-content">
                    <h4 class="product-title" onclick="toggleFarmerProfileModal(); openProductModal(${p.id});">${p.title}</h4>
                    <div class="price-row">
                        <span class="price-amount">₱${p.price} / ${p.unit || 'kg'}</span>
                        <span class="stock-badge">${p.stock} left</span>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
    }

    document.getElementById('farmer-profile-modal').classList.remove('hidden');
}

function openFarmerProfileFromModal() {
    if (!currentModalProductId) return;
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const p = products.find(prod => prod.id === currentModalProductId);
    if (p) {
        toggleProductModal();
        openFarmerProfileModal(p.farmerEmail);
    }
}

function toggleFarmerProfileModal() {
    document.getElementById('farmer-profile-modal').classList.toggle('hidden');
}

// PRODUCT INSPECTION & REVIEWS MODAL
function openProductModal(productId) {
    currentModalProductId = productId;
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const p = products.find(prod => prod.id === productId);

    if (!p) return;

    const gradeObj = CROP_GRADES[p.grade] || CROP_GRADES["Grade A"];

    document.getElementById('modal-product-title').innerText = p.title;
    document.getElementById('modal-product-img').src = p.image;
    document.getElementById('modal-product-grade').innerText = p.grade || 'Grade A';
    document.getElementById('modal-product-grade').className = `grade-badge ${gradeObj.badgeClass}`;
    
    document.getElementById('modal-grade-desc-text').innerHTML = `<strong>${gradeObj.label}:</strong> ${gradeObj.description}`;

    document.getElementById('modal-product-category').innerText = p.category;
    document.getElementById('modal-product-farm').innerText = `📍 ${p.farm || 'Local Farm'}`;
    document.getElementById('modal-product-price').innerText = `₱${p.price}`;
    document.getElementById('modal-product-unit').innerText = `/${p.unit || 'kg'}`;
    document.getElementById('modal-product-stock').innerText = `${p.stock || 0} left in stock`;
    document.getElementById('modal-product-desc').innerText = p.desc || "No description provided by farmer.";
    document.getElementById('modal-qty-input').value = 1;
    document.getElementById('review-product-id').value = productId;

    const summary = getProductRatingSummary(productId);
    document.getElementById('modal-rating-summary').innerHTML = `
        <span class="stars" style="color:var(--accent-gold); font-size:1.1rem;">${summary.stars}</span>
        <span class="rating-text" style="font-weight:600; margin-left:0.5rem;">${summary.avg} / 5.0 (${summary.count} reviews)</span>`;

    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const controls = document.getElementById('modal-purchase-controls');
    const selfNotice = document.getElementById('modal-self-listing-notice');
    const reviewCard = document.getElementById('write-review-card');
    const reviewNotice = document.getElementById('review-notice-card');
    const reviewNoticeText = document.getElementById('review-notice-text');

    const isSelfOwner = session && session.email === p.farmerEmail;

    if (isSelfOwner) {
        controls.style.display = 'none';
        selfNotice.classList.remove('hidden');
        reviewCard.classList.add('hidden');
        reviewNotice.classList.remove('hidden');
        reviewNoticeText.innerText = "Farmers cannot post reviews on their own produce.";
    } else {
        controls.style.display = 'flex';
        selfNotice.classList.add('hidden');

        if (session && hasPurchasedAndReceived(session.email, productId)) {
            reviewCard.classList.remove('hidden');
            reviewNotice.classList.add('hidden');
        } else {
            reviewCard.classList.add('hidden');
            reviewNotice.classList.remove('hidden');
            if (!session) {
                reviewNoticeText.innerText = "Please log in to submit a review for items you have received.";
            } else {
                reviewNoticeText.innerText = "Reviews are reserved for verified buyers who have received this item (Order status: Delivered).";
            }
        }
    }

    switchModalTab('reviews');
    renderReviews(productId);
    renderQA(productId);

    document.getElementById('product-modal').classList.remove('hidden');
}

function toggleProductModal() {
    document.getElementById('product-modal').classList.toggle('hidden');
}

function changeModalQty(delta) {
    const input = document.getElementById('modal-qty-input');
    let val = parseInt(input.value) || 1;
    val = Math.max(1, val + delta);
    input.value = val;
}

function switchModalTab(tabName) {
    const isReviews = tabName === 'reviews';
    document.getElementById('tab-reviews-btn').classList.toggle('active', isReviews);
    document.getElementById('tab-qa-btn').classList.toggle('active', !isReviews);

    document.getElementById('tab-reviews-content').classList.toggle('hidden', !isReviews);
    document.getElementById('tab-qa-content').classList.toggle('hidden', isReviews);
}

// REVIEWS & Q&A
function getProductReviews(productId) {
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || [];
    return reviews.filter(r => Number(r.productId) === Number(productId));
}

function getProductRatingSummary(productId) {
    const reviews = getProductReviews(productId);
    if (reviews.length === 0) {
        return { avg: "5.0", count: 0, stars: "★★★★★" };
    }
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    const avg = (sum / reviews.length).toFixed(1);
    const starNum = Math.round(avg);
    const stars = "★".repeat(starNum) + "☆".repeat(5 - starNum);
    return { avg, count: reviews.length, stars };
}

function hasPurchasedAndReceived(userEmail, productId) {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    return orders.some(o => 
        o.buyerEmail === userEmail && 
        o.status === 'Package Delivered' && 
        o.items && o.items.some(item => Number(item.id) === Number(productId))
    );
}

function renderReviews(productId) {
    const container = document.getElementById('reviews-list-container');
    container.innerHTML = '';
    const reviews = getProductReviews(productId);

    if (reviews.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); font-style:italic;">No customer reviews yet. Be the first verified buyer to leave feedback!</p>`;
        return;
    }

    reviews.forEach(r => {
        const starStr = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-header">
                <strong>${r.userName} <span class="badge-outline">Verified Buyer</span></strong>
                <span class="review-date">${r.date}</span>
            </div>
            <div class="review-stars" style="color:var(--accent-gold); margin:4px 0;">${starStr}</div>
            <p class="review-comment">${r.comment}</p>`;
        container.appendChild(card);
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) return;

    const productId = Number(document.getElementById('review-product-id').value);
    const rating = Number(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-comment').value.trim();

    if (!comment) return;

    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY)) || [];
    const newReview = {
        id: Date.now(),
        productId,
        userName: session.name,
        userEmail: session.email,
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
    };

    reviews.unshift(newReview);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

    document.getElementById('review-comment').value = '';
    renderReviews(productId);
    renderMarketplace();
    alert("Thank you! Your verified review has been published.");
}

function renderQA(productId) {
    const container = document.getElementById('qa-list-container');
    container.innerHTML = '';
    const allQA = JSON.parse(localStorage.getItem(QA_KEY)) || [];
    const productQA = allQA.filter(q => Number(q.productId) === Number(productId));

    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const p = products.find(prod => prod.id === productId);
    const isFarmerOwner = session && p && session.email === p.farmerEmail;

    if (productQA.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); font-style:italic;">No public questions asked yet. Ask the farmer anything regarding harvest quality or specs!</p>`;
        return;
    }

    productQA.forEach(q => {
        const card = document.createElement('div');
        card.className = 'qa-card';

        let answerHtml = '';
        if (q.answer) {
            answerHtml = `
                <div class="qa-answer-box">
                    <strong>👨‍🌾 Farmer Answer (${q.answeredBy}):</strong>
                    <p style="margin-top:2px;">${q.answer}</p>
                    <small style="color:var(--text-muted);">${q.answeredDate}</small>
                </div>`;
        } else if (isFarmerOwner) {
            answerHtml = `
                <div style="margin-top:8px;">
                    <input type="text" id="qa-ans-input-${q.id}" placeholder="Write a public answer as the seller..." style="width:70%; padding:4px 8px; font-size:0.8rem;">
                    <button class="btn-primary btn-sm" onclick="handleQAAnswerSubmit(${q.id})">Reply</button>
                </div>`;
        } else {
            answerHtml = `<p style="font-size:0.8rem; color:var(--text-muted); font-style:italic; margin-top:4px;">Awaiting seller response...</p>`;
        }

        card.innerHTML = `
            <div class="qa-header">
                <strong>❓ ${q.userName}</strong>
                <span class="subtext">${q.date}</span>
            </div>
            <p style="margin-top:4px; font-size:0.9rem;">${q.question}</p>
            ${answerHtml}`;
        container.appendChild(card);
    });
}

function handleQASubmit(e) {
    e.preventDefault();
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) {
        alert("Please log in to ask a public question.");
        return;
    }

    const input = document.getElementById('qa-question-text');
    const text = input.value.trim();
    if (!text || !currentModalProductId) return;

    const allQA = JSON.parse(localStorage.getItem(QA_KEY)) || [];
    const newQA = {
        id: Date.now(),
        productId: currentModalProductId,
        userName: session.name,
        userEmail: session.email,
        question: text,
        date: new Date().toISOString().split('T')[0],
        answer: null,
        answeredBy: null,
        answeredDate: null
    };

    allQA.unshift(newQA);
    localStorage.setItem(QA_KEY, JSON.stringify(allQA));

    input.value = '';
    renderQA(currentModalProductId);
    alert("Your question has been posted publicly on the product page!");
}

function handleQAAnswerSubmit(qaId) {
    const input = document.getElementById(`qa-ans-input-${qaId}`);
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!input || !input.value.trim() || !session) return;

    let allQA = JSON.parse(localStorage.getItem(QA_KEY)) || [];
    const idx = allQA.findIndex(q => q.id === qaId);
    if (idx !== -1) {
        allQA[idx].answer = input.value.trim();
        allQA[idx].answeredBy = session.name;
        allQA[idx].answeredDate = new Date().toISOString().split('T')[0];

        localStorage.setItem(QA_KEY, JSON.stringify(allQA));
        renderQA(currentModalProductId);
        alert("Public answer published!");
    }
}

// CART & CHECKOUT
function addModalItemToCart() {
    if (!currentModalProductId) return;
    const qty = parseInt(document.getElementById('modal-qty-input').value) || 1;
    addToCart(currentModalProductId, qty);
    toggleProductModal();
}

function addToCart(productId, qty = 1) {
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const p = products.find(prod => prod.id === productId);

    if (!p) return;

    if (session && session.email === p.farmerEmail) {
        alert("You cannot purchase your own produce listing!");
        return;
    }

    if (p.stock <= 0) {
        alert("Sorry, this item is out of stock!");
        return;
    }

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        if (existing.qty + qty > p.stock) {
            alert(`Cannot add more. Maximum available stock is ${p.stock}.`);
            return;
        }
        existing.qty += qty;
    } else {
        cart.push({
            id: p.id,
            title: p.title,
            price: p.price,
            unit: p.unit,
            stock: p.stock,
            farmerEmail: p.farmerEmail,
            farm: p.farm,
            qty
        });
    }

    updateCartUI();
    alert(`Added ${qty} ${p.unit || 'unit'}(s) of "${p.title}" to cart.`);
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    const badge = document.getElementById('cart-badge');
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.innerText = totalCount;

    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:2rem;">Your shopping cart is currently empty.</p>`;
    } else {
        cart.forEach(item => {
            const lineTotal = item.price * item.qty;
            subtotal += lineTotal;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <div class="cart-item-details">
                    <strong>${item.title}</strong>
                    <span style="font-size:0.8rem; color:var(--text-muted); display:block;">₱${item.price} / ${item.unit || 'kg'} • ${item.farm}</span>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="btn-qty" onclick="updateCartQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button type="button" class="btn-qty" onclick="updateCartQty(${item.id}, 1)">+</button>
                </div>
                <span class="cart-item-price">₱${lineTotal}</span>
                <button type="button" class="btn-remove" onclick="removeFromCart(${item.id})">&times;</button>`;
            container.appendChild(row);
        });
    }

    const shipping = cart.length > 0 ? 150 : 0;
    document.getElementById('cart-subtotal').innerText = `₱${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `₱${(subtotal + shipping).toFixed(2)}`;
}

function toggleCartModal() {
    document.getElementById('cart-modal').classList.toggle('hidden');
}

function processCheckout() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) {
        alert("Please log in to place an order.");
        return;
    }

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const codNotes = document.getElementById('cod-notes').value.trim();
    let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];

    // Deduct stock
    for (let item of cart) {
        let p = products.find(prod => prod.id === item.id);
        if (p) {
            if (p.stock < item.qty) {
                alert(`Insufficient stock for "${p.title}". Only ${p.stock} left.`);
                return;
            }
            p.stock -= item.qty;
        }
    }

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const firstItem = cart[0];
    const farmerEmail = firstItem.farmerEmail;

    const newOrder = {
        id: orderId,
        buyerName: session.name,
        buyerEmail: session.email,
        buyerPhone: session.phone || "09170000000",
        buyerProvince: session.province || "Batangas",
        farmerEmail: farmerEmail,
        date: now,
        address: session.address,
        notes: codNotes,
        paymentMethod: "Cash-on-Delivery (COD)",
        items: [...cart],
        subtotal: subtotal,
        shipping: 150,
        total: subtotal + 150,
        status: "Order Placed",
        pickupRiderEmail: null,
        deliveryRiderEmail: null,
        timeline: [
            { status: "Order Placed", time: now, updatedBy: session.name, role: "Buyer" }
        ]
    };

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    orders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    alert(`Order ${orderId} successfully placed via Cash-on-Delivery!

Deliveries will be handled by local provincial riders.`);
    cart = [];
    updateCartUI();
    toggleCartModal();
    renderMarketplace();
    toggleOrdersModal();
}

// FARMER DASHBOARD & PUBLISHING
function renderFarmerDashboard() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) return;

    // Set inherited farm name & location info
    const farmDisplayNameEl = document.getElementById('p-farm-display-name');
    const farmDisplayLocEl = document.getElementById('p-farm-display-loc');

    if (farmDisplayNameEl) farmDisplayNameEl.innerText = session.farmName || `${session.name}'s Organic Farm`;
    if (farmDisplayLocEl) farmDisplayLocEl.innerText = session.address || "Local Farm Location";

    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const myProducts = products.filter(p => p.farmerEmail === session.email);

    const container = document.getElementById('farmer-inventory-list');
    container.innerHTML = '';

    let totalValue = 0;
    myProducts.forEach(p => {
        totalValue += (p.price * (p.stock || 0));

        const item = document.createElement('div');
        item.className = 'inventory-card';
        item.innerHTML = `
            <div class="inv-thumb">
                <img src="${p.image}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'">
            </div>
            <div class="inv-details">
                <strong>${p.title}</strong>
                <div class="inv-meta">
                    <span>₱${p.price}/${p.unit || 'kg'}</span> • 
                    <span class="stock-badge">${p.stock} in stock</span> • 
                    <span class="category-tag">${p.category}</span> •
                    <span class="badge-outline">${p.grade || 'Grade A'}</span>
                </div>
            </div>
            <div class="inv-actions">
                <button type="button" class="btn-secondary btn-sm" onclick="openEditModal(${p.id})">✏️ Edit</button>
                <button type="button" class="btn-danger btn-sm" onclick="deleteProduct(${p.id})">🗑️ Delete</button>
            </div>`;
        container.appendChild(item);
    });

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    const farmerOrders = orders.filter(o => o.farmerEmail === session.email);
    const completedOrders = farmerOrders.filter(o => o.status === 'Package Delivered');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);

    document.getElementById('stat-listings').innerText = myProducts.length;
    document.getElementById('stat-value').innerText = `₱${totalValue.toLocaleString()}`;
    document.getElementById('stat-revenue').innerText = `₱${totalRevenue.toLocaleString()}`;
    document.getElementById('stat-orders-count').innerText = completedOrders.length;

    renderRevenueChart();
    updateGradeDescriptionHint('p');
}

function renderRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.parentElement.clientWidth || 700;
    canvas.height = 220;

    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];

    const myProducts = session ? products.filter(p => p.farmerEmail === session.email) : products;
    const productSalesMap = {};
    myProducts.forEach(p => { productSalesMap[p.title] = 0; });

    orders.forEach(order => {
        if (order.farmerEmail === session.email && order.items) {
            order.items.forEach(item => {
                if (productSalesMap[item.title] !== undefined) {
                    productSalesMap[item.title] += (item.price * item.qty);
                }
            });
        }
    });

    const labels = Object.keys(productSalesMap);
    const data = Object.values(productSalesMap);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (labels.length === 0) {
        ctx.fillStyle = "#888";
        ctx.font = "14px Inter, sans-serif";
        ctx.fillText("No sales revenue recorded yet.", 20, 100);
        return;
    }

    const maxVal = Math.max(...data, 1000);
    const paddingLeft = 60;
    const paddingBottom = 40;
    const chartWidth = canvas.width - paddingLeft - 20;
    const chartHeight = canvas.height - paddingBottom - 20;

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = 20 + (chartHeight / 4) * i;
        const valLabel = Math.round(maxVal - (maxVal / 4) * i);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(paddingLeft + chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = "#64748b";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText(`₱${valLabel}`, 10, y + 4);
    }

    const barWidth = Math.min(60, (chartWidth / labels.length) - 20);
    const spacing = chartWidth / labels.length;

    labels.forEach((label, idx) => {
        const val = data[idx];
        const barHeight = (val / maxVal) * chartHeight;
        const x = paddingLeft + (idx * spacing) + (spacing - barWidth) / 2;
        const y = 20 + (chartHeight - barHeight);

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#2e7d32');
        grad.addColorStop(1, '#1b4d3e');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#1b4d3e';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`₱${val}`, x + (barWidth / 4) - 5, y - 6);

        ctx.fillStyle = '#475569';
        ctx.font = '11px Inter, sans-serif';
        const truncatedLabel = label.length > 12 ? label.substring(0, 10) + '..' : label;
        ctx.fillText(truncatedLabel, x, canvas.height - 12);
    });
}

function handleNewListing(e) {
    e.preventDefault();
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session || session.role !== 'farmer') return;

    const farmTitle = session.farmName || `${session.name}'s Organic Farm`;
    const farmRegion = session.region || "CALABARZON (Region IV-A)";
    const farmProvince = session.province || "Batangas";
    const farmCity = session.city || "Lipa City";
    const farmLocationStr = `${farmTitle} (${farmCity}, ${farmProvince})`;

    const newProd = {
        id: Date.now(),
        farmerEmail: session.email,
        farmName: farmTitle,
        farmRegion: farmRegion,
        farmProvince: farmProvince,
        farmCity: farmCity,
        farm: farmLocationStr,
        title: document.getElementById('p-title').value.trim(),
        category: document.getElementById('p-category').value,
        price: Number(document.getElementById('p-price').value),
        unit: document.getElementById('p-unit').value.trim(),
        stock: Number(document.getElementById('p-stock').value),
        grade: document.getElementById('p-grade').value,
        desc: document.getElementById('p-desc').value.trim() || "Fresh harvest produce directly from farm.",
        image: document.getElementById('p-img').value.trim() || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"
    };

    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    products.unshift(newProd);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    document.getElementById('add-product-form').reset();
    document.getElementById('p-img-preview-box').classList.add('hidden');
    renderFarmerDashboard();
    renderMarketplace();
    alert("Produce listing successfully published to marketplace!");
}

function openEditModal(productId) {
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    document.getElementById('edit-p-id').value = p.id;
    document.getElementById('edit-p-title').value = p.title;
    document.getElementById('edit-p-category').value = p.category;
    document.getElementById('edit-p-grade').value = p.grade || 'Grade A';
    document.getElementById('edit-p-price').value = p.price;
    document.getElementById('edit-p-unit').value = p.unit || 'kg';
    document.getElementById('edit-p-stock').value = p.stock || 0;
    document.getElementById('edit-p-desc').value = p.desc || '';
    document.getElementById('edit-p-img').value = p.image;

    updateImagePreview('edit');
    updateGradeDescriptionHint('edit');
    toggleEditModal();
}

function toggleEditModal() {
    document.getElementById('edit-product-modal').classList.toggle('hidden');
}

function handleSaveEdit(e) {
    e.preventDefault();
    const productId = Number(document.getElementById('edit-p-id').value);
    let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];

    const idx = products.findIndex(prod => prod.id === productId);
    if (idx !== -1) {
        products[idx].title = document.getElementById('edit-p-title').value.trim();
        products[idx].category = document.getElementById('edit-p-category').value;
        products[idx].grade = document.getElementById('edit-p-grade').value;
        products[idx].price = Number(document.getElementById('edit-p-price').value);
        products[idx].unit = document.getElementById('edit-p-unit').value.trim();
        products[idx].stock = Number(document.getElementById('edit-p-stock').value);
        products[idx].desc = document.getElementById('edit-p-desc').value.trim();
        products[idx].image = document.getElementById('edit-p-img').value.trim();

        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        toggleEditModal();
        renderFarmerDashboard();
        renderMarketplace();
        alert("Listing updated successfully!");
    }
}

function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this produce listing?")) return;

    let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    products = products.filter(p => p.id !== productId);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    renderFarmerDashboard();
    renderMarketplace();
}

function updateImagePreview(prefix) {
    const url = document.getElementById(`${prefix}-p-img`).value.trim();
    const previewBox = document.getElementById(`${prefix}-p-img-preview-box`);
    const previewImg = document.getElementById(`${prefix}-p-img-preview`);

    if (url) {
        previewImg.src = url;
        previewBox.classList.remove('hidden');
    } else {
        previewBox.classList.add('hidden');
    }
}

// TRANSPORTATION DASHBOARD
function switchTranspoTab(tabName) {
    const isOrders = tabName === 'orders';
    document.getElementById('tab-transpo-orders-btn').classList.toggle('active', isOrders);
    document.getElementById('tab-transpo-fleet-btn').classList.toggle('active', !isOrders);

    document.getElementById('transpo-tab-orders').classList.toggle('hidden', !isOrders);
    document.getElementById('transpo-tab-fleet').classList.toggle('hidden', isOrders);

    if (isOrders) renderTranspoOrders();
    else renderTranspoFleet();
}

function renderTranspoDashboard() {
    switchTranspoTab('orders');
}

function renderTranspoOrders() {
    const container = document.getElementById('transpo-orders-container');
    container.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));

    if (orders.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:3rem;">No active orders in the dispatch system.</p>`;
        return;
    }

    orders.forEach(order => {
        const card = createOrderCardElement(order, session, users);
        container.appendChild(card);
    });
}

function renderTranspoFleet() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const pendingList = document.getElementById('pending-riders-list');
    const approvedList = document.getElementById('approved-riders-list');

    pendingList.innerHTML = '';
    approvedList.innerHTML = '';

    const companyRiders = users.filter(u => u.role === 'transpo_rider' && u.companyEmail === session.email);
    const pendingRiders = companyRiders.filter(u => u.status === 'pending');
    const approvedRiders = companyRiders.filter(u => u.status === 'verified');

    if (pendingRiders.length === 0) {
        pendingList.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">No pending rider verification requests.</p>`;
    } else {
        pendingRiders.forEach(r => {
            const row = document.createElement('div');
            row.className = 'rider-fleet-row';
            row.innerHTML = `
                <div class="rider-info">
                    <strong>${r.name}</strong>
                    <span class="subtext">📞 ${r.phone} • 📍 ${r.province} (${r.city})</span>
                </div>
                <button class="btn-primary btn-sm" onclick="approveRider('${r.email}')">✅ Verify & Approve</button>`;
            pendingList.appendChild(row);
        });
    }

    if (approvedRiders.length === 0) {
        approvedList.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">No active verified riders in fleet.</p>`;
    } else {
        approvedRiders.forEach(r => {
            const row = document.createElement('div');
            row.className = 'rider-fleet-row';
            row.innerHTML = `
                <div class="rider-info">
                    <strong>${r.name}</strong>
                    <span class="subtext">📞 ${r.phone} • 📍 ${r.province} (${r.city})</span>
                </div>
                <span class="badge-outline">${r.dutyStatus || 'Online / Available'}</span>`;
            approvedList.appendChild(row);
        });
    }
}

function approveRider(riderEmail) {
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const idx = users.findIndex(u => u.email === riderEmail);

    if (idx !== -1) {
        users[idx].status = 'verified';
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        renderTranspoFleet();
        alert(`Rider ${users[idx].name} verified and added to active fleet!`);
    }
}

function assignRiderToOrder(orderId, legType, riderEmail) {
    let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) return;

    if (legType === 'pickup') {
        order.pickupRiderEmail = riderEmail;
    } else {
        order.deliveryRiderEmail = riderEmail;
    }

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    renderTranspoOrders();
    alert(`Rider assigned to ${legType === 'pickup' ? 'First-Mile Pickup' : 'Last-Mile Delivery'} for order ${orderId}!`);
}

// RIDER DASHBOARD
function renderRiderDashboard() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const container = document.getElementById('rider-jobs-container');
    container.innerHTML = '';

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const assignedJobs = orders.filter(o => o.pickupRiderEmail === session.email || o.deliveryRiderEmail === session.email);

    if (assignedJobs.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:3rem;">No active job dispatches assigned to you in ${session.province}.</p>`;
        return;
    }

    assignedJobs.forEach(order => {
        const card = createOrderCardElement(order, session, users);
        container.appendChild(card);
    });
}

function respondToJobAssignment(orderId, legType, decision) {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) return;

    if (decision === 'accept') {
        if (legType === 'pickup') {
            order.pickupAccepted = true;
            updateRiderDutyStatus("In Transit - Picking Up Packages");
        } else {
            order.deliveryAccepted = true;
            updateRiderDutyStatus("In Transit - Delivering Parcels");
        }
        alert(`You accepted the ${legType} assignment for order ${orderId}!`);
    } else {
        const reason = prompt("Optional reason for rejecting this job assignment:");
        if (legType === 'pickup') {
            order.pickupRiderEmail = null;
            order.pickupAccepted = false;
        } else {
            order.deliveryRiderEmail = null;
            order.deliveryAccepted = false;
        }

        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        order.timeline.push({
            status: `Rider Rejected (${legType})`,
            time: now,
            updatedBy: session.name,
            role: "Rider",
            reason: reason || "Rider unavailable"
        });

        alert(`Job assignment declined. Returned to company dispatch pool.`);
    }

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    renderRiderDashboard();
}

// ORDER HISTORY & TRACKING LIST
function toggleOrdersModal() {
    const modal = document.getElementById('orders-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        renderOrdersList();
    }
}

function renderOrdersList() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const container = document.getElementById('orders-list-container');
    container.innerHTML = '';

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    let userOrders = [];
    if (session.role === 'consumer') {
        userOrders = orders.filter(o => o.buyerEmail === session.email);
    } else if (session.role === 'farmer') {
        if (currentFarmerViewMode === 'buy') {
            userOrders = orders.filter(o => o.buyerEmail === session.email);
        } else {
            userOrders = orders.filter(o => o.farmerEmail === session.email);
        }
    } else {
        userOrders = orders;
    }

    if (userOrders.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:3rem;">No order records found.</p>`;
        return;
    }

    userOrders.forEach(order => {
        const card = createOrderCardElement(order, session, users);
        container.appendChild(card);
    });
}

function createOrderCardElement(order, session, users) {
    const card = document.createElement('div');
    card.className = 'order-card';

    const farmerUser = users.find(u => u.email === order.farmerEmail) || { name: 'Farmer', province: 'Batangas', address: 'Batangas Farm' };
    const buyerUser = users.find(u => u.email === order.buyerEmail) || { name: order.buyerName || 'Buyer', province: order.buyerProvince || 'Batangas', address: order.address };

    const itemsSummary = order.items ? order.items.map(i => `${i.title} (${i.qty} ${i.unit || 'kg'})`).join(', ') : 'Produce';

    const pipelineStages = [
        "Order Placed",
        "Order Received",
        "Packing Order",
        "Ready for Courier Pick-up",
        "Rider on the way for Pickup",
        "Picking-up Package",
        "Package Acquired",
        "Delivering to Warehouse",
        "Delivered to Warehouse",
        "Received Package in Sortation Center",
        "Sorting & Quality Inspection Complete",
        "Dispatched to Last-Mile Rider",
        "Exited Sortation Center",
        "Rider on the way to Deliver your Package",
        "Rider is near your Location",
        "Package Delivered"
    ];

    const currentIdx = pipelineStages.indexOf(order.status) !== -1 ? pipelineStages.indexOf(order.status) : 0;

    // Cancellation Check: Buyer can cancel if early stages (< Ready for Courier Pick-up)
    const isBuyer = session.email === order.buyerEmail;
    const canCancel = isBuyer && (order.status === "Order Placed" || order.status === "Order Received" || order.status === "Packing Order");

    let cancelBtnHtml = '';
    if (isBuyer) {
        if (canCancel) {
            cancelBtnHtml = `<button class="btn-danger btn-sm" onclick="cancelOrder('${order.id}')">❌ Cancel Order</button>`;
        } else if (order.status === "Cancelled") {
            cancelBtnHtml = `<span class="badge-outline" style="color:#dc2626; border-color:#dc2626;">Cancelled</span>`;
        } else {
            cancelBtnHtml = `<span class="subtext">🔒 Cancellation Period Ended (Package Prepared / In Transit)</span>`;
        }
    }

    // Role Specific Controls
    let controlsHtml = '';

    if (session.role === 'farmer' && session.email === order.farmerEmail) {
        controlsHtml = `
            <div class="order-admin-controls">
                <label>Farmer Status Update: </label>
                <select onchange="submitStatusUpdate('${order.id}', this.value)" style="width:auto;">
                    <option value="Order Placed" ${order.status === 'Order Placed' ? 'selected' : ''}>1. Order Placed</option>
                    <option value="Order Received" ${order.status === 'Order Received' ? 'selected' : ''}>2. Order Received</option>
                    <option value="Packing Order" ${order.status === 'Packing Order' ? 'selected' : ''}>3. Packing Order</option>
                    <option value="Ready for Courier Pick-up" ${order.status === 'Ready for Courier Pick-up' ? 'selected' : ''}>4. Ready for Courier Pick-up</option>
                </select>
            </div>`;
    } else if (session.role === 'transpo_company') {
        const farmerProvince = farmerUser.province || "Batangas";
        const buyerProvince = buyerUser.province || "Batangas";

        // Filter Pickup Riders: same company + matching farmer province + online/picking-up
        const pickupRiders = users.filter(u => 
            u.role === 'transpo_rider' && 
            u.companyEmail === session.email && 
            u.status === 'verified' &&
            u.province === farmerProvince &&
            (u.dutyStatus === 'Online / Available' || u.dutyStatus === 'In Transit - Picking Up Packages')
        );

        // Filter Delivery Riders: same company + matching buyer province + online/delivering
        const deliveryRiders = users.filter(u => 
            u.role === 'transpo_rider' && 
            u.companyEmail === session.email && 
            u.status === 'verified' &&
            u.province === buyerProvince &&
            (u.dutyStatus === 'Online / Available' || u.dutyStatus === 'In Transit - Delivering Parcels')
        );

        let pickupSelectHtml = `<select onchange="assignRiderToOrder('${order.id}', 'pickup', this.value)" style="width:auto;"><option value="">Select First-Mile Rider in ${farmerProvince}...</option>`;
        if (pickupRiders.length === 0) {
            pickupSelectHtml += `<option disabled>No online riders in ${farmerProvince}</option>`;
        } else {
            pickupRiders.forEach(r => {
                pickupSelectHtml += `<option value="${r.email}" ${order.pickupRiderEmail === r.email ? 'selected' : ''}>${r.name} (${r.dutyStatus})</option>`;
            });
        }
        pickupSelectHtml += `</select>`;

        const isAtSortationCenter = currentIdx >= 9; // Delivered to Warehouse or later
        let deliverySelectHtml = '';

        if (!isAtSortationCenter) {
            deliverySelectHtml = `<span class="subtext" style="padding:6px; background:#f1f5f9; border-radius:6px;">🔒 Last-mile rider assignable once package arrives at sortation center</span>`;
        } else {
            deliverySelectHtml = `<select onchange="assignRiderToOrder('${order.id}', 'delivery', this.value)" style="width:auto;"><option value="">Select Last-Mile Rider in ${buyerProvince}...</option>`;
            if (deliveryRiders.length === 0) {
                deliverySelectHtml += `<option disabled>No online riders in ${buyerProvince}</option>`;
            } else {
                deliveryRiders.forEach(r => {
                    deliverySelectHtml += `<option value="${r.email}" ${order.deliveryRiderEmail === r.email ? 'selected' : ''}>${r.name} (${r.dutyStatus})</option>`;
                });
            }
            deliverySelectHtml += `</select>`;
        }

        controlsHtml = `
            <div class="order-admin-controls" style="flex-direction:column; align-items:flex-start;">
                <div><strong>Assign First-Mile Pickup Rider (${farmerProvince}):</strong> ${pickupSelectHtml}</div>
                <div style="margin-top:6px;"><strong>Assign Last-Mile Delivery Rider (${buyerProvince}):</strong> ${deliverySelectHtml}</div>
                <div style="margin-top:6px;">
                    <label>Sortation Hub Status Update: </label>
                    <select onchange="submitStatusUpdate('${order.id}', this.value)" style="width:auto;">
                        <option value="Delivered to Warehouse" ${order.status === 'Delivered to Warehouse' ? 'selected' : ''}>Delivered to Warehouse</option>
                        <option value="Received Package in Sortation Center" ${order.status === 'Received Package in Sortation Center' ? 'selected' : ''}>Received Package in Sortation Center</option>
                        <option value="Sorting & Quality Inspection Complete" ${order.status === 'Sorting & Quality Inspection Complete' ? 'selected' : ''}>Sorting & Quality Inspection Complete</option>
                        <option value="Dispatched to Last-Mile Rider" ${order.status === 'Dispatched to Last-Mile Rider' ? 'selected' : ''}>Dispatched to Last-Mile Rider</option>
                    </select>
                </div>
            </div>`;
    } else if (session.role === 'transpo_rider') {
        const isPickupRider = order.pickupRiderEmail === session.email;
        const isDeliveryRider = order.deliveryRiderEmail === session.email;

        if (isPickupRider && !order.pickupAccepted) {
            controlsHtml = `
                <div class="order-admin-controls">
                    <span><strong>First-Mile Job Request:</strong> Pick up package at ${farmerUser.name}'s Farm (${farmerUser.province})</span>
                    <button class="btn-primary btn-sm" onclick="respondToJobAssignment('${order.id}', 'pickup', 'accept')">✅ Accept Job</button>
                    <button class="btn-danger btn-sm" onclick="respondToJobAssignment('${order.id}', 'pickup', 'reject')">❌ Decline</button>
                </div>`;
        } else if (isDeliveryRider && !order.deliveryAccepted) {
            controlsHtml = `
                <div class="order-admin-controls">
                    <span><strong>Last-Mile Job Request:</strong> Deliver package to ${buyerUser.name} (${buyerUser.province})</span>
                    <button class="btn-primary btn-sm" onclick="respondToJobAssignment('${order.id}', 'delivery', 'accept')">✅ Accept Job</button>
                    <button class="btn-danger btn-sm" onclick="respondToJobAssignment('${order.id}', 'delivery', 'reject')">❌ Decline</button>
                </div>`;
        } else if (isPickupRider) {
            controlsHtml = `
                <div class="order-admin-controls">
                    <label>Pickup Rider Progress: </label>
                    <select onchange="submitStatusUpdate('${order.id}', this.value)" style="width:auto;">
                        <option value="Ready for Courier Pick-up" ${order.status === 'Ready for Courier Pick-up' ? 'selected' : ''}>Ready for Courier Pick-up</option>
                        <option value="Rider on the way for Pickup" ${order.status === 'Rider on the way for Pickup' ? 'selected' : ''}>Rider on the way for Pickup</option>
                        <option value="Picking-up Package" ${order.status === 'Picking-up Package' ? 'selected' : ''}>Picking-up Package</option>
                        <option value="Package Acquired" ${order.status === 'Package Acquired' ? 'selected' : ''}>Package Acquired</option>
                        <option value="Delivering to Warehouse" ${order.status === 'Delivering to Warehouse' ? 'selected' : ''}>Delivering to Warehouse</option>
                        <option value="Delivered to Warehouse" ${order.status === 'Delivered to Warehouse' ? 'selected' : ''}>Delivered to Warehouse</option>
                    </select>
                </div>`;
        } else if (isDeliveryRider) {
            controlsHtml = `
                <div class="order-admin-controls">
                    <label>Delivery Rider Progress: </label>
                    <select onchange="submitStatusUpdate('${order.id}', this.value)" style="width:auto;">
                        <option value="Dispatched to Last-Mile Rider" ${order.status === 'Dispatched to Last-Mile Rider' ? 'selected' : ''}>Dispatched to Last-Mile Rider</option>
                        <option value="Exited Sortation Center" ${order.status === 'Exited Sortation Center' ? 'selected' : ''}>Exited Sortation Center</option>
                        <option value="Rider on the way to Deliver your Package" ${order.status === 'Rider on the way to Deliver your Package' ? 'selected' : ''}>Rider on the way to Deliver</option>
                        <option value="Rider is near your Location" ${order.status === 'Rider is near your Location' ? 'selected' : ''}>Rider is near Location</option>
                        <option value="Package Delivered" ${order.status === 'Package Delivered' ? 'selected' : ''}>Package Delivered</option>
                    </select>
                </div>`;
        }
    }

    // Direct Messaging Shortcuts
    let msgShortcutsHtml = '';
    if (session.role === 'consumer') {
        msgShortcutsHtml = `<button class="btn-secondary btn-sm" onclick="openChatWith('${order.farmerEmail}', '${farmerUser.farmName || farmerUser.name}', 'farmer')">💬 Message Farmer</button>`;
        if (order.deliveryRiderEmail) {
            msgShortcutsHtml += `<button class="btn-secondary btn-sm" onclick="openChatWith('${order.deliveryRiderEmail}', 'Delivery Rider', 'transpo_rider')">💬 Message Delivery Rider</button>`;
        }
    } else if (session.role === 'farmer') {
        msgShortcutsHtml = `<button class="btn-secondary btn-sm" onclick="openChatWith('${order.buyerEmail}', '${buyerUser.name}', 'consumer')">💬 Message Buyer</button>`;
    } else if (session.role === 'transpo_rider') {
        if (order.pickupRiderEmail === session.email) {
            msgShortcutsHtml = `<button class="btn-secondary btn-sm" onclick="openChatWith('${order.farmerEmail}', '${farmerUser.name}', 'farmer')">💬 Message Farmer</button>`;
        } else if (order.deliveryRiderEmail === session.email) {
            msgShortcutsHtml = `<button class="btn-secondary btn-sm" onclick="openChatWith('${order.buyerEmail}', '${buyerUser.name}', 'consumer')">💬 Message Buyer</button>`;
        }
    }

    // Chronological Timeline HTML
    let timelineHtml = '<div class="timeline-list"><strong>📜 Chronological Event Tracking Timeline:</strong>';
    if (order.timeline && order.timeline.length > 0) {
        order.timeline.forEach(t => {
            const backtrackTag = t.reason ? `<span class="backtrack-tag">⚠️ REVERTED: ${t.reason}</span>` : '';
            timelineHtml += `
                <div class="timeline-item">
                    <span class="timeline-time">${t.time}</span>
                    <span class="timeline-content"><strong>${t.status}</strong> by ${t.updatedBy} (${t.role}) ${backtrackTag}</span>
                </div>`;
        });
    }
    timelineHtml += '</div>';

    card.innerHTML = `
        <div class="order-summary-row" onclick="toggleOrderDetails('${order.id}')">
            <div class="order-summary-meta">
                <strong>${order.id} • ₱${order.total.toFixed(2)} (${order.paymentMethod || 'COD'})</strong>
                <span class="subtext">Buyer: ${buyerUser.name} (${buyerUser.province}) • Farmer: ${farmerUser.farmName || farmerUser.name} (${farmerUser.province})</span>
            </div>
            <div>
                <span class="badge-outline">${order.status}</span>
                <button type="button" class="btn-secondary btn-sm" style="margin-left:8px;">▼ Details & Timeline</button>
            </div>
        </div>

        <div id="order-details-pane-${order.id}" class="order-details-pane hidden">
            <p><strong>Items Ordered:</strong> ${itemsSummary}</p>
            <p><strong>Pickup Farm Origin:</strong> 📍 ${farmerUser.address} (Phone: ${farmerUser.phone})</p>
            <p><strong>Delivery Destination:</strong> 🏠 ${order.address} (Phone: ${order.buyerPhone})</p>
            <p><strong>COD Collectible Total:</strong> <strong style="color:var(--primary-green);">₱${order.total.toFixed(2)}</strong></p>
            ${cancelBtnHtml}
            ${controlsHtml}
            <div style="display:flex; gap:8px; margin-top:8px;">${msgShortcutsHtml}</div>
            ${timelineHtml}
        </div>`;

    return card;
}

function toggleOrderDetails(orderId) {
    const pane = document.getElementById(`order-details-pane-${orderId}`);
    if (pane) pane.classList.toggle('hidden');
}

function submitStatusUpdate(orderId, newStatus) {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) return;

    const pipelineStages = [
        "Order Placed",
        "Order Received",
        "Packing Order",
        "Ready for Courier Pick-up",
        "Rider on the way for Pickup",
        "Picking-up Package",
        "Package Acquired",
        "Delivering to Warehouse",
        "Delivered to Warehouse",
        "Received Package in Sortation Center",
        "Sorting & Quality Inspection Complete",
        "Dispatched to Last-Mile Rider",
        "Exited Sortation Center",
        "Rider on the way to Deliver your Package",
        "Rider is near your Location",
        "Package Delivered"
    ];

    const currentIdx = pipelineStages.indexOf(order.status);
    const newIdx = pipelineStages.indexOf(newStatus);

    let reason = null;

    // Strict Pipeline Check: Backtracking requires reason, skipping not allowed
    if (newIdx < currentIdx) {
        reason = prompt(`You are reverting order status backward from "${order.status}" to "${newStatus}".

Please enter the reason for backtracking (e.g. "Rider vehicle delay", "Address re-verification required"):`);
        if (!reason || !reason.trim()) {
            alert("Status update cancelled. A valid reason is required to revert order status backward.");
            renderOrdersList();
            if (session.role === 'transpo_company') renderTranspoOrders();
            if (session.role === 'transpo_rider') renderRiderDashboard();
            return;
        }
    } else if (newIdx > currentIdx + 1) {
        alert("Please follow the sequential order tracking pipeline. You cannot skip stages in the dispatch process.");
        renderOrdersList();
        if (session.role === 'transpo_company') renderTranspoOrders();
        if (session.role === 'transpo_rider') renderRiderDashboard();
        return;
    }

    order.status = newStatus;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let roleName = "User";
    if (session.role === 'farmer') roleName = "Farmer";
    else if (session.role === 'transpo_company') roleName = "Sortation Hub";
    else if (session.role === 'transpo_rider') roleName = "Courier Rider";

    order.timeline.push({
        status: newStatus,
        time: now,
        updatedBy: session.name,
        role: roleName,
        reason: reason ? reason.trim() : null
    });

    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    renderOrdersList();
    if (session.role === 'transpo_company') renderTranspoOrders();
    if (session.role === 'transpo_rider') renderRiderDashboard();

    alert(`Order ${orderId} updated to "${newStatus}"!`);
}

function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    let orders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const canCancel = (order.status === "Order Placed" || order.status === "Order Received" || order.status === "Packing Order");
    if (!canCancel) {
        alert("Order cannot be cancelled once it is prepared or handed over to the courier.");
        return;
    }

    // Restore Stock
    if (order.items) {
        order.items.forEach(item => {
            let p = products.find(prod => prod.id === item.id);
            if (p) p.stock += item.qty;
        });
    }

    order.status = "Cancelled";
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    order.timeline.push({
        status: "Cancelled",
        time: now,
        updatedBy: session.name,
        role: "Buyer",
        reason: "Cancelled by buyer"
    });

    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    renderOrdersList();
    renderMarketplace();
    alert("Order cancelled successfully. Quantities restored to farm inventory.");
}

// ACCOUNT PROFILE MANAGEMENT
function toggleAccountModal() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session) {
        document.getElementById('acc-name').value = session.name;
        document.getElementById('acc-email').value = session.email;
        document.getElementById('acc-phone').value = session.phone || '';
        document.getElementById('acc-desc').value = session.desc || '';
        document.getElementById('acc-password').value = session.password;

        let roleText = 'Buyer / Consumer';
        if (session.role === 'farmer') roleText = 'Farmer / Producer';
        else if (session.role === 'transpo_company') roleText = 'Transportation Company';
        else if (session.role === 'transpo_rider') roleText = 'Courier Rider';

        document.getElementById('acc-role').value = roleText;

        const farmNameContainer = document.getElementById('acc-farm-name-container');
        if (session.role === 'farmer') {
            farmNameContainer.classList.remove('hidden');
            document.getElementById('acc-farm-name').value = session.farmName || `${session.name}'s Organic Farm`;
        } else {
            farmNameContainer.classList.add('hidden');
        }

        // Set PSGC Address
        if (session.region) {
            document.getElementById('acc-region').value = session.region;
            onRegionChange('acc');
            if (session.province) {
                document.getElementById('acc-province').value = session.province;
                onProvinceChange('acc');
                if (session.city) {
                    document.getElementById('acc-city').value = session.city;
                }
            }
        }
        document.getElementById('acc-street').value = session.street || '';
    }
    document.getElementById('account-modal').classList.toggle('hidden');
}

function handleSaveAccount(e) {
    e.preventDefault();
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) return;

    const newName = document.getElementById('acc-name').value.trim();
    const newPhone = document.getElementById('acc-phone').value.trim();
    const newDesc = document.getElementById('acc-desc').value.trim();
    const newPass = document.getElementById('acc-password').value.trim();

    const region = document.getElementById('acc-region').value;
    const province = document.getElementById('acc-province').value;
    const city = document.getElementById('acc-city').value;
    const street = document.getElementById('acc-street').value.trim();

    if (!region || !province || !city || !street) {
        alert("Please complete all location address dropdown fields!");
        return;
    }

    const fullAddress = `${street}, ${city}, ${province}, ${region}`;

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const idx = users.findIndex(u => u.email === session.email);

    if (idx !== -1) {
        users[idx].name = newName;
        users[idx].phone = newPhone;
        users[idx].desc = newDesc;
        users[idx].password = newPass;
        users[idx].region = region;
        users[idx].province = province;
        users[idx].city = city;
        users[idx].street = street;
        users[idx].address = fullAddress;

        session.name = newName;
        session.phone = newPhone;
        session.desc = newDesc;
        session.password = newPass;
        session.region = region;
        session.province = province;
        session.city = city;
        session.street = street;
        session.address = fullAddress;

        if (session.role === 'farmer') {
            const farmNameVal = document.getElementById('acc-farm-name').value.trim();
            users[idx].farmName = farmNameVal || `${newName}'s Organic Farm`;
            session.farmName = users[idx].farmName;
        }

        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        checkSession();
        toggleAccountModal();
        alert("Account profile settings updated successfully!");
    }
}

// DIRECT MESSAGING
function toggleMessagesModal() {
    const modal = document.getElementById('messages-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        renderConversationsList();
        if (activeChatEmail) {
            renderChatThread(activeChatEmail);
        }
    }
}

function initiateChatFromModal() {
    if (!currentModalProductId) return;
    const products = JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
    const p = products.find(prod => prod.id === currentModalProductId);
    if (!p) return;

    toggleProductModal();
    openChatWith(p.farmerEmail, p.farmName || p.farm, 'farmer', `Hi! I have a question about your produce listing "${p.title}".`);
}

function openChatWith(email, name, role, initialMessage = null) {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) {
        alert("Please log in to send private messages.");
        return;
    }

    if (session.email === email) {
        alert("You cannot message yourself.");
        return;
    }

    activeChatEmail = email;

    if (initialMessage) {
        sendDirectMessage(session.email, session.name, session.role, email, name, role, initialMessage);
    }

    const modal = document.getElementById('messages-modal');
    modal.classList.remove('hidden');

    renderConversationsList();
    renderChatThread(email);
}

function sendDirectMessage(senderEmail, senderName, senderRole, receiverEmail, receiverName, receiverRole, text) {
    const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
    const newMsg = {
        id: Date.now(),
        senderEmail,
        senderName,
        senderRole,
        receiverEmail,
        receiverName,
        receiverRole,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
    };

    messages.push(newMsg);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    updateUnreadMessagesCount();
}

function renderConversationsList() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const container = document.getElementById('conversations-list');
    container.innerHTML = '';

    if (!session) return;

    const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
    const contactsMap = {};

    messages.forEach(m => {
        if (m.senderEmail === session.email) {
            if (!contactsMap[m.receiverEmail]) {
                contactsMap[m.receiverEmail] = {
                    email: m.receiverEmail,
                    name: m.receiverName,
                    role: m.receiverRole,
                    lastMsg: m.text,
                    time: m.timestamp,
                    unread: 0
                };
            } else {
                contactsMap[m.receiverEmail].lastMsg = m.text;
                contactsMap[m.receiverEmail].time = m.timestamp;
            }
        } else if (m.receiverEmail === session.email) {
            if (!contactsMap[m.senderEmail]) {
                contactsMap[m.senderEmail] = {
                    email: m.senderEmail,
                    name: m.senderName,
                    role: m.senderRole,
                    lastMsg: m.text,
                    time: m.timestamp,
                    unread: m.read ? 0 : 1
                };
            } else {
                contactsMap[m.senderEmail].lastMsg = m.text;
                contactsMap[m.senderEmail].time = m.timestamp;
                if (!m.read) contactsMap[m.senderEmail].unread += 1;
            }
        }
    });

    const contacts = Object.values(contactsMap);

    if (contacts.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; padding:1rem; text-align:center;">No direct message threads yet. Click "Message Farmer" or "Message Buyer" to start chatting!</p>`;
        return;
    }

    contacts.forEach(c => {
        const item = document.createElement('div');
        item.className = `conversation-item ${activeChatEmail === c.email ? 'active' : ''}`;
        item.onclick = () => {
            activeChatEmail = c.email;
            renderConversationsList();
            renderChatThread(c.email);
        };

        item.innerHTML = `
            <div class="conv-info">
                <strong>${c.name} <span class="role-badge-sm">${c.role}</span></strong>
                <p class="conv-preview">${c.lastMsg}</p>
            </div>`;
        container.appendChild(item);
    });
}

function renderChatThread(targetEmail) {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session || !targetEmail) return;

    let messages = JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const targetUser = users.find(u => u.email === targetEmail) || { name: targetEmail, role: 'User' };

    document.getElementById('chat-recipient-name').innerText = targetUser.name;
    document.getElementById('chat-recipient-role').innerText = `Role: ${targetUser.role} • ${targetUser.province || 'Philippines'}`;

    // Mark as read
    messages.forEach(m => {
        if (m.senderEmail === targetEmail && m.receiverEmail === session.email) {
            m.read = true;
        }
    });
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    updateUnreadMessagesCount();

    const body = document.getElementById('messages-body');
    body.innerHTML = '';

    const thread = messages.filter(m => 
        (m.senderEmail === session.email && m.receiverEmail === targetEmail) ||
        (m.senderEmail === targetEmail && m.receiverEmail === session.email)
    );

    if (thread.length === 0) {
        body.innerHTML = `<div class="empty-chat-placeholder">💬 Start your private conversation with ${targetUser.name}.</div>`;
        return;
    }

    thread.forEach(m => {
        const isSent = m.senderEmail === session.email;
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${isSent ? 'sent' : 'received'}`;
        bubble.innerHTML = `
            <div>${m.text}</div>
            <small style="font-size:0.7rem; opacity:0.8; display:block; text-align:right; margin-top:2px;">${m.timestamp}</small>`;
        body.appendChild(bubble);
    });

    body.scrollTop = body.scrollHeight;
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const input = document.getElementById('chat-input-text');
    const text = input.value.trim();

    if (!session || !activeChatEmail || !text) return;

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const targetUser = users.find(u => u.email === activeChatEmail) || { name: activeChatEmail, role: 'User' };

    sendDirectMessage(
        session.email, 
        session.name, 
        session.role, 
        activeChatEmail, 
        targetUser.name, 
        targetUser.role, 
        text
    );

    input.value = '';
    renderConversationsList();
    renderChatThread(activeChatEmail);
}

function updateUnreadMessagesCount() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    const badge = document.getElementById('messages-badge');

    if (!session || !badge) return;

    const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY)) || [];
    const unread = messages.filter(m => m.receiverEmail === session.email && !m.read).length;

    if (unread > 0) {
        badge.innerText = unread;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}
