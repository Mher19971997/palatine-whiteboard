import { ApiProperty } from '@nestjs/swagger';
import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';
import { constants } from '@palatine_whiteboard_backend/shared/src/config/constants';

// @decorator.ajv.Schema({
//   type: 'object',
//   properties: {
//     email: {
//       type: 'string',
//       format: 'email',
//     },
//     phone: {
//       type: 'string',
//       phoneNumber: true,
//       minLength: 6,
//       maxLength: 30,
//     },
//     name: {
//       type: 'string',
//     },
//     surname: {
//       type: 'string',
//     },
//     city: {
//       type: 'string',
//     },
//     street: {
//       type: 'string',
//     },
//     bilding_number: {
//       type: 'string',
//     },
//     apartament_suite: {
//       type: 'string',
//     },
//     password: {
//       type: 'string',
//       minLength: 8,
//       maxLength: 30,
//       pattern: constants.PASSWORD_REGEXP,
//     },
//   },
//   required: ['email', 'phone', 'password'],
// })
export class RegisterInput {
  @ApiProperty()
  public email?: string;
  @ApiProperty()
  public password?: string;
}