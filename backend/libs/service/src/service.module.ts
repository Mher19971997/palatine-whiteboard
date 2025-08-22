import { DynamicModule, Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@palatine_whiteboard_backend/shared/src/sequelize/sequelize.module';
import { ConfigModule } from '@palatine_whiteboard_backend/shared/src/config/config.module';
import { ModelModule } from '@palatine_whiteboard_backend/service/src/model/model.module';

@Global()
@Module({
  imports: [ModelModule]
})
export class ServiceModule {
  static register(): DynamicModule {
    const services = [ConfigModule, SequelizeModule, ModelModule];
    return {
      module: ServiceModule,
      imports: services,
      exports: services
    };
  }
}
