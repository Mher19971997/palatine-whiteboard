import { decorator } from '@palatine_whiteboard_backend/shared/src/decorator';
import { FilterInput } from '@palatine_whiteboard_backend/shared/src/sequelize/meta';
import { Util } from '@palatine_whiteboard_backend/shared/src/util/util';
import { UserEntity } from '@palatine_whiteboard_backend/src/user/dto/output/user.entity';

@decorator.ajv.Schema({
  type: 'object',
  $ref: 'UserEntity',
})
export class FilterUserInput extends Util.mixin<UserEntity, FilterInput>(UserEntity, FilterInput) {}
