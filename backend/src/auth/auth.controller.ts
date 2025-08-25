import * as c from '@nestjs/common';
import { AuthService } from '@palatine_whiteboard_backend/src/auth/auth.service';
import { authDto } from '@palatine_whiteboard_backend/src/auth/dto';
import { RolesGuard } from '@palatine_whiteboard_backend/src/auth/guards/roles.guard';

@c.Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @c.Post('login')
  async login(@c.Body() inputDto: authDto.inputs.LoginInput) {
    return this.authService.login(inputDto);
  }

  @c.Post('register')
  async register(@c.Body() inputDto: authDto.inputs.RegisterInput) {
    return this.authService.register(inputDto);
  }
}
