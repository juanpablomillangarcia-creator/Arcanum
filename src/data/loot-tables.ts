// Extracted verbatim from arcanum-41.html (loot flavor/item tables). Do not edit by hand.
export interface MagicItem { name: string; effect: string; }

export const LOOT_GEMS: Record<number, string[]> = {
  10:  ['azabache pulido','cuarzo lechoso','ágata veteada','obsidiana negra','malaquita verde','ojo de tigre','lapislázuli','turquesa','cuarzo rosa','hematita gris'],
  50:  ['cornalina anaranjada','calcedonia azulada','citrino dorado','jade pálido','perla irregular','ámbar con un insecto dentro','coral rojo','ónice bandeado','granate oscuro','jaspe sanguíneo'],
  100: ['amatista violeta','cristal de roca puro','aguamarina clara','perla negra','topacio blanco','peridoto verdoso','espinela rosada','jade imperial','ópalo de fuego pequeño','turmalina'],
  500: ['topacio azul profundo','esmeralda con inclusiones','ópalo lechoso con destellos','perla de las profundidades','zafiro estrella','granate de estrella','alejandrita cambiante'],
  1000:['zafiro azul real','esmeralda intensa','ópalo negro iridiscente','rubí palpitante','diamante en bruto','perla negra perfecta'],
  5000:['diamante tallado sin defectos','rubí estrella de sangre','esmeralda del tamaño de un huevo','zafiro de fuego legendario'],
};

export const LOOT_GEM_FLAVORS: string[] = [
  'con una grieta interna que parece una llama congelada',
  'tan pulida que devuelve un reflejo distorsionado',
  'fría al tacto incluso en pleno verano',
  'que zumba débilmente si la acercas al oído',
  'engarzada todavía en un trozo de metal retorcido',
  'con una runa minúscula grabada en una cara',
  'que parece más oscura cuanto más la miras',
  'envuelta en un paño manchado de sangre seca',
  'cuyo brillo cambia según la luz que reciba',
  'con una imperfección que dibuja la silueta de un ojo',
];

export const LOOT_ART: Record<number, string[]> = {
  25:  ['una figurilla de hueso tallado','un brazalete de plata sencillo','un pequeño espejo de mano con marco de latón','una taza ceremonial de cobre','un anillo de bronce con un sello gastado'],
  250: ['un cáliz de plata con incrustaciones de azabache','una máscara de oro de un rostro sereno','un colgante de electro con forma de hoja','un tapiz pequeño bordado en hilo de plata','un brasero de bronce con relieves de dragones'],
  750: ['una corona menor de oro con gemas pequeñas','un cetro ceremonial de marfil','un retrato enmarcado en oro de un noble olvidado','un juego de dados de oro macizo','un guante de gala bordado con perlas'],
  2500:['un collar de oro con un rubí central','una estatuilla de platino de un grifo','una caja de música de oro y esmalte','un peine ceremonial de marfil y zafiros'],
  7500:['una corona real de platino y diamantes','un trono en miniatura de oro macizo','un huevo enjoyado de orfebrería exquisita'],
};

export const LOOT_ART_FLAVORS: string[] = [
  'con el emblema de una casa noble caída',
  'manchado por el tiempo pero aún hermoso',
  'que alguien intentó robar antes sin éxito',
  'con una inscripción en una lengua muerta',
  'ligeramente dañado en un borde',
  'envuelto con cuidado en seda descolorida',
  'que irradia un valor sentimental evidente',
  'con las iniciales de su antiguo dueño',
];

export const LOOT_MUNDANE: Record<string, string[]> = {
  humanoide: ['raciones de viaje a medio comer','una petaca con licor barato','un juego de dados trucados','una carta de amor sin enviar','una llave oxidada sin cerradura conocida','un mapa tosco dibujado a mano','tabaco de pipa en una bolsita','un amuleto de la suerte casero'],
  bandido: ['una máscara de tela raída','ganzúas de calidad','un botín de monedas robadas en bolsas variadas','una lista de futuros objetivos','una daga con muescas de sus víctimas','vendas manchadas','una señal de reconocimiento de la banda'],
  noble: ['un pañuelo de seda perfumado','una invitación a un baile','un peine de marfil','frascos de perfume caro','un abanico pintado a mano','guantes de cabritilla','un sello de lacre personal'],
  mago: ['componentes de conjuro en viales','un diario con anotaciones arcanas','tiza para círculos rituales','una pluma que escribe sola frases sueltas','velas que arden con llama azul','un cristal para enfocar magia','huesos de animales etiquetados'],
  sacerdote: ['incienso sagrado','un símbolo sagrado de metal','agua bendita en un frasco','un libro de oraciones gastado','aceite de unción','cuentas de oración','una reliquia menor envuelta en lino'],
  bestia: ['huesos a medio roer','el brillo de algo tragado tiempo atrás','pelaje o escamas valiosas','un objeto de una víctima anterior','plumas o garras codiciadas'],
  nomuerto: ['jirones de ropa antigua','un anillo aún en un dedo huesudo','monedas de una era pasada','un medallón con un retrato borroso','polvo de tumba en una bolsita'],
  dragon: ['monedas de reinos desaparecidos','huesos de anteriores intrusos','un escudo abollado con un blasón','restos de armaduras fundidas','una gema escupida entre el tesoro'],
  gigante: ['un saco con ganado curado','un garrote tallado con marcas','collares de cráneos de presas','un cofre del tamaño de una persona','piedras preciosas usadas como canicas'],
};

export const LOOT_TRINKETS: string[] = [
  'una baratija: un dado que siempre cae en el mismo número (pero no es mágico)',
  'una baratija: un caracol de mar que susurra al acercarlo',
  'una baratija: el retrato de alguien que se te parece inquietantemente',
  'una baratija: una llave de cristal que se derrite al sol pero vuelve a formarse',
  'una baratija: un guante con seis dedos',
  'una baratija: una vela que nunca se consume pero tampoco da calor',
  'una baratija: una moneda de una nación que nadie reconoce',
  'una baratija: un diente demasiado grande para ser humano',
  'una baratija: un frasco con una nube de tormenta en miniatura',
  'una baratija: un anillo que tararea bajo la lluvia',
  'una baratija: un mapa de un lugar que no existe',
  'una baratija: una pluma que siempre apunta al norte... excepto los martes',
];

export const LOOT_MAGIC: Record<string, MagicItem[]> = {
  comun: [
    { name:'Poción de Curación', effect:'Recupera 2d4+2 PG al beberla (acción).' },
    { name:'Piedra de Sonido', effect:'Graba y reproduce un breve sonido al pulsarla.' },
    { name:'Vela de la Verdad', effect:'En su luz, mentir produce un sabor amargo en quien habla.' },
    { name:'Daga de Plata Bendecida', effect:'Cuenta como plateada contra criaturas vulnerables.' },
    { name:'Amuleto Cálido', effect:'Mantiene a quien lo lleva cómodo en climas fríos.' },
    { name:'Tiza Infinita', effect:'Nunca se gasta al escribir.' },
    { name:'Linterna Sin Llama', effect:'Emite luz tenue sin fuego, a voluntad.' },
  ],
  infrecuente: [
    { name:'Saco Devorador (menor)', effect:'Almacena objetos en un espacio extradimensional reducido.' },
    { name:'Botas Élficas', effect:'Tus pasos son silenciosos; ventaja en Sigilo al moverte.' },
    { name:'Capa Élfica', effect:'Desventaja para quienes intentan verte; ventaja en Sigilo.' },
    { name:'Anillo de Nadar', effect:'Velocidad de nado igual a la de caminar.' },
    { name:'Espada +1', effect:'+1 a tiradas de ataque y daño con esta arma.' },
    { name:'Varita de Misiles Mágicos', effect:'7 cargas; lanza proyectil mágico gastando cargas.' },
    { name:'Piedra Centinela', effect:'Da la alarma mental si algo cruza un umbral marcado.' },
  ],
  raro: [
    { name:'Armadura +1', effect:'+1 a la CA mientras la llevas puesta.' },
    { name:'Capa de Protección', effect:'+1 a CA y a tiradas de salvación.' },
    { name:'Bola de Cristal (menor)', effect:'Permite escudriñar lugares conocidos 1/día.' },
    { name:'Espada Flamígera', effect:'Arma +1 que inflige 2d6 de fuego adicional.' },
    { name:'Botas Aladas', effect:'Velocidad de vuelo durante un tiempo limitado al día.' },
    { name:'Amuleto de Salud', effect:'Tu Constitución pasa a ser 19.' },
  ],
  'muy-raro': [
    { name:'Manto del Espectro', effect:'Te vuelves invisible como acción durante varios turnos al día.' },
    { name:'Espada Vorpalina (menor)', effect:'Arma +2 que ignora resistencias al cortante.' },
    { name:'Anillo de Regeneración', effect:'Recuperas PG con el tiempo y regeneras miembros perdidos.' },
    { name:'Bastón de Poder', effect:'Arma +2 con cargas para varios conjuros poderosos.' },
  ],
  legendario: [
    { name:'Armadura de Placas Vil (legendaria)', effect:'+3 CA y aterra a tus enemigos cercanos.' },
    { name:'Espada Sagrada', effect:'Arma +3 radiante que ahuyenta a los muertos vivientes.' },
    { name:'Manto Estelar', effect:'Te otorga resistencia, vuelo y luz a voluntad.' },
    { name:'Orbe de los Dragones (fragmento)', effect:'Permite dominar la voluntad de un dragón con riesgo.' },
  ],
};
