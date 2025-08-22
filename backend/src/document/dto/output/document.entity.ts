import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';
import { CommonEntity } from '@palatine_whiteboard_backend/shared/src/sequelize/common-entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'CommonEntity',
  properties: {
    userUuid: {
      type: 'string',
      format: 'uuid',
    },
    documentData: {
      type: 'string',
    },
    version: {
      type: 'number',
    },
  },
})
export class DocumentEntity extends CommonEntity {
  declare userUuid?: string;

  declare documentData?: Buffer;

  declare version?: number;
}