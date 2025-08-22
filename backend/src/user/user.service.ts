import { Injectable } from '@nestjs/common';
import * as st from '@nestjs/sequelize';

import { CommonService } from '@palatine_whiteboard_backend/shared/src/sequelize/common.service';
import { FilterService } from '@palatine_whiteboard_backend/shared/src/sequelize/filter.service';

import { User } from '@palatine_whiteboard_backend/service/src/model/user/user';
import { userDto } from '@palatine_whiteboard_backend/src/user/dto';
import { ConfigService } from '@palatine_whiteboard_backend/shared/src/config/config.service';
import { CryptoService } from '@palatine_whiteboard_backend/shared/src/crypto/crypto.service';
import { BearerUser } from './dto/output';

@Injectable()
export class UserService extends CommonService<
  User,
  userDto.inputs.CreateUserInput,
  userDto.inputs.FilterUserInput,
  userDto.inputs.UpdateUserInput,
  userDto.outputs.UserEntity
> {

  constructor(
    @st.InjectModel(User)
    private readonly userModel: typeof User,
    private readonly paginateService: FilterService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
    ) {
    super({ model: userModel, paginateService });
  }


  async getProfile(user: BearerUser) {
    return this.findOne({ uuid: user.userUuid, attributeMeta: { exclude: userDto.outputs.excludeFields } });
  }
  
  async create(inputDto: userDto.inputs.CreateUserInput) {
    const res = await super.create(inputDto);
    return this.findOne({ uuid: res.uuid, attributeMeta: { exclude: userDto.outputs.excludeFields } });
  }

  async update(filter: userDto.inputs.FilterUserInput, inputDto: userDto.inputs.UpdateUserInput) {
    await super.update(filter, inputDto);

    return this.findOne({ uuid: filter.uuid, attributeMeta: { exclude: userDto.outputs.excludeFields } });
  }


  async password(userDto: Partial<userDto.inputs.CreateUserInput>) {
    const secret = `${this.configService.get<string>('crypto.pbkdf2.secret')}`;
    if (!userDto.password) {
      return null;
    }

    const password = await this.cryptoService.hashPassword(userDto.password, secret);
    return { ...userDto, secret, password } as userDto.outputs.UserEntity;
  }
}
