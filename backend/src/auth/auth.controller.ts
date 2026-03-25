import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('send-auth-otp')
  async sendOtp(
    @Body('identifier') identifier: string,
    @Body('type') type: 'EMAIL' | 'MOBILE',
  ) {
    console.log(
      `[AuthController] send-auth-otp requested for: ${identifier} (${type})`,
    );
    return this.authService.sendOtp(identifier, type);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-auth-otp')
  async verifyOtp(
    @Body('identifier') identifier: string,
    @Body('code') code: string,
    @Body('type') type: 'EMAIL' | 'MOBILE',
  ) {
    console.log(
      `[AuthController] verify-auth-otp requested for: ${identifier}`,
    );
    return this.authService.verifyOtp(identifier, code, type);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('verify-password')
  async verifyPassword(
    @CurrentUser() user: any,
    @Body('password') password: string,
  ) {
    return this.authService.verifyPassword(user.id, password);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body('currentPassword') currentPass: string,
    @Body('newPassword') newPass: string,
  ) {
    return this.authService.changePassword(user.id, currentPass, newPass);
  }
}
