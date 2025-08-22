import { DocumentEntity } from "@palatine_whiteboard_backend/src/document/dto/output/document.entity"
import { Util } from '@palatine_whiteboard_backend/shared/src/util/util';
import { decorator } from "@palatine_whiteboard_backend/shared/src/decorator";
import { FilterInput } from "@palatine_whiteboard_backend/shared/src/sequelize/meta";

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'UserEntity',
})
export class FilterDocumentInput extends Util.mixin<DocumentEntity, FilterInput>(DocumentEntity, FilterInput) { }
