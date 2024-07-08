export interface ConceptsResponseStruct {
  data:    DataConceptsStruct[];
  success: boolean;
}

export interface DataConceptsStruct {
  pk:             number;
  titulo:         string;
  idConcepto:     number;
  pkPadre:        number;//idParent:       number;
  combinable:     number;
  formulario:     number;
  rol:            number;
  tipoMovimiento: number;
  activo:         number;
  gestora:        number;
  url:            string;
  costo:          number;
}
