import { ApiProperty } from '@nestjs/swagger';
import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';

@decorator.ajv.Schema({
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
    },
    remember: {
      type: 'boolean',
    },
  },
  required: ['email', 'password'],
})
export class LoginInput {
  @ApiProperty()
  public email: string;
  @ApiProperty()
  public password: string;
  @ApiProperty()
  public remember: boolean;
}


@decorator.ajv.Schema({
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
    },
    remember: {
      type: 'boolean',
    },
  },
  required: ['email', 'password'],
})
export class LoginMobileInput {
  @ApiProperty()
  public email: string;
  @ApiProperty()
  public password: string;
  @ApiProperty()
  public remember: boolean;
}
