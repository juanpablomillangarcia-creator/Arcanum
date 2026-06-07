// Combat conditions — ported from arcanum-41.html (TRK_CONDITIONS / CONDITIONS_INFO, ~line 35304).

export const TRK_CONDITIONS = [
  "Agarrado", "Apresado", "Asustado", "Aturdido", "Cegado", "Derribado",
  "Ensordecido", "Envenenado", "Hechizado", "Incapacitado", "Inconsciente",
  "Invisible", "Paralizado", "Petrificado", "Ralentizado", "Sangrando",
] as const;

export type Condition = (typeof TRK_CONDITIONS)[number];

export const CONDITIONS_INFO: Record<string, string> = {
  Agarrado: "Velocidad 0; no se beneficia de bonificadores a la velocidad. Termina si el que agarra queda incapacitado o si un efecto lo aleja.",
  Apresado: "Velocidad 0. Los ataques contra él tienen ventaja y los suyos, desventaja. Desventaja en salvaciones de Destreza.",
  Asustado: "Desventaja en pruebas y ataques mientras vea la fuente del miedo. No puede acercarse voluntariamente a ella.",
  Aturdido: "Incapacitado; no puede moverse y habla con dificultad. Falla salvaciones de Fuerza y Destreza. Los ataques contra él tienen ventaja.",
  Cegado: "No ve y falla cualquier prueba que requiera vista. Sus ataques tienen desventaja; los ataques contra él, ventaja.",
  Derribado: "Solo puede arrastrarse (o levantarse). Desventaja en sus ataques. Ataques cuerpo a cuerpo contra él con ventaja; a distancia, con desventaja.",
  Ensordecido: "No oye y falla cualquier prueba que requiera oído.",
  Envenenado: "Desventaja en las tiradas de ataque y en las pruebas de característica.",
  Hechizado: "No puede atacar al hechizador ni elegirlo como objetivo de efectos dañinos. El hechizador tiene ventaja en interacciones sociales con él.",
  Incapacitado: "No puede realizar acciones ni reacciones.",
  Inconsciente: "Incapacitado, no se mueve ni habla y suelta lo que sostiene; cae derribado. Falla salvaciones de FUE y DES. Ataques con ventaja; los impactos cuerpo a cuerpo a 1,5 m son críticos.",
  Invisible: "No puede verse sin magia o sentido especial; cuenta como muy oscurecido para esconderse. Sus ataques con ventaja; los ataques contra él, con desventaja.",
  Paralizado: "Incapacitado, no se mueve ni habla. Falla salvaciones de FUE y DES. Ataques con ventaja; los impactos cuerpo a cuerpo a 1,5 m son críticos.",
  Petrificado: "Transformado en materia sólida (peso ×10); no envejece. Incapacitado y sin percibir el entorno. Ataques con ventaja; falla salvaciones de FUE y DES; resistencia a todo el daño; inmune a veneno y enfermedad.",
  Ralentizado: "Efecto del conjuro Ralentizar: velocidad a la mitad, −2 a la CA y a salvaciones de Destreza, sin reacciones y solo una acción o una acción adicional por turno.",
  Sangrando: "Marcador de herida sangrante (homebrew): pierde unos PG al inicio de cada turno hasta recibir curación o superar una salvación que decidas.",
};
