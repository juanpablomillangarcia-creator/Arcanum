// Extracted verbatim from arcanum-41.html (spellforge generation tables). Do not edit by hand.
export interface SFRandData {
  schools: string[];
  classesBySchool: Record<string, string[]>;
  dmgTypes: Record<string, string[]>;
  names: { pre: string[]; de: string[] };
}
export interface SFEffects {
  [school: string]: {
    truco?: string[];
    bajo?: string[];
    medio?: string[];
    alto?: string[];
  };
}
export const SF_RAND: SFRandData = {
  schools: ['Abjuración','Adivinación','Conjuración','Encantamiento','Evocación','Ilusión','Nigromancia','Transmutación'],
  classesBySchool: {
    'Abjuración': ['Mago, clérigo','Mago','Paladín, clérigo','Brujo, mago'],
    'Adivinación': ['Mago, bardo','Clérigo, druida','Mago','Bardo, hechicero'],
    'Conjuración': ['Mago, hechicero','Druida, explorador','Brujo, mago','Clérigo'],
    'Encantamiento': ['Bardo, hechicero','Brujo, mago','Bardo','Mago, hechicero'],
    'Evocación': ['Mago, hechicero','Druida, clérigo','Mago','Hechicero, brujo'],
    'Ilusión': ['Mago, bardo','Hechicero, brujo','Mago','Bardo'],
    'Nigromancia': ['Mago, brujo','Clérigo','Mago','Brujo, hechicero'],
    'Transmutación': ['Mago, druida','Druida, clérigo','Mago, hechicero','Bardo'],
  },
  // tipos de daño plausibles por escuela
  dmgTypes: {
    'Evocación':['fuego','frío','relámpago','trueno','radiante','ácido'],
    'Nigromancia':['necrótico','necrótico','psíquico'],
    'Abjuración':['fuerza','radiante'],
    'Conjuración':['ácido','veneno','fuego','contundente'],
    'Encantamiento':['psíquico'],
    'Ilusión':['psíquico'],
    'Transmutación':['contundente','fuego','ácido'],
    'Adivinación':['psíquico','radiante'],
  },
  names: {
    pre: ['Llama','Sombra','Velo','Aliento','Garra','Susurro','Cadena','Espejo','Marca','Fauce','Lágrima','Mano','Ojo','Manto','Corona','Beso','Grito','Sello','Latido','Eco','Furia','Abrazo','Maldición','Don','Juicio','Plegaria','Tormenta','Hambre','Sed','Lanza'],
    de: ['del Juramento','de las Almas','del Vacío','de la Bruja','del Réquiem','de Escarcha','del Trueno','de los Olvidados','de la Luna','del Caído','de Espinas','del Abismo','de la Verdad','del Crepúsculo','de Hierro','de la Carne','del Sol Negro','de la Marea','del Lamento','de Ceniza','del Dragón','de la Tempestad','del Inframundo','de los Nueve','de la Estrella Rota','del Primer Fuego','de la Última Luz','del Hambre Antigua'],
  },
};

export const SF_DMG_BY_LEVEL: Record<number, string> = { 0:'1d10', 1:'2d8', 2:'3d8', 3:'5d8', 4:'6d8', 5:'8d8', 6:'10d8', 7:'12d8', 8:'14d8', 9:'18d8' };

export const SF_HEAL_BY_LEVEL: Record<number, string> = { 0:'1d4', 1:'1d8+3', 2:'2d8+5', 3:'3d8+8', 4:'4d8+12', 5:'6d8+18', 6:'8d8+24', 7:'10d8+30', 8:'12d8+40', 9:'15d8+60' };

export const SF_TEMPHP_BY_LEVEL: Record<number, string> = { 0:'5', 1:'8', 2:'13', 3:'20', 4:'28', 5:'40', 6:'55', 7:'70', 8:'90', 9:'120' };

export const SF_EFFECTS: SFEffects = {
  'Evocación': {
    truco: ['Lanzas un proyectil de energía contra una criatura a 18 m. Tirada de ataque de conjuro; si impacta, {dmg}.'],
    bajo: ['Una ráfaga estalla en un punto; cada criatura en un radio de {radio} hace salvación de {save}: recibe {dmg} o la mitad con éxito.','Lanzas un rayo contra una criatura visible: salvación de {save} o sufre {dmg}.'],
    medio: ['Una bola de energía detona en un punto a 45 m; en un radio de {radio}, salvación de {save}: {dmg}, mitad con éxito.','Una línea de {radio} brota de ti; salvación de {save} para mitad de {dmg}; los que fallan además quedan {cond} hasta el final de tu próximo turno.'],
    alto: ['Una devastadora descarga arrasa un radio de {radio}; cada criatura hace salvación de {save}: {dmg}, mitad con éxito. El terreno queda asolado durante {dur}.','Convocas una tormenta destructiva en un área de {radio} durante {dur}: al inicio de cada turno, salvación de {save} o {dmg} y derribo. Concentración.'],
  },
  'Nigromancia': {
    truco: ['Drenas vida de una criatura a 18 m: salvación de {save} o {dmg}, y recuperas la mitad (redondeando hacia abajo) en PG.'],
    bajo: ['Marchitas la vitalidad del objetivo: salvación de {save} o {dmg} necrótico y reduces su máximo de PG en la misma cantidad durante {dur}.'],
    medio: ['Liberas una oleada de muerte en un radio de {radio}: salvación de {save} o {dmg} necrótico; tú ganas {temphp} PG temporales por cada criatura afectada (máx. el doble de tu nivel).','Alzas a los caídos: hasta 3 cadáveres cercanos se levantan como esbirros bajo tu control durante {dur}.'],
    alto: ['Una palabra de muerte azota un radio de {radio}: salvación de {save} o {dmg} necrótico; las criaturas reducidas a 0 PG mueren y se alzan a tu servicio durante {dur}. Concentración.','Robas la fuerza vital del objetivo: salvación de {save} o {dmg}, queda {cond} durante {dur} y tú recuperas PG igual al daño infligido.'],
  },
  'Abjuración': {
    truco: ['Tejes una guarda momentánea: una criatura gana {temphp} PG temporales hasta el final de tu próximo turno.'],
    bajo: ['Creas una barrera sobre una criatura: gana {temphp} PG temporales y resistencia a {dtype} durante {dur}.'],
    medio: ['Erige una cúpula protectora de {radio}: los aliados dentro tienen +2 a la CA y a las salvaciones, y resistencia a {dtype} durante {dur}. Concentración.','Disipas la magia hostil del objetivo y lo blindas: anula un efecto activo y le da ventaja en salvaciones durante {dur}.'],
    alto: ['Levantas un santuario inexpugnable de {radio} durante {dur}: nada puede entrar por medios mágicos y los aliados dentro son inmunes a {cond} y resistentes a {dtype}.','Refractas toda agresión: la próxima vez que una criatura dañe a un protegido antes de {dur}, sufre {dmg} de rebote (salvación de {save} para la mitad).'],
  },
  'Encantamiento': {
    truco: ['Siembras una orden simple en la mente de una criatura a 18 m: salvación de {save} o se aparta de ti durante 1 turno.'],
    bajo: ['Doblegas la mente del objetivo: salvación de {save} o queda {cond} durante {dur}. Concentración.'],
    medio: ['Tu voluntad somete a hasta 2 criaturas en {radio}: salvación de {save} o quedan {cond} durante {dur}; repiten la salvación al recibir daño. Concentración.','Implantas una sugestión irresistible: salvación de {save} o el objetivo cumple una orden razonable durante {dur}.'],
    alto: ['Esclavizas la mente de las criaturas en {radio}: salvación de {save} con desventaja o quedan {cond} y obedecen tus órdenes durante {dur}. Concentración.','Aniquilas la cordura del objetivo: salvación de {save} o {dmg} psíquico y queda {cond} de forma indefinida hasta que se cure su mente.'],
  },
  'Ilusión': {
    truco: ['Creas un sonido o imagen menor que cabe en tu mano durante {dur}.'],
    bajo: ['Conjuras una ilusión convincente del tamaño de una sala durante {dur}; quien la examine hace prueba de Investigación contra tu CD.'],
    medio: ['Tejes una ilusión aterradora: las criaturas en {radio} hacen salvación de {save} o quedan {cond} durante {dur}. Concentración.','Te vuelves invisible junto a tus aliados cercanos durante {dur} o hasta que ataquéis. Concentración.'],
    alto: ['Construyes un reino ilusorio en {radio} durante {dur}: las criaturas atrapadas creen vivirlo de verdad; al sufrir la ilusión hacen salvación de {save} o {dmg} psíquico cada turno.','Una imagen letal cobra realidad para el objetivo: salvación de {save} o {dmg} psíquico y queda {cond}; si cree morir, cae a 0 PG.'],
  },
  'Conjuración': {
    truco: ['Invocas un objeto inofensivo que cabe en tu mano, o una llama/luz menor que persiste {dur}.'],
    bajo: ['Conjuras una nube o terreno mágico en {radio} que dificulta el paso durante {dur}; quien empiece su turno dentro hace salvación de {save} o {dmg}.'],
    medio: ['Invocas criaturas que luchan a tu lado durante {dur} (concentración): su poder total equivale a un desafío acorde a este nivel.','Creas una zona hostil de {radio} durante {dur}: las criaturas que entren o empiecen su turno dentro hacen salvación de {save} o {dmg}.'],
    alto: ['Abres una brecha que invoca a un poderoso aliado extraplanar durante {dur} (concentración); obedece si lo dominas.','Convocas una catástrofe localizada en {radio} durante {dur}: cada turno, salvación de {save} o {dmg} y un efecto adicional ({cond} o derribo).'],
  },
  'Transmutación': {
    truco: ['Alteras una propiedad menor de un objeto: color, olor, temperatura o un detalle cosmético durante {dur}.'],
    bajo: ['Mejoras a una criatura: gana ventaja en pruebas de cierta característica y +3 m de velocidad durante {dur}. Concentración.'],
    medio: ['Transformas a una criatura: salvación de {save} o cambia de forma/tamaño durante {dur}, alterando sus capacidades. Concentración.','Remodelas el terreno en {radio}: lo conviertes en otra sustancia (barro, piedra, hielo) durante {dur}, atrapando a quien falle salvación de {save}.'],
    alto: ['Reescribes la materia en {radio}: transmutas terreno y criaturas; las criaturas hacen salvación de {save} o son transformadas durante {dur} (concentración).','Concedes a un aliado un poder sobrehumano durante {dur}: velocidad doblada, ventaja en ataques y {temphp} PG temporales. Concentración.'],
  },
  'Adivinación': {
    truco: ['Percibes la presencia de cierto tipo de criatura u objeto en 9 m durante {dur}.'],
    bajo: ['Lees los pensamientos superficiales de una criatura cercana durante {dur} (concentración); puede resistir con salvación de {save}.'],
    medio: ['Obtienes una visión precisa de un lugar o criatura conocidos, o respuesta a una pregunta sobre el futuro inmediato.','Marcas a un enemigo: durante {dur} sabes dónde está, tienes ventaja en ataques contra él y no puede esconderse de ti. Concentración.'],
    alto: ['Tu mente abarca un radio de {radio}: percibes todo (criaturas ocultas, invisibles, intenciones) durante {dur}, y los enemigos tienen desventaja para engañarte. Concentración.','Atisbas múltiples futuros: durante {dur} puedes, una vez por turno, forzar a una criatura a repetir o anular una tirada.'],
  },
};

export const SF_RIDERS: Record<string, string[]> = {
  bajo: [
    'Además, el objetivo es empujado 3 m en línea recta.',
    'Si falla la salvación, queda derribado.',
    'El objetivo sufre desventaja en su próxima tirada de ataque.',
  ],
  medio: [
    'Las criaturas que fallen son empujadas {radio} y derribadas.',
    'Quien falle queda {cond} hasta el final de tu próximo turno.',
    'El área se vuelve terreno difícil durante {dur}.',
    'Una criatura que falle por 5 o más sufre {dmg} adicional.',
  ],
  alto: [
    'Las criaturas reducidas a 0 PG por este conjuro son desintegradas.',
    'Quien falle queda {cond} durante {dur} y no puede beneficiarse de curación mientras dure.',
    'El efecto se repite al inicio de cada uno de tus turnos mientras mantengas la concentración.',
    'Las criaturas que fallen por 5 o más sufren {dmg} adicional y son empujadas {radio}.',
  ],
};
