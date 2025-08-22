import { decorator } from "@palatine_whiteboard_backend/shared/src/decorator";
import { DocumentEntity } from "@palatine_whiteboard_backend/src/document/dto/output/document.entity"

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'DocumentEntity',
})
export class CreateDocumentInput extends DocumentEntity { }
