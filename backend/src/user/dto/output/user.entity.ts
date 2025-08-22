import { ApiProperty } from '@nestjs/swagger';
import { CommonEntity } from '@palatine_whiteboard_backend/shared/src/sequelize/common-entity';
import { constants } from '@palatine_whiteboard_backend/shared/src/config/constants';
import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';
import { UUID } from '@palatine_whiteboard_backend/shared/src/sequelize/meta';
@decorator.ajv.Schema({
  type: 'object',
  $ref: 'CommonEntity',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 30,
      pattern: constants.PASSWORD_REGEXP,
    },
    secret: {
      type: 'string',
    },
  },
})
export class UserEntity extends CommonEntity {
  @ApiProperty({ required: false })
  declare email?: string;
  @ApiProperty({ required: false, readOnly: true })
  declare password?: string;
  @ApiProperty({ required: false, readOnly: true })
  declare secret?: string;
}

export class BearerUser {
  userUuid: UUID;
  authorization: string;
}
export const excludeFields = ['password', 'secret'];
