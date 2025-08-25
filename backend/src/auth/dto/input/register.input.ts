import { ApiProperty } from '@nestjs/swagger';
import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';
import { constants } from '@palatine_whiteboard_backend/shared/src/config/constants';

@decorator.ajv.Schema({
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 30,
    },
  },
  required: ['email', 'password'],
})
export class RegisterInput {
  @ApiProperty()
  public email?: string;
  @ApiProperty()
  public password?: string;
}