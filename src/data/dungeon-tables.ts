// Extracted verbatim from arcanum-41.html (dungeon generation tables). Do not edit by hand.
export const DGN_NAME_PARTS: { pre: string[]; de: string[] } = {
  pre: ['Cripta','Caverna','Fortaleza','Santuario','Torre','Ruinas','Mina','Guarida','Pozo','Bóveda','Catacumbas','Templo','Laberinto','Ciudadela','Sepulcro','Abismo','Nido','Reducto','Mazmorra','Galería'],
  de: ['de las Sombras','del Lamento','de los Huesos','del Rey Caído','de la Llama Eterna','del Susurro','de la Luna Rota','del Ahogado','de Hierro','de los Olvidados','del Vacío','de la Espina','de la Bruma','del Crepúsculo','de la Sangre Seca','del Eco','de las Mil Puertas','del Trono Vacío','de la Carne','del Sol Negro'],
};

export const DGN_PREMISES: Record<string, string> = {
  mazmorra: 'Un complejo subterráneo de pasillos y celdas excavado con un propósito ya olvidado.',
  cueva: 'Una red natural de galerías húmedas que se hunde en la oscuridad de la tierra.',
  castillo: 'Una fortificación de piedra con murallas, patios y torres que vigilan los alrededores.',
  templo: 'Un lugar sagrado de cámaras solemnes, ahora profanado por algo que no debería estar aquí.',
  torre: 'Una torre vertical donde cada planta guarda los experimentos de su antiguo dueño.',
  ruinas: 'Los restos de una construcción colosal, medio tragados por el tiempo y la maleza.',
  mina: 'Túneles de extracción abandonados, con vagonetas oxidadas y vetas agotadas.',
  guarida: 'El cubil de una criatura, sembrado de huesos y los restos de sus presas.',
  campamento: 'Un asentamiento fortificado con empalizadas, tiendas y puestos de vigilancia.',
  bosque: 'Una extensión salvaje donde los senderos se pierden entre la espesura.',
  pantano: 'Un laberinto de agua estancada, islotes de barro y raíces traicioneras.',
  barco: 'Una embarcación a la deriva, con cubiertas inclinadas y bodegas anegadas.',
  plano: 'Un fragmento de realidad regido por un único elemento desbocado.',
  feywild: 'Un reflejo encantado del mundo donde la lógica obedece a otras reglas.',
  abismo: 'Un paisaje de tormento y fuego donde la propia tierra parece odiarte.',
  onirico: 'Un paisaje cambiante tejido con la sustancia de los sueños y las pesadillas.',
  astral: 'Un vacío plateado e infinito salpicado de islas de roca y pensamiento.',
};

export const DGN_ATMOS: Record<string, string[]> = {
  mazmorra: ['aire viciado y goteo constante en la penumbra','antorchas apagadas y olor a moho','silencio sepulcral roto por ecos lejanos'],
  cueva: ['humedad que cala los huesos y oscuridad absoluta','estalactitas que gotean en charcos negros','un viento subterráneo que aúlla en las galerías'],
  castillo: ['corrientes de aire por las almenas y banderas raídas','salones que un día fueron grandiosos, ahora polvorientos','el frío de la piedra y el eco de pasos en las escaleras'],
  templo: ['incienso rancio y vidrieras rotas','un silencio reverente que pone los pelos de punta','velas que arden solas ante altares profanados'],
  torre: ['olor a azufre y pergamino quemado','escaleras de caracol interminables','zumbido mágico que hace vibrar los dientes'],
  ruinas: ['maleza creciendo entre la piedra caída','luz que entra por techos derrumbados','el viento silbando entre columnas rotas'],
  mina: ['polvo de carbón flotando en el aire','crujidos de maderos a punto de ceder','oscuridad y el goteo de agua subterránea'],
  guarida: ['hedor a carroña y excrementos','huesos crujiendo bajo los pies','un calor animal y un gruñido lejano'],
  campamento: ['humo de hogueras y voces ásperas','el chasquido de las banderas al viento','olor a cuero, sudor y comida cocinándose'],
  bosque: ['cantos de aves invisibles y luz tamizada','el crujir de la hojarasca bajo cada paso','niebla baja que difumina los troncos'],
  pantano: ['hedor a vegetación podrida y gas de los pantanos','el croar incesante y el chapoteo de algo grande','niebla que se aferra a la piel'],
  barco: ['el crujido del casco y olor a salitre y brea','cubiertas inclinadas y agua entrando por las grietas','el gemido de la madera bajo el oleaje'],
  plano: ['el elemento dominante lo impregna todo, abrumador','colores y temperaturas imposibles para un mortal','la realidad vibra con energía pura'],
  feywild: ['colores demasiado vivos y una música que no tiene fuente','aromas embriagadores y risas lejanas','la sensación de ser observado por todo el bosque'],
  abismo: ['calor sofocante y un cielo del color de una herida','gritos lejanos y el olor a azufre','el suelo late como si estuviera vivo'],
  onirico: ['la geometría cambia cuando no miras directamente','recuerdos ajenos flotando como neblina','la gravedad y el tiempo son sugerencias'],
  astral: ['silencio absoluto y una luz plateada sin fuente','el pensamiento se manifiesta en el entorno','no hay arriba ni abajo, solo deriva'],
};

export const DGN_ROOM_NAMES: Record<string, string[]> = {
  entrada: ['Entrada','Vestíbulo','Umbral','Portón','Antesala','Atrio'],
  pasillo: ['Pasillo serpenteante','Galería larga','Corredor en penumbra','Pasaje estrecho','Crujía'],
  sala: ['Sala principal','Cámara central','Salón','Estancia amplia','Nave'],
  guardia: ['Puesto de guardia','Cuerpo de guardia','Sala de centinelas','Garita'],
  almacen: ['Almacén','Despensa','Depósito','Bodega','Trastero'],
  dormitorio: ['Dormitorios','Celdas','Aposentos','Barracón'],
  ritual: ['Cámara ritual','Sala de invocación','Altar','Santuario interior'],
  tesoro: ['Cámara del tesoro','Bóveda','Sala del botín','Reservado'],
  final: ['Sala del trono','Cámara final','Sanctasanctórum','Nido del señor','Corazón del lugar'],
  especial: ['Pozo profundo','Biblioteca olvidada','Sala inundada','Jardín interior','Foso','Puente sobre el abismo','Cámara de espejos','Laboratorio'],
};

export const DGN_ROOM_DESCS: Record<string, string[]> = {
  encuentro: ['Algo acecha aquí, listo para atacar a los intrusos.','Los habitantes del lugar montan guardia o descansan.','Un grupo hostil ha hecho de esta sala su territorio.'],
  trampa: ['Una trampa aguarda al incauto que no mire dónde pisa.','Mecanismos ocultos protegen este lugar de los ladrones.','El suelo, las paredes o el techo esconden un peligro mortal.'],
  tesoro: ['Aquí se guarda algo de valor, quizá vigilado.','Botín acumulado espera a quien se atreva a tomarlo.','Reliquias y riquezas se amontonan en la penumbra.'],
  acertijo: ['Un enigma o mecanismo bloquea el avance.','Algo aquí debe resolverse antes de poder continuar.','Una prueba de ingenio guarda el camino.'],
  vacio: ['Una sala silenciosa y aparentemente inofensiva... o eso parece.','Espacio vacío que invita a bajar la guardia.','Nada evidente, pero la quietud incomoda.'],
  pista: ['Una pista sobre la historia o el propósito del lugar.','Documentos, marcas o señales revelan algo importante.','Aquí se esconde una clave para entender el conjunto.'],
};

export const DGN_ROOM_DETAIL_FEATURES: string[] = ['un olor peculiar que delata lo que hubo aquí','marcas en el suelo que cuentan una historia','un objeto fuera de lugar que llama la atención','restos de un ocupante anterior','una salida secundaria poco evidente','un cambio de temperatura inexplicable','sonidos que parecen venir de las paredes','una inscripción medio borrada'];

export const DGN_ROOM_DETAIL_DANGERS: string[] = ['el techo amenaza con derrumbarse si hay ruido','el aire es tóxico tras unos minutos','algo vendrá si se demoran demasiado','el suelo cede bajo demasiado peso','una segunda oleada llega si suena la alarma'];

export const DGN_HAZARDS: string[] = [
  'El lugar se reconfigura: los pasillos no siempre llevan al mismo sitio, {{giro}}.',
  'Una niebla mágica drena las fuerzas de quien se demora; tras unos turnos exige una salvación de Constitución (CD 13) o sufres un nivel de cansancio.',
  'Lo derrotado vuelve a levantarse pasado un tiempo si no se destruye su origen en {{lugar}}.',
  'La oscuridad apaga las luces no mágicas y traga los sonidos; moverse a ciegas impone desventaja.',
  'Trampas mágicas se rearman solas tras desactivarse; detectarlas requiere una prueba de Investigación CD 15.',
  '{{ser}} vigila el lugar y avisa a los habitantes de cualquier intrusión, {{giro}}.',
  'El tiempo fluye distinto: cada hora dentro es un día fuera, {{giro}}.',
  'La estructura está viva y reacciona con hostilidad: ataques de oportunidad de las propias paredes (1d6 + tipo de daño según el lugar).',
  'Un campo mágico anula la teletransportación y dificulta los conjuros de invocación dentro de {{lugar}}.',
  'El suelo de ciertas salas cede bajo demasiado peso: salvación de Destreza CD 14 o caída de 3d6.',
];

export const DGN_REWARDS: string[] = [
  'El objeto que motivó la expedición aguarda en la cámara final, custodiado por {{ser}}.',
  'Un tesoro de generaciones con alguna pieza mágica entre el oro: {{cosa}}.',
  'Conocimiento prohibido: tomos y mapas que revelan que {{ser}} {{trama}}.',
  'Un cautivo que recompensará su rescate y sabe que {{ser}} {{trama}}.',
  'Una reliquia de gran poder latente, ligada a {{cosa}}.',
  'La cabeza del señor del lugar, por la que {{ser}} pagará muy bien.',
  'Un alijo oculto que contiene {{cosa}} y una pista sobre {{lugar}}.',
];

export const DGN_SECRETS: string[] = [
  'El verdadero amo del lugar es {{ser}}, no quien los intrusos creen.',
  'Existe un nivel inferior oculto que conecta con {{lugar}}.',
  'El lugar fue construido para sellar a {{ser}}, que sigue ahí dentro.',
  'Uno de los habitantes quiere traicionar a los demás, {{giro}}.',
  'La recompensa principal está vigilada por su legítimo dueño: {{ser}}.',
  'Hay otra salida que conecta con {{lugar}}, {{giro}}.',
  'Todo el lugar es en realidad {{cosa}} a gran escala.',
];

export const DGN_TYPE_NAMES: Record<string, string> = { mazmorra:'Mazmorra', cueva:'Cueva', castillo:'Castillo', templo:'Templo', torre:'Torre', ruinas:'Ruinas', mina:'Mina', guarida:'Guarida', campamento:'Campamento', bosque:'Zona salvaje', pantano:'Pantano', barco:'Navío', plano:'Plano elemental', feywild:'Reino feérico', abismo:'Abismo', onirico:'Reino onírico', astral:'Vacío astral' };

export const DGN_TAG_NAMES: Record<string, string> = { encuentro:'Encuentro', trampa:'Trampa', tesoro:'Tesoro', acertijo:'Acertijo', vacio:'Calma', pista:'Pista', jefe:'Jefe' };
