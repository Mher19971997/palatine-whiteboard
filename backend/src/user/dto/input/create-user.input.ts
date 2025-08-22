import { ApiProperty } from '@nestjs/swagger';
import { constants } from '@palatine_whiteboard_backend/shared/src/config/constants';
import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';
import { UserEntity } from '@palatine_whiteboard_backend/src/user/dto/output/user.entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'UserEntity',
  required: ['password'],
})
export class CreateUserInput extends UserEntity {
  @ApiProperty()
  declare email?: string;
  @ApiProperty({ required: false, readOnly: true })
  declare secret?: string;
  @ApiProperty({ required: true, pattern: constants.PASSWORD_REGEXP })
  declare password?: string;
}
