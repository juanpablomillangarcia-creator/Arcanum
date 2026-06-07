// Extracted verbatim from arcanum-41.html (ORACLE + 'more' extension). Do not edit by hand.
export interface OracleTable { id: string; icon: string; title: string; list?: string[]; gen?: () => string; }
export interface OracleData { odds: string; tables: OracleTable[]; }

const BASE: OracleData = {
  odds: 'even',
  tables: [
    { id:'hooks', icon:'✦', title:'Gancho de trama', list:[
      'Un mensajero llega exhausto: un noble ha desaparecido y su familia paga en oro.',
      'Una niña asegura que los muertos del cementerio le hablan por las noches.',
      'Un mapa cosido en el forro de un abrigo robado marca una cripta olvidada.',
      'El pozo del pueblo se secó de la noche a la mañana y el agua sabe a hierro.',
      'Una caravana no ha llegado; sus huellas se cortan en seco a mitad del camino.',
      'Un viejo enemigo del grupo aparece pidiendo, por primera vez, ayuda.',
      'Las campanas del templo repican solas a medianoche desde hace tres días.',
      'Alguien falsifica el sello del gremio y los precios se han desplomado.',
      'Un dragón joven exige un tributo semanal… o un rival peor tomará su lugar.',
      'Aparecen monedas de un reino que no existe desde hace siglos.',
      'El bosque creció cien metros en una noche y se tragó un molino.',
      'Un cadáver lleva en el bolsillo una carta dirigida a uno de los personajes.',
      'La luna no salió anoche. Nadie en la ciudad quiere hablar de ello.',
      'Un artefacto del museo susurra el nombre de quien lo mira demasiado tiempo.'
    ]},
    { id:'room', icon:'☗', title:'¿Qué hay en esta sala?', list:[
      'Polvo intacto salvo un rastro de pisadas húmedas que entra y no sale.',
      'Una estatua girada hacia la pared, como castigada.',
      'Restos de un banquete aún caliente, pero ni un alma.',
      'Un cofre cerrado… y la llave clavada en el techo.',
      'Símbolos de tiza que se reorganizan si no los miras.',
      'Un pozo seco del que sube aire frío y un olor dulzón.',
      'Cientos de velas a medio consumir, apagadas todas a la vez.',
      'Una jaula vacía con los barrotes doblados hacia afuera.',
      'Un espejo que refleja la sala vacía aunque haya gente delante.',
      'Mapas de la zona clavados en la pared, con un lugar tachado en rojo.',
      'Una trampilla mal disimulada bajo una alfombra empapada.',
      'Huesos ordenados con cuidado inquietante, formando una flecha.',
      'Una mesa con tres sillas; en una, ropa doblada y aún tibia.'
    ]},
    { id:'twist', icon:'↯', title:'Complicación / giro', list:[
      'Lo que buscaban ya no está: alguien se les ha adelantado.',
      'Un aliado resulta tener una agenda propia y opuesta.',
      'La salida por la que entraron ya no está donde debería.',
      'Un personaje reconoce a alguien de una vida que creía olvidada.',
      'El objetivo está vivo, pero no quiere ser rescatado.',
      'Una facción inesperada irrumpe reclamando lo mismo que el grupo.',
      'El tiempo apremia: algo va a ocurrir en pocos minutos.',
      'El precio del éxito es traicionar a quien confía en ellos.',
      'Lo que parecía un monstruo es una víctima; el culpable observa.',
      'Una vieja promesa vuelve a cobrarse justo ahora.',
      'Hay un testigo que lo ha visto todo y está a punto de hablar.',
      'El terreno cambia: fuego, inundación o derrumbe inminente.'
    ]},
    { id:'rumor', icon:'☉', title:'Rumor de taberna', list:[
      'Dicen que el alcalde no proyecta sombra desde el invierno.',
      'Alguien pagó por entrar a las catacumbas y no ha vuelto a salir.',
      'El herrero forja de noche algo que nadie le ha encargado.',
      'Una bruja del pantano cambia secretos por recuerdos.',
      'El barco hundido frente a la costa se enciende algunas noches.',
      'Los lobos ya no atacan al ganado: rodean la casa del molinero.',
      'Una posada del camino sirve tu plato favorito antes de que lo pidas.',
      'El hijo del conde fue visto mendigando en otra ciudad.',
      'Quien duerme bajo el viejo roble sueña el mismo sueño que los demás.',
      'Hay un mapa en venta que solo es legible bajo la luna llena.',
      'El sacerdote nuevo no come, no bebe y no parpadea.'
    ]},
    { id:'reaction', icon:'☻', title:'Reacción del PNJ', list:[
      'Hostil: busca pelea o llama a la guardia.',
      'Receloso: cortante, quiere que se marchen.',
      'Indiferente: ni ayuda ni estorba, va a lo suyo.',
      'Curioso: hace preguntas antes de decidir.',
      'Cordial: dispuesto a hablar y a un pequeño favor.',
      'Servicial: ofrece ayuda o información útil.',
      'Entusiasta: se vuelca… quizá demasiado.'
    ]},
    { id:'weather', icon:'☂', title:'Clima y ambiente', list:[
      'Cielo plomizo; la lluvia llegará al anochecer.',
      'Niebla espesa: visibilidad de pocos metros.',
      'Viento racheado que arranca tejas y apaga antorchas.',
      'Calor seco y polvo; las gargantas piden agua.',
      'Tormenta eléctrica en el horizonte, acercándose.',
      'Llovizna fina y constante que cala los huesos.',
      'Cielo despejado y frío cortante; escarcha al amanecer.',
      'Bochorno opresivo; los insectos no dan tregua.',
      'Primera nevada de la estación, silenciosa.',
      'Arcoíris doble tras la lluvia y un olor a ozono que no encaja.'
    ]},
    { id:'quirk', icon:'☉', title:'Rasgo de PNJ', list:[
      'Repite la última palabra de quien le habla.',
      'No puede mentir, pero omite con maestría.',
      'Colecciona algo absurdo: dientes, botones, nombres.',
      'Habla de sí mismo en tercera persona.',
      'Le falta un dedo y lo señala todo con el muñón.',
      'Siempre tiene hambre y comparte comida con todos.',
      'Tararea una nana antigua cuando se pone nervioso.',
      'Desconfía de cualquiera que lleve sombrero.',
      'Guarda un secreto que se muere por contar.',
      'Cuenta el dinero dos veces, siempre.',
      'Jura por un dios que nadie más conoce.'
    ]},
    { id:'name', icon:'✒', title:'Nombre rápido', gen:function(){
      const A=['Bran','Cor','Eld','Fen','Gor','Hal','Kar','Mor','Syl','Tor','Vel','Wyn','Aer','Dra','Theo','Ulf','Bal','Cael','Rho','Ny','Iss','Vor'];
      const B=['wyn','dor','mir','ric','gar','thas','vell','rin','mund','dis','ara','oth','wen','drak','las','beth','gorn','iel','und','sira'];
      const T=['el Tuerto','la Sombría','de Valle Hondo','Mano de Hierro','el Errante','la Sin Nombre','de los Tres Ríos','Lengua de Plata','el Pálido','de la Última Puerta'];
      const r=(a: string[])=>a[Math.floor(Math.random()*a.length)];
      const n=r(A)+r(B);
      return Math.random()<0.5 ? n+' '+r(T) : n;
    }}
  ]
};

const MORE: Record<string, string[]> = {
    hooks: [
      'Un cuervo deja caer a tus pies un anillo con un escudo de armas desconocido.',
      'Tres aldeas distintas reclaman el mismo cadáver como su héroe desaparecido.',
      'El río ha empezado a correr hacia su nacimiento.',
      'Un niño dibuja con tiza el plano exacto de una mazmorra que nadie ha visto.',
      'Aparece un cartel de «se busca» con la cara de un personaje… firmado por él mismo.',
      'Las cosechas crecen al triple, pero la fruta sabe a sangre.',
      'Un mercader vende mapas del más allá y jura haber vuelto.',
      'Cada espejo del pueblo se ha agrietado a la misma hora.',
      'Una orden de caballeros pide ayuda para enterrar a su propio dragón.',
      'Los perros del pueblo han dejado de ladrar y miran todos al norte.',
      'Un preso ofrece un secreto que vale un reino a cambio de su libertad.',
      'La nieve cae caliente y huele a incienso.',
      'Un faro lleva tres noches encendido… pero hace años que está en ruinas.',
      'Alguien ha robado todas las campanas de la comarca.',
      'Una estatua del rey suda gotas de oro de verdad.',
      'Un bardo canta el final de la aventura antes de que empiece.',
      'El bosque devuelve a los perdidos: regresan sin haber envejecido.',
      'Una carta sin remitente cita al grupo en un lugar que aún no existe.',
      'Un mendigo paga su comida con monedas de un metal que nadie sabe nombrar.',
      'Salen dos lunas esta noche; los astrónomos no saben cuál es la falsa.',
      'Un templo abandonado vuelve a tener velas encendidas cada amanecer.',
      'Una caravana de mercaderes viaja sin conductor y sin caballos.',
    ],
    room: [
      'Una puerta pintada en la pared, con pomo de verdad.',
      'El suelo cubierto de pétalos frescos en una sala sellada hace siglos.',
      'Un reloj de arena gigante, aún cayendo, sin que nadie lo haya girado.',
      'Marcas de uñas en el techo, demasiado altas para alcanzarlas.',
      'Una biblioteca cuyos libros están todos en blanco salvo uno.',
      'Un charco que refleja un cielo distinto al de fuera.',
      'Sillas en círculo, todas miradas hacia una vacía.',
      'Un brasero encendido sin combustible ni humo.',
      'Decenas de zapatos emparejados junto a la pared, sin dueños.',
      'Una tela cubre algo del tamaño de una persona; respira despacio.',
      'Las paredes están calientes al tacto, como piel.',
      'Un mural que muestra al grupo entrando en esta misma sala.',
      'Agua que gotea hacia arriba.',
      'Un nido enorme hecho de armas oxidadas.',
      'Velas que se reencienden solas en cuanto las apagas.',
      'Una escalera que baja… y devuelve a la misma sala.',
      'El eco repite tus palabras un segundo tarde y cambiadas.',
      'Una colección de máscaras, con un hueco vacío y un nombre debajo.',
      'Un pozo de monedas, todas con una cara que no reconoces.',
      'Plumas negras cayendo del techo sin parar.',
    ],
    twist: [
      'El mapa que seguían lo dibujó su enemigo, a propósito.',
      'La recompensa prometida ya se pagó… a otro grupo.',
      'Quien les contrató ha muerto mientras estaban fuera.',
      'El monstruo habla, y dice la verdad.',
      'Uno de los rehenes es el verdadero objetivo, y lo saben.',
      'La puerta solo se abre desde el otro lado, y no hay otro lado.',
      'Han traído sin querer aquello de lo que huían.',
      'Su victoria libera algo peor.',
      'El villano se rinde antes de luchar y pide asilo.',
      'Una tormenta los deja atrapados con quien menos querían.',
      'El tesoro está maldito y ya lo han tocado.',
      'Llega refuerzo… para el bando equivocado.',
      'Lo que creían una ruina está habitado: ellos son los intrusos.',
      'Un personaje recibe justo lo que deseaba, con un precio oculto.',
      'El plan funciona demasiado bien, y eso levanta sospechas.',
      'El guía conoce un atajo que pasa por su mayor miedo.',
    ],
    rumor: [
      'Bajo la posada vieja hay una puerta que no da a ningún sitio.',
      'El recaudador de impuestos no se refleja en el agua.',
      'Una anciana del mercado predice muertes y nunca falla.',
      'En el cruce del ahorcado, los caballos se niegan a parar.',
      'El noble del castillo paga en oro por sueños ajenos.',
      'Hay un pozo que devuelve más de lo que se echa.',
      'Los gemelos del molino comparten heridas que no se hacen.',
      'Cada año desaparece un niño la misma noche, y nadie lo recuerda.',
      'Un soldado volvió de la guerra hablando un idioma que no existe.',
      'La campana de la iglesia tañe sola por los que van a morir.',
      'Dicen que el rey lleva un año sin quitarse los guantes.',
      'En la feria hay un puesto que solo aparece para quien no lo busca.',
      'El herborista cura cualquier mal salvo el suyo propio.',
    ],
    reaction: [
      'Calculador: ayuda solo si ve un beneficio claro.',
      'Temeroso: coopera por miedo, no por voluntad.',
      'Burlón: colabora, pero no se toma nada en serio.',
      'Admirado: ve en el grupo algo que querría ser.',
    ],
    weather: [
      'Cielo verdoso y quietud absoluta: algo grande se acerca.',
      'Granizo del tamaño de puños.',
      'Una niebla que apaga los sonidos además de la vista.',
      'Lluvia tibia que deja la piel pegajosa.',
      'Aurora extraña de día, sin sol a la vista.',
      'Viento del sur que trae olor a mar donde no hay mar.',
      'Tormenta seca: rayos sin una gota de lluvia.',
      'Frío repentino que congela los charcos en minutos.',
      'Calima de polvo rojo que tiñe el cielo.',
      'Calma asfixiante; ni una hoja se mueve.',
    ],
    quirk: [
      'Termina todas sus frases como si fueran preguntas.',
      'Le habla a un objeto como si fuera su consejero.',
      'Nunca da la espalda a una puerta.',
      'Cambia de acento sin darse cuenta.',
      'Insiste en pagar siempre, aunque no tenga dinero.',
      'Olisquea a la gente al saludar.',
      'Lo apunta todo en un cuaderno minúsculo.',
      'Se ríe cuando está nervioso, en el peor momento.',
      'Suelta refranes que se inventa sobre la marcha.',
      'Nunca pisa las juntas de los adoquines.',
      'Guarda comida en los bolsillos «por si acaso».',
      'Trata a los animales con más respeto que a las personas.',
    ],
  };

BASE.tables.forEach((t) => {
  const extra = MORE[t.id];
  if (extra && Array.isArray(t.list)) t.list = t.list.concat(extra);
});

export const ORACLE = BASE;

