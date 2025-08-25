import { V1_InitialScripts } from './V1_InitialScripts.service';
import { V2_CreateTables } from './V2_CreateTables.service';
// ------

export const Migration = Symbol('Migration');
export const stores: any[] = [
  { provide: Migration, useClass: V1_InitialScripts, multi: true },
  { provide: Migration, useClass: V2_CreateTables, multi: true },
  
];
