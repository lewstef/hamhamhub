export const ROMANIAN_COUNTIES: string[] = [
  "Alba",
  "Arad",
  "Argeș",
  "Bacău",
  "Bihor",
  "Bistrița-Năsăud",
  "Botoșani",
  "Brașov",
  "Brăila",
  "București",
  "Buzău",
  "Caraș-Severin",
  "Călărași",
  "Cluj",
  "Constanța",
  "Covasna",
  "Dâmbovița",
  "Dolj",
  "Galați",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomița",
  "Iași",
  "Ilfov",
  "Maramureș",
  "Mehedinți",
  "Mureș",
  "Neamț",
  "Olt",
  "Prahova",
  "Satu Mare",
  "Sălaj",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timiș",
  "Tulcea",
  "Vaslui",
  "Vâlcea",
  "Vrancea",
];

export const ROMANIAN_LOCALITIES_BY_COUNTY: Record<string, string[]> = {
  Alba: ["Alba Iulia", "Sebeș", "Aiud", "Cugir", "Blaj", "Ocna Mureș", "Zlatna", "Câmpeni", "Teiuș", "Abrud"],
  Arad: ["Arad", "Înneu", "Lipova", "Pâncota", "Sebiș", "Curtici", "Sântana", "Pecica", "Nădlac", "Vinga"],
  Argeș: ["Pitești", "Mioveni", "Câmpulung", "Curtea de Argeș", "Ștefănești", "Costești", "Topoloveni", "Bascov"],
  Bacău: ["Bacău", "Onești", "Moinești", "Comănești", "Buhuși", "Dărmănești", "Târgu Ocna", "Slănic-Moldova"],
  Bihor: ["Oradea", "Salonta", "Marghita", "Beiuș", "Aleșd", "Valea lui Mihai", "Ștei", "Săcueni", "Sânmartin"],
  "Bistrița-Năsăud": ["Bistrița", "Năsăud", "Beclean", "Sângeorz-Băi", "Felruac", "Maieru"],
  Botoșani: ["Botoșani", "Dorohoi", "Săveni", "Darabani", "Ștefănești", "Bucecea", "Flămânzi"],
  Brașov: ["Brașov", "Făgăraș", "Săcele", "Zărnești", "Codlea", "Râșnov", "Predeal", "Ghimbav", "Rupea", "Victoria", "Cristian"],
  Brăila: ["Brăila", "Ianca", "Însurăței", "Făurei"],
  București: ["București", "Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6"],
  Buzău: ["Buzău", "Râmnicu Sărat", "Nehoiu", "Pătârlagele", "Pogoanele"],
  "Caraș-Severin": ["Reșița", "Caransebeș", "Bocșa", "Oravița", "Moldova Nouă", "Oțelu Roșu", "Anina", "Băile Herculane"],
  Călărași: ["Călărași", "Oltenița", "Budești", "Fundulea", "Lehliu Gară"],
  Cluj: ["Cluj-Napoca", "Turda", "Dej", "Câmpia Turzii", "Gherla", "Huedin", "Florești", "Apahida", "Baciu", "Gilău", "Jucu"],
  Constanța: ["Constanța", "Mangalia", "Medgidia", "Năvodari", "Cernavodă", "Ovidiu", "Eforie", "Techirghiol", "Hârșova", "Murfatlar"],
  Covasna: ["Sfântu Gheorghe", "Târgu Secuiesc", "Covasna", "Baraolt", "Întorsura Buzăului"],
  Dâmbovița: ["Târgoviște", "Moreni", "Pucioasa", "Găești", "Titu", "Fieni", "Răcari"],
  Dolj: ["Craiova", "Băilești", "Calafat", "Filiași", "Dăbuleni", "Segarcea", "Bechet"],
  Galați: ["Galați", "Tecuci", "Târgu Bujor", "Berești"],
  Giurgiu: ["Giurgiu", "Bolintin-Vale", "Mihăilești"],
  Gorj: ["Târgu Jiu", "Motru", "Rovinari", "Bumbești-Jiu", "Târgu Cărbunești", "Țicleni", "Novaci", "Tismana"],
  Harghita: ["Miercurea Ciuc", "Odorheiu Secuiesc", "Gheorgheni", "Toplița", "Cristuru Secuiesc", "Băile Tușnad", "Borsec", "Vlăhița"],
  Hunedoara: ["Deva", "Hunedoara", "Petroșani", "Vulcan", "Lupeni", "Petrila", "Orăștie", "Brad", "Simeria", "Călan", "Hațeg"],
  Ialomița: ["Slobozia", "Fetești", "Urziceni", "Amara", "Fierbinți-Târg"],
  Iași: ["Iași", "Pașcani", "Hârlău", "Târgu Frumos", "Podu Iloaiei", "Miroslava", "Ciurea", "Valea Lupului", "Rediu"],
  Ilfov: ["Voluntari", "Otopeni", "Buftea", "Pantelimon", "Popești-Leordeni", "Bragadiru", "Chitila", "Măgurele", "Ștefăneștii de Jos", "Chiajna", "Snagov", "Corbeanca", "Balotești", "Tunari", "Domnești"],
  Maramureș: ["Baia Mare", "Sighetu Marmației", "Borșa", "Vișeu de Sus", "Baia Sprie", "Șomcuta Mare", "Tăuții-Măgherăuș", "Cavnic", "Seini"],
  Mehedinți: ["Drobeta-Turnu Severin", "Orșova", "Strehaia", "Vânju Mare", "Baia de Aramă"],
  Mureș: ["Târgu Mureș", "Reghin", "Sighișoara", "Târnăveni", "Luduș", "Sovata", "Iernut", "Sărmașu", "Ungheni", "Miercurea Nirajului"],
  Neamț: ["Piatra Neamț", "Roman", "Târgu Neamț", "Bicaz", "Roznov"],
  Olt: ["Slatina", "Caracal", "Balș", "Corabia", "Scornicești", "Drăgănești-Olt", "Piatra-Olt", "Potcoava"],
  Prahova: ["Ploiești", "Câmpina", "Băicoi", "Breaza", "Mizil", "Comarnic", "Vălenii de Munte", "Sinaia", "Bușteni", "Azuga", "Urlați", "Boldești-Scăeni", "Plopeni", "Slănic"],
  "Satu Mare": ["Satu Mare", "Carei", "Negrești-Oaș", "Tășnad", "Livada", "Ardud"],
  Sălaj: ["Zalău", "Șimleu Silvaniei", "Jibou", "Cehu Silvaniei"],
  Sibiu: ["Sibiu", "Mediaș", "Cisnădie", "Avrig", "Agnita", "Dumbrăveni", "Tălmaciu", "Copșa Mică", "Miercurea Sibiului", "Săliște"],
  Suceava: ["Suceava", "Fălticeni", "Rădăuți", "Câmpulung Moldovenesc", "Vatra Dornei", "Gura Humorului", "Siret", "Vicovu de Sus", "Dolhasca", "Liteni", "Salcea"],
  Teleorman: ["Alexandria", "Roșiori de Vede", "Turnu Măgurele", "Zimnicea", "Videle"],
  Timiș: ["Timișoara", "Lugoj", "Sânnicolau Mare", "Jimbolia", "Recaș", "Buziaș", "Făget", "Deta", "Gătaia", "Giroc", "Dumbăvița", "Moșnița Nouă"],
  Tulcea: ["Tulcea", "Babadag", "Măcin", "Isaccea", "Sulina"],
  Vaslui: ["Vaslui", "Bârlad", "Huși", "Negrești", "Murgeni"],
  Vâlcea: ["Râmnicu Vâlcea", "Drăgășani", "Băile Olănești", "Brezoi", "Horezu", "Călimănești", "Băile Govora", "Bălcești", "Berbești"],
  Vrancea: ["Focșani", "Adjud", "Mărășești", "Odobești", "Panciu"],
};

/**
 * Returns list of localities for a given Romanian county name.
 * Normalizes input casing/diacritics if exact match is not found.
 */
export function getCountyLocalities(countyName?: string | null): string[] {
  if (!countyName) return [];

  const exact = ROMANIAN_LOCALITIES_BY_COUNTY[countyName];
  if (exact) return exact;

  const normalizedInput = normalizeString(countyName);
  const key = Object.keys(ROMANIAN_LOCALITIES_BY_COUNTY).find(
    (k) => normalizeString(k) === normalizedInput
  );

  return key ? ROMANIAN_LOCALITIES_BY_COUNTY[key] : [];
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
