import * as st from 'sequelize-typescript';
import { CommonModel } from '@palatine_whiteboard_backend/shared/src/sequelize/common-model';
import { SequelizeModule } from '@nestjs/sequelize';

@st.Table({
    tableName: 'images',
    modelName: 'Image',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
})
export class Image extends CommonModel<Image> {
    @st.Column({
        type: st.DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare userUuid: string;

    @st.Column({
        type: st.DataType.STRING,
        allowNull: false,
    })
    declare imageUrl: string;

    @st.Column({
        type: st.DataType.STRING,
        allowNull: false,
    })
    declare prompt: string;
}

export const ImageEntry = SequelizeModule.forFeature([Image]);
