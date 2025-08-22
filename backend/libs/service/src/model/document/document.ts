import * as st from 'sequelize-typescript';
import { CommonModel } from '@palatine_whiteboard_backend/shared/src/sequelize/common-model';
import { SequelizeModule } from '@nestjs/sequelize';

@st.Table({
    tableName: 'documents',
    modelName: 'Document',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
})
export class Document extends CommonModel<Document> {
    @st.Column({
        type: st.DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare userUuid: string;

    @st.Column({
        type: st.DataType.BLOB,
        allowNull: false,
    })
    declare documentData: Buffer;

    @st.Column({
        type: st.DataType.INTEGER,
        defaultValue: 1,
    })
    declare version: number;
}

export const DocumentEntry = SequelizeModule.forFeature([Document]);
