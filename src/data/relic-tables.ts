// Extracted verbatim from arcanum-41.html (relic generation tables). Do not edit by hand.
export interface RLRandData {
  types: string[];
  rarities: string[];
  namePre: Record<string, string[]>;
  nameDe: string[];
  effectsByType: Record<string, string[]>;
  potions: string[];
  wonders: string[];
  subtle: string[];
  dmgTypes: string[];
  curses: string[];
}
export const RL_RARITY_NAMES: Record<string, string> = { comun:'Común', infrecuente:'Infrecuente', raro:'Raro', 'muy-raro':'Muy raro', legendario:'Legendario', artefacto:'Artefacto' };

export const RL_RAND: RLRandData = {
  types: ['Arma','Armadura','Escudo','Anillo','Varita','Vara','Bastón','Pergamino','Poción','Amuleto','Capa','Botas','Guantes','Objeto maravilloso'],
  rarities: ['comun','infrecuente','infrecuente','raro','raro','muy-raro','legendario'],
  namePre: {
    'Arma':['Espada','Hacha','Daga','Maza','Lanza','Estoque','Martillo','Guadaña'],
    'Armadura':['Coraza','Cota','Peto','Armadura','Loriga'],
    'Escudo':['Égida','Broquel','Escudo','Rodela'],
    'Anillo':['Anillo','Sello','Aro'],
    'Varita':['Varita','Vara corta'],
    'Vara':['Vara','Cetro'],
    'Bastón':['Bastón','Cayado'],
    'Pergamino':['Pergamino','Rollo'],
    'Poción':['Poción','Elixir','Filtro','Brebaje'],
    'Amuleto':['Amuleto','Medallón','Talismán','Colgante'],
    'Capa':['Capa','Manto','Capucha'],
    'Botas':['Botas','Sandalias','Grebas'],
    'Guantes':['Guantes','Guanteletes','Manoplas'],
    'Objeto maravilloso':['Orbe','Ídolo','Caja','Lente','Brújula','Espejo','Reloj','Llave','Tomo','Máscara'],
  },
  nameDe: ['del Dragón Durmiente','de las Almas Errantes','del Rey Olvidado','de Escarcha Eterna','de la Llama Voraz','del Susurro','de la Luna Rota','del Vacío','de Espinas','del Crepúsculo','de la Verdad','de Hierro Frío','de la Tormenta','del Lamento','de Ceniza','del Sol Negro','de la Marea','del Guardián','de los Nueve','de la Bruja','del Alba Sangrienta','de la Sombra Larga','del Pacto Roto','de la Última Hora','del Trueno Mudo','de la Sangre Pálida','del Exiliado','de la Corona Hundida','del Ojo Abierto','de la Noche Sin Estrellas','del Cuervo Blanco','de la Promesa Vacía','del Abismo','de la Mano Izquierda','del Invierno Eterno','de la Serpiente Dorada','del Silencio Profundo','de la Hoguera Fría','del Camino Perdido','de la Décima Puerta'],
  effectsByType: {
    'Arma': [
      'Recibes un +{b} a las tiradas de ataque y daño con esta arma mágica.',
      'Recibes un +{b} a ataque y daño. Cuando impactas, infliges {ed} de daño adicional de {et}.',
      'Recibes un +{b} a ataque y daño. Una vez por turno, al impactar, el objetivo hace salvación de Constitución (CD 15) o queda aturdido hasta el final de tu próximo turno.',
      'Recibes un +{b} a ataque y daño. Si reduces a una criatura a 0 PG, recuperas {ed} PG.',
      'Recibes un +{b} a ataque y daño. 1/día puedes invocar su poder: el objetivo impactado hace salvación de Destreza (CD 16) o sufre {ed} de daño de {et} adicional y queda derribado.',
      'Recibes un +{b} a ataque y daño. Cuando sacas un 20 natural, el objetivo sufre {ed} de daño de {et} adicional.',
    ],
    'Armadura': [
      'Recibes un +{b} a la CA mientras vistes esta armadura.',
      'Recibes un +{b} a la CA y resistencia a un tipo de daño elegido al sintonizar.',
      'Recibes un +{b} a la CA. Cuando una criatura te impacta cuerpo a cuerpo, sufre {ed} de daño de {et}.',
      'Recibes un +{b} a la CA y ventaja en salvaciones contra ser derribado o empujado.',
    ],
    'Escudo': [
      'Recibes un +{b} adicional a la CA mientras empuñas este escudo (además del bono normal).',
      'Recibes un +{b} adicional a la CA. 1/día, como reacción, puedes anular por completo el daño de un ataque que te impacte.',
    ],
    'Anillo': [
      'Mientras lo llevas, ganas resistencia a un tipo de daño elegido al sintonizar.',
      'Mientras lo llevas, puedes lanzar cierto conjuro 1/día sin gastar componentes.',
      'Mientras lo llevas, cuando una criatura te reduce PG, puedes usar tu reacción para devolverle {ed} de daño de {et}.',
      'Tiene {ch} cargas. Gasta cargas para alterar el resultado de una salvación tuya (1 carga = +2). Recupera 1d3 al amanecer.',
    ],
    'Varita': ['Tiene {ch} cargas. Gastando 1+ cargas lanzas un conjuro almacenado (a mayor carga, mayor nivel). Recupera 1d4+1 cargas al amanecer; si gastas la última, tira 1d20: con un 1 se desintegra.'],
    'Vara': ['Sirve como foco arcano y otorga +{b} a las tiradas de ataque de conjuro y a las CD de salvación de tus hechizos. Además, 1/día puedes recuperar un espacio de conjuro de nivel igual a {b}.'],
    'Bastón': ['Tiene {ch} cargas y permite lanzar varios conjuros gastando cargas (de 1 a 5 según el conjuro). Recupera 1d6+4 al amanecer; si llega a 0, tira 1d20: con un 1 se destruye liberando su energía ({ed} a todos en 3 m).'],
    'Pergamino': ['Contiene un conjuro que puede lanzarse una vez leyéndolo, sin gastar espacio. Si el conjuro supera tu nivel, haz una prueba de característica de lanzamiento (CD 10 + nivel del conjuro) o falla. Después, el pergamino se desvanece.'],
    'Poción': ['Al beberla (acción), obtienes su efecto: {potion}.'],
    'Amuleto': [
      'Mientras lo llevas y sintonizas, obtienes un beneficio constante: +{b} a todas las salvaciones.',
      'Mientras lo llevas y sintonizas, no puedes ser sorprendido y tienes ventaja contra ser asustado o hechizado.',
      'Mientras lo llevas, 1/día al caer a 0 PG quedas en cambio a 1 PG y emites una onda: las criaturas a 3 m sufren {ed} de daño de {et}.',
    ],
    'Capa': ['Mientras la llevas, ganas +{b} a la CA y a las salvaciones de Destreza, y puedes planear distancias cortas sin sufrir daño por caída.'],
    'Botas': ['Mientras las llevas, tu velocidad aumenta en 3 m, ignoras el terreno difícil y 1/día puedes teletransportarte hasta 9 m como acción adicional.'],
    'Guantes': ['Mientras los llevas y sintonizas, obtienes ventaja en pruebas de cierta característica y tus ataques desarmados infligen {ed} de daño de {et}.'],
    'Objeto maravilloso': [
      'Cuando lo activas (acción), libera su poder único: {wonder}.',
      'Mientras lo portas, irradia un efecto mágico sutil: {subtle}.',
      'Tiene {ch} cargas. Gasta 1 carga (acción) para: {wonder} Recupera 1d3 al amanecer.',
    ],
  },
  potions: ['recuperas 4d4+4 PG','ganas resistencia a todo el daño durante 1 minuto','puedes respirar bajo el agua y nadar 1 hora','aumentas tu Fuerza a 21 durante 1 hora','te vuelves invisible 1 hora o hasta que ataques','ganas vuelo (velocidad 18 m) durante 10 minutos','duplicas tu velocidad durante 1 minuto','ves en la oscuridad y detectas lo invisible durante 1 hora','reduces o aumentas tu tamaño durante 10 minutos','curas toda enfermedad y veneno al instante'],
  wonders: ['una ráfaga de energía que empuja 6 m a los enemigos cercanos (salvación de Fuerza CD 15).','una luz cegadora: las criaturas a 9 m hacen salvación de Constitución CD 15 o quedan cegadas 1 minuto.','un escudo de fuerza que te da +3 a la CA durante 1 minuto.','un breve salto temporal que te concede una acción adicional este turno.','una curación en cadena: tú y 2 aliados recuperáis 3d8 PG.','un domo de silencio y oscuridad de 6 m durante 1 minuto.','una invocación: un aliado espectral lucha a tu lado 1 minuto.'],
  subtle: ['siempre sabes qué hora es y hacia dónde está el norte.','los animales pequeños no te temen y te entienden.','tu voz puede oírse con claridad a 90 m si lo deseas.','no necesitas comer ni beber mientras lo lleves.','tus pasos no hacen ruido y no dejas rastro.','las plantas marchitas reviven a tu paso.'],
  dmgTypes: ['fuego','frío','relámpago','ácido','necrótico','radiante','psíquico','trueno','veneno','fuerza'],
  curses: ['','','','No puedes desprenderte de él sin un conjuro de remover maldición.','Atrae la mala suerte: 1/sesión, el DM puede convertir un éxito tuyo en fallo.','Susurra en tu mente y te exige sangre de vez en cuando (1d4 de daño necrótico al amanecer si no obedeces).','Cada vez que lo usas, hay un 10% de que atraiga a su antiguo dueño, que lo quiere de vuelta.','Te vuelve codicioso: debes superar una salvación de Sabiduría CD 13 para regalar o vender tesoro.'],
};
