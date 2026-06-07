// Extracted verbatim from arcanum-41.html (city generation tables). Do not edit by hand.
export interface DistrictTemplate { name: string; desc: string; }
export interface BoardTemplate { type: string; text: string; }
export const CITY_NAME_PREFIXES: string[] = ['Brom','Caer','Dun','Eas','Fal','Gran','Hav','Iron','Kal','Lor','Mor','Nor','Oak','Por','Rav','Ser','Thar','Ulm','Val','Wyn','Ash','Black','Bright','Cold','Dark','Deep','East','Far','Fel','Frost','Gold','Grim','Hawk','High','Hollow','Iron','Lake','Long','Moon','North','Pine','Raven','River','Rock','Salt','Sand','Shadow','Silver','Stone','Storm','Sun','Tall','Thorn','West','White','Wild','Wind','Wolf','Wood'];

export const CITY_NAME_SUFFIXES: string[] = ['burgo','castillo','chester','crest','cross','dale','field','fold','ford','gate','gard','glade','grove','hall','hammer','harbour','haven','helm','hill','hold','holm','hope','keep','ley','main','marsh','meadow','mire','moor','mouth','peak','port','reach','rest','ridge','rock','run','shire','shore','spire','stead','stone','strand','tide','tower','vale','vard','watch','well','wick','wold','wood','wych'];

export const CITY_NAME_CONNECTORS: string[] = [' del ',' de ',' sobre ','-en-',' junto al ',' bajo el ',''];

export const CITY_NAME_PLACES: string[] = ['Río','Bosque','Monte','Valle','Cerro','Lago','Pantano','Risco','Acantilado','Norte','Sur','Bosque Oscuro','Marca','Camino Rojo','Camino del Rey','Roca','Espada','Cuervos','Águilas','Llano','Mar','Tormenta','Crepúsculo','Vado','Pino'];

export const CITY_MOTTOS: string[] = [
  'El acero se templa al fuego',
  'Donde la luz nunca muere',
  'La piedra recuerda',
  'Bajo las estrellas y los dioses',
  'Defenderemos hasta el último',
  'El comercio es la vida',
  'Honor sobre el oro',
  'Donde el viento canta',
  'La marea siempre vuelve',
  'Lo viejo nos protege',
  'Forjados en la adversidad',
  'Las raíces sostienen',
  'Que ningún hambre llegue',
  'La libertad es la única ley',
  'En la fe encontraremos refugio',
  'El silencio guarda secretos',
  'Las puertas nunca se cierran',
  'Los caminos llevan a casa',
];

export const CITY_DISTRICT_TEMPLATES: Record<string, DistrictTemplate> = {
  mercado:       { name:'Mercado',           desc:'El corazón comercial: puestos de comerciantes, gritos de vendedores, olores de especias y carne.' },
  bajos:         { name:'Barrios bajos',     desc:'Callejones estrechos, pobreza, mendigos y nidos de ratas. Aquí se esconden secretos.' },
  templo:        { name:'Distrito sagrado',  desc:'Templos y santuarios elevados, sacerdotes y peregrinos, campanas a primera hora.' },
  noble:         { name:'Barrio noble',      desc:'Mansiones tras altos muros, guardias armados, jardines con fuentes.' },
  muelles:       { name:'Muelles',           desc:'Barcos atracados, marineros, prostíbulos baratos y tabernas tumultuosas.' },
  artesano:      { name:'Distrito artesano', desc:'Forjas humeantes, telares en movimiento, talleres de carpinteros y zapateros.' },
  oficial:       { name:'Distrito oficial',  desc:'Sede del gobierno, edificios de piedra labrada, escribas y burócratas.' },
  jardines:      { name:'Jardines reales',   desc:'Parques cuidados con estatuas, fuentes y senderos para pasear.' },
  cuartel:       { name:'Cuartel militar',   desc:'Barracones, patio de entrenamiento, soldados patrullando con armadura ruidosa.' },
  academia:      { name:'Distrito académico',desc:'Bibliotecas, salas de estudio, estudiantes apurados con tomos bajo el brazo.' },
  alquimistas:   { name:'Calle de alquimistas',desc:'Olores extraños, humos coloreados saliendo por ventanas, vendedores de pociones.' },
  forastero:     { name:'Barrio extranjero', desc:'Mercaderes y residentes de lejanas tierras, comida exótica y lenguas extrañas.' },
  cementerio:    { name:'Necrópolis',        desc:'Mausoleos, lápidas alineadas, sepultureros taciturnos. Algunos dicen que las tumbas se mueven.' },
  arena:         { name:'Plaza de la arena', desc:'Coliseo o plaza donde se celebran combates, espectáculos sangrientos y apuestas.' },
  zoco:          { name:'El gran zoco',      desc:'Mercado cubierto laberíntico con miles de productos exóticos.' },
  silvanos:      { name:'Refugio silvano',   desc:'Casas construidas con vegetación viva, ríos de savia luminosa, calmado y verde.' },
};

export const CITY_TAVERN_NAMES: string[] = ['El Jabalí Borracho','La Sirena Plateada','El Dragón Dormido','La Espada Oxidada','El Cuervo Gris','La Hoja Rota','El Grifo Risueño','La Doncella del Norte','El Ciervo Coronado','La Posada del Hilo','El Lobo Hambriento','El Caballo Negro','La Torre Caída','El Yunque Llorón','La Estrella Solitaria','El Toro Embestido','La Pluma Manchada','El Faro Apagado','La Bota del Peregrino','El Crisol'];

export const CITY_TEMPLE_NAMES: string[] = ['Santuario de la Luz Eterna','Catedral de los Tres','Capilla del Cuervo','Templo del Yunque Sagrado','Altar de las Estrellas','Monasterio del Silencio','Iglesia de los Antiguos','Templo del Ciclo','Santuario del Río','Capilla de la Espada Caída'];

export const CITY_SHOP_NAMES: string[] = ['La Forja del Alba','Herboristería Las Tres Hojas','Curiosidades de Master Vellan','Armería del Yunque Rojo','Sastrería Brillantina','Joyería Astilla de Sol','Boticario del Búho','Mercería del Hilo de Oro','Galería del Coleccionista','Casa de Empeños del Cuervo','Mapas y Pergaminos Antiguos','Cuchillería del Filo'];

export const CITY_GUILDS_BASE: string[] = [
  'Gremio de Mercaderes','Gremio de Herreros','Gremio de Sastres','Hermandad de Alquimistas','Logia de Magos','Sindicato del Muelle','Hermandad de Aventureros','Gremio de Ladrones','Compañía de Mercenarios','Orden de Sanadores','Cofradía de Cartógrafos','Hermandad de Carpinteros','Gremio de Curtidores','Compañía de Cazadores','Hermandad del Pan'
];

export const CITY_GUILDS_BY_TERRAIN: Record<string, string[]> = {
  costa:       ['Cofradía de Pescadores','Compañía Naviera'],
  isla:        ['Cofradía de Pescadores','Compañía Naviera'],
  archipiélago:['Cofradía de Pescadores','Compañía Naviera','Hermandad de Corsarios'],
  río:         ['Gremio de Barqueros'],
  desierto:    ['Caravaneros del Sol'],
  oasis:       ['Caravaneros del Sol'],
  subterránea: ['Sindicato Minero','Hermandad de Excavadores'],
  montaña:     ['Sindicato Minero'],
  volcán:      ['Sindicato Minero','Hermandad del Fuego Eterno'],
  bosque:      ['Hermandad de Leñadores','Cazadores del Verde'],
  pantano:     ['Recolectores del Limo'],
  tundra:      ['Cazadores del Hielo'],
  flotante:    ['Orden Aeronauta','Hermandad de los Vientos'],
};

export const CITY_RUMOR_TEMPLATES: string[] = [
  'Dicen que {{ser}} {{trama}} en {{lugar}}, {{giro}}.',
  'Se rumorea que {{serPlural}} se reúnen en {{lugar}} cada noche.',
  'Hablan de {{fenomeno}} cerca de {{lugar}} desde hace días.',
  'Cuentan que {{ser}} guarda {{cosa}} en {{lugar}}.',
  'La gente susurra que {{consecuencia}} desde que apareció {{ser}}.',
  'Alguien vio {{fenomeno}} y desde entonces {{consecuencia}}.',
  'Aseguran que {{ser}} {{trama}}, {{giro}}.',
  'Corre la voz de que {{cosa}} ha aparecido en {{lugar}}.',
  'Dicen que quien busque a {{ser}} debe ir a {{lugar}} al anochecer.',
  'Se comenta que {{serPlural}} buscan {{cosa}} por toda la ciudad.',
  'Hay quien jura que {{ser}} {{trama}} y que por eso {{consecuencia}}.',
  'Nadie explica {{fenomeno}}, pero {{ser}} parece saber algo.',
];

export const CITY_BOARD_TEMPLATES: BoardTemplate[] = [
  { type:'búsqueda', text:'<strong>Buscado:</strong> {{nombre}} por {{crimen}}. Recompensa: {{recompensa}} po.' },
  { type:'trabajo',  text:'<strong>Se busca:</strong> grupo de aventureros para {{trabajo}}. Recompensa negociable.' },
  { type:'criatura', text:'<strong>Plaga:</strong> {{criatura}} acechan {{lugar}}. Pago por cabeza confirmada.' },
  { type:'caravana', text:'<strong>Escolta:</strong> caravana parte hacia {{destino}} mañana. Necesita guardias.' },
  { type:'desaparecido', text:'<strong>Desaparecido:</strong> {{nombre}}, visto por última vez en {{lugar}}.' },
  { type:'recoger', text:'<strong>Recolectar:</strong> {{cantidad}} {{material}} para entregar al gremio.' },
  { type:'investigar', text:'<strong>Investigar:</strong> sucesos extraños en {{lugar}}. Se paga por información.' },
];

export const CITY_CRIMES: string[] = ['robo','asesinato','traición','herejía','falsificación de moneda','desertar del ejército','estafa','contrabando','asalto'];

export const CITY_TRABAJOS: string[] = ['vaciar una mina infestada','recuperar un objeto perdido','escoltar a un noble','investigar una desaparición','exterminar plagas','negociar un acuerdo','vigilar un cargamento'];

export const CITY_CRIATURAS_TABLON: string[] = ['lobos','goblins','bandidos','muertos vivientes','arañas gigantes','ogros','kobolds','orcos','trasgos','contrabandistas'];

export const CITY_MATERIALES: string[] = ['hierbas raras','pieles de lobo','minerales preciosos','pergaminos','setas luminosas','plumas de grifo'];

export const CITY_NPC_ROLES_BY_GOVERNMENT: Record<string, string[]> = {
  'monarquía':   ['Señor de la Ciudad','Capitán de la Guardia','Cortesano','Heraldo Real'],
  'consejo':     ['Presidente del Consejo','Concejal Mayor','Capitán de la Guardia','Secretario'],
  'teocracia':   ['Sumo Sacerdote','Inquisidor','Capitán de los Templarios','Oráculo'],
  'gremios':     ['Maestro del Gremio Mercantil','Tesorero','Capitán de la Guardia Mercantil','Inspector'],
  'oligarquía':  ['Patriarca de la Casa Mayor','Matriarca de la Casa Menor','Embajador','Espía Maestro'],
  'sin ley':     ['Líder de la Banda','Jefe del Bajo Mundo','Tabernero Informador','Mercenario Famoso'],
  'militar':     ['General de la Ciudad','Maestre de Armas','Estratego','Intendente'],
  'autoritario': ['Gobernador','Inquisidor','Capitán de la Guardia','Informador'],
};

export const CITY_POPULATION: Record<string, [number, number]> = {
  aldea:     [50, 300],
  pueblo:    [300, 1000],
  villa:     [1000, 6000],
  ciudad:    [6000, 25000],
  metrópoli: [25000, 150000],
};

export const CITY_DISTRICT_COUNT: Record<string, number> = {
  aldea: 1, pueblo: 2, villa: 3, ciudad: 5, metrópoli: 7,
};

export const CITY_DEITIES: string[] = [
  'el Sol Naciente, patrón de los viajeros y la verdad, con templos abiertos al amanecer',
  'la Dama Gris, diosa del luto y los secretos, venerada en susurros',
  'el Yunque Eterno, dios de la forja y los juramentos, popular entre artesanos',
  'la Madre Verde, espíritu de las cosechas y los bosques cercanos',
  'el Señor de las Mareas, al que los marineros ofrendan antes de zarpar',
  'los Tres Hermanos, una tríada de guerra, comercio y muerte',
  'la Llama Oculta, culto al conocimiento prohibido tolerado a regañadientes',
  'el Guardián Silencioso, protector ancestral cuya estatua vigila la entrada',
  'ningún dios oficial: la ciudad es escéptica y desconfía del clero',
  'una deidad local menor, casi desconocida fuera de estas murallas',
];

export const CITY_SHADOW_FACTIONS: string[] = [
  'una red de contrabandistas que controla lo que entra y sale sin pagar impuestos',
  'una sociedad secreta de nobles que mueve los hilos del gobierno',
  'un culto clandestino que gana adeptos entre los desesperados',
  'un sindicato del crimen que se reparte los barrios con precisión',
  'espías de una potencia extranjera infiltrados en puestos clave',
  'una hermandad de magos que actúa al margen de la ley',
  'un grupo de revolucionarios que prepara el derrocamiento del poder actual',
  'una orden de asesinos que acepta encargos a quien pueda pagarlos',
  'mercaderes corruptos que manipulan los precios del grano a su antojo',
  'una facción religiosa que conspira para imponer su fe por la fuerza',
];

export const CITY_CURRENT_EVENTS: string[] = [
  'se celebra una feria anual que atrae a forasteros de toda la región',
  'una epidemia leve mantiene a parte de la población en cuarentena',
  'acaba de morir una figura importante y la sucesión está en disputa',
  'corren rumores de guerra y se recluta a jóvenes para la milicia',
  'una sequía o mala cosecha ha disparado el precio de la comida',
  'un juicio sonado tiene a toda la ciudad pendiente del veredicto',
  'la llegada de una caravana o flota ha llenado las calles de actividad',
  'un festival religioso obliga a cerrar comercios durante varios días',
  'una serie de robos sin resolver tiene a la guardia desbordada',
  'se prepara una boda o coronación que paralizará la ciudad pronto',
  'un fenómeno extraño en el cielo alimenta presagios y supersticiones',
];

export const CITY_FOUNDINGS: string[] = [
  'fue fundada por refugiados que huían de una guerra olvidada',
  'creció alrededor de un antiguo fuerte que aún domina el centro',
  'nació como puesto comercial y nunca dejó de crecer',
  'se levantó sobre las ruinas de una ciudad mucho más antigua',
  'fue erigida por orden de un rey que quiso una capital nueva',
  'comenzó como asentamiento minero tras hallarse un filón valioso',
  'la fundó una orden religiosa en torno a un lugar sagrado',
  'surgió donde se cruzan dos rutas comerciales importantes',
  'fue colonia de un imperio caído cuyas leyes aún perviven a medias',
  'nadie recuerda quién la fundó; es más vieja que sus propios archivos',
];

export const GUILD_LEADER_TITLES: string[] = ['Maestre','Gran Maestre','Archón','Preboste','Síndico','Decano','Patrón','Magistrado','Guardián','Capataz','Cónsul','Regente','Custodio','Comendador'];

export const GUILD_LEADER_TRAITS: string[] = [
  'gobierna con mano de hierro y nadie cuestiona sus decisiones',
  'es justo pero implacable con los traidores',
  'compra lealtades en lugar de ganarlas',
  'lleva décadas en el cargo y se resiste a soltarlo',
  'ascendió hace poco y aún se gana el respeto de los veteranos',
  'delega casi todo en su lugarteniente mientras disfruta de los lujos',
  'es venerado por los miembros como un padre o madre',
  'oculta una enfermedad que pronto lo retirará',
  'mantiene el poder gracias a información comprometedora sobre otros',
  'es un títere de intereses mayores que actúan en la sombra',
];

export const GUILD_SEDES: string[] = [
  'una casona de piedra con el emblema del gremio sobre la puerta',
  'un edificio modesto que esconde sótanos sorprendentemente amplios',
  'la planta alta de una taberna concurrida',
  'un almacén reconvertido junto a los muelles',
  'una torre estrecha de varias plantas en el centro',
  'una mansión heredada de un mecenas ya fallecido',
  'un local discreto sin letrero, solo conocido por iniciados',
  'unos antiguos baños públicos restaurados',
  'una sala alquilada en el edificio del consejo',
  'un complejo amurallado con patio y herrería propia',
];

export const GUILD_SERVICES_POOL: string[] = [
  'formación de aprendices a cambio de años de servicio',
  'préstamos con intereses razonables para miembros',
  'cartas de recomendación que abren puertas en otras ciudades',
  'acceso a un almacén común de materiales',
  'protección física ante disputas y amenazas',
  'mediación en conflictos comerciales',
  'venta de productos exclusivos solo a afiliados',
  'una red de contactos en ciudades vecinas',
  'alojamiento temporal para miembros de paso',
  'información privilegiada sobre oportunidades de negocio',
  'reparación y mantenimiento de equipo a bajo coste',
  'representación legal ante las autoridades',
];

export const GUILD_FEES: string[] = [
  'una cuota mensual modesta y un juramento de lealtad',
  'un pago inicial elevado pero sin cuotas posteriores',
  'un porcentaje de cada trabajo realizado',
  'un favor pendiente que el gremio reclamará cuando quiera',
  'demostrar valía completando una prueba de ingreso',
  'el patrocinio de dos miembros veteranos',
  'la entrega de un secreto valioso como garantía',
  'nada de oro, pero sí servicio exclusivo durante un año',
];

export const GUILD_SECRETS: string[] = [
  'blanquea dinero de actividades ilícitas a través de sus cuentas',
  'tiene un pacto secreto con un gremio rival que finge odiar',
  'esconde a un fugitivo importante entre sus miembros',
  'su verdadero líder no es quien aparenta serlo',
  'guarda un objeto mágico robado en sus bóvedas',
  'está infiltrado por espías de una potencia extranjera',
  'celebra ritos prohibidos en honor a una entidad olvidada',
  'falsifica documentos y sellos oficiales por encargo',
  'planea absorber o destruir a un gremio competidor',
  'debe enormes sumas a un prestamista peligroso',
  'oculta que su fundador sigue vivo y manipula todo en secreto',
  'controla en la sombra a varios cargos del gobierno local',
];

export const GUILD_QUESTS: string[] = [
  'recuperar un cargamento robado antes de que se sepa la pérdida',
  'escoltar a un miembro importante hasta una ciudad lejana',
  'sabotear discretamente las operaciones de un rival',
  'investigar quién está filtrando los secretos del gremio',
  'recuperar una deuda de un cliente que se ha vuelto peligroso',
  'encontrar a un aprendiz desaparecido en circunstancias extrañas',
  'conseguir un material raro que solo se halla en lugares peligrosos',
  'limpiar la reputación del gremio tras un escándalo reciente',
  'proteger un envío durante una ruta infestada de bandidos',
  'eliminar a un impostor que usa el nombre del gremio para estafar',
];

export const GUILD_RIVALRIES: string[] = [
  'mantiene una rivalidad abierta y conocida por todos',
  'colabora en secreto pese a las apariencias hostiles',
  'compite por los mismos contratos y clientes',
  'firmó una tregua incómoda que nadie espera que dure',
  'le debe un favor antiguo que aún no ha saldado',
  'intenta absorberlo discretamente comprando a sus miembros',
  'comparte un enemigo común que los obliga a entenderse',
  'lo desprecia por motivos que se remontan a generaciones atrás',
];

export const QUEST_PATRONS: string[] = [
  'un mercader nervioso que mira constantemente por encima del hombro',
  'una anciana vestida de luto que apenas alza la voz',
  'un oficial de la guardia que prefiere no usar canales oficiales',
  'un noble que envía a un sirviente para no dar la cara',
  'un sacerdote preocupado por algo que no quiere detallar en público',
  'un niño que entrega una nota sellada de parte de alguien sin nombre',
  'un tabernero que ha oído demasiadas cosas y quiere resolverlas',
  'un cazador de recompensas que necesita refuerzos',
  'una maga retirada que ofrece pago en componentes raros',
  'un gremio que prefiere mantener su nombre fuera del asunto',
  'un campesino que ha vendido todo lo que tenía para pagar esto',
  'un forastero de acento extraño con bolsa generosa',
];

export const QUEST_CONTEXTS: string[] = [
  'el problema lleva semanas creciendo y las autoridades lo ignoran',
  'ya se intentó resolver antes y el grupo anterior no regresó',
  'hay un plazo: si no se actúa antes de la próxima luna, será tarde',
  'nadie más se atreve a aceptarlo por miedo a las represalias',
  'la recompensa subió de golpe, lo que hace sospechar que es peor de lo que parece',
  'el asunto está conectado con otros sucesos recientes en la ciudad',
  'se exige discreción absoluta; no debe saberse quién lo encargó',
  'el lugar señalado tiene mala fama desde hace generaciones',
];

export const QUEST_COMPLICATIONS: string[] = [
  'el objetivo real es distinto del que figura en el anuncio',
  'otra facción busca lo mismo y no se detendrá ante nada',
  'el cliente oculta información crucial que pondrá al grupo en peligro',
  'hay un traidor o informador metido en el asunto',
  'lo que parecía un monstruo resulta ser una persona desesperada',
  'cumplir el encargo desatará un problema aún mayor',
  'el pago prometido no existe o el cliente no puede permitírselo',
  'las autoridades consideran ilegal lo que se pide hacer',
  'el lugar está protegido por trampas o magia antigua',
  'un aliado inesperado aparece pidiendo unirse... con su propia agenda',
];

export const QUEST_REWARDS: string[] = [
  'oro contante y sonante, pagado a la entrega',
  'un objeto mágico menor de la colección del cliente',
  'un favor futuro de alguien con mucho poder',
  'información valiosa sobre otro misterio de la ciudad',
  'acceso a un lugar o círculo normalmente cerrado',
  'un mapa hacia algo mayor',
  'la propiedad de un edificio o terreno abandonado',
  'el perdón de una deuda o de un delito menor',
];

export const QUEST_TWISTS: string[] = [
  'el verdadero villano es quien encargó la misión',
  'completarla beneficia en secreto a un enemigo del grupo',
  'una de las víctimas pedirá venganza más adelante',
  'el objeto recuperado está maldito o vigilado',
  'el éxito convierte al grupo en blanco de una facción poderosa',
  'lo resuelto revela un secreto incómodo sobre un aliado',
  'la recompensa atrae a ladrones que querrán arrebatarla',
  'un superviviente recordará los rostros del grupo para bien o para mal',
];

export const DISTRICT_STREETS: string[] = [
  'una calle principal empedrada que cruje de actividad a todas horas',
  'callejones serpenteantes donde es fácil perderse',
  'una plaza central con una fuente o estatua como punto de encuentro',
  'pasajes cubiertos que protegen del clima a comerciantes y paseantes',
  'una avenida ancha flanqueada por árboles o faroles',
  'escaleras de piedra que suben entre casas apiñadas',
  'muelles de madera y pasarelas sobre el agua',
  'túneles y galerías que conectan los edificios por debajo',
];

export const DISTRICT_LANDMARKS: string[] = [
  'un viejo pozo del que la gente evita beber sin decir por qué',
  'una estatua a la que los lugareños dejan ofrendas',
  'un árbol enorme que es más antiguo que la propia ciudad',
  'un edificio quemado que nadie ha reconstruido',
  'un reloj o campanario que marca las horas de forma peculiar',
  'un mercadillo improvisado que aparece y desaparece',
  'una puerta tapiada que despierta toda clase de rumores',
  'un mural desvaído que cuenta una historia olvidada',
];

export const DISTRICT_LOCALS: string[] = [
  'una vendedora ambulante que lo sabe todo de todos',
  'un guardia veterano cansado de su ronda',
  'un crío espabilado que hace de mensajero por unas monedas',
  'un anciano que se sienta siempre en el mismo sitio a observar',
  'un artesano orgulloso de su oficio y celoso de sus secretos',
  'un mendigo que finge más miseria de la que tiene',
  'una sacerdotisa local muy querida por el vecindario',
  'un tendero rumoroso que alarga cada conversación',
];

export const DISTRICT_DANGERS: string[] = [
  'carteristas que trabajan en grupo entre la multitud',
  'una banda que cobra "protección" a los comercios',
  'estructuras viejas que amenazan con derrumbarse',
  'un punto donde varias personas han desaparecido sin explicación',
  'reyertas frecuentes al caer la noche',
  'algo que merodea por las alcantarillas justo debajo',
  'un timador que estafa a los recién llegados',
  'tensión a punto de estallar entre dos facciones del barrio',
];

export const DISTRICT_ATMOS: string[] = [
  'huele a pan recién hecho y a humo de leña',
  'resuena con el martilleo constante de los talleres',
  'está siempre en penumbra aunque sea de día',
  'rebosa de música, risas y discusiones',
  'guarda un silencio que pone los pelos de punta',
  'apesta a pescado, sal y brea',
  'brilla con luces mágicas de colores imposibles',
  'está cubierto de una fina capa de polvo o ceniza',
];
