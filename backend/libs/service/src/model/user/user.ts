import { SequelizeModule } from '@nestjs/sequelize';
import * as st from 'sequelize-typescript';
import s from 'sequelize';
import { CommonModel } from '@palatine_whiteboard_backend/shared/src/sequelize/common-model';
import { UserEntity } from '@palatine_whiteboard_backend/src/user/dto/output/user.entity';

@st.Table({
  tableName: 'users',
  modelName: 'User',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt',
})
export class User extends CommonModel<UserEntity> {
  @st.Column({
    type: st.DataType.STRING,
    unique: true,
  })
  declare email: string;

  @st.Column({
    type: st.DataType.STRING,
  })
  declare name: string;

  @st.Column({
    type: st.DataType.STRING,
  })
  declare phone: string;

  @st.Column({
    type: st.DataType.STRING,
  })
  declare surname: string;

  @st.Column({
    type: st.DataType.STRING,
  })
  declare password: string;

  @st.Column({
    type: st.DataType.STRING,
  })
  declare secret: string;
}

export const UserEntry = SequelizeModule.forFeature([User]);
