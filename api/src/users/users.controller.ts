import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller()
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('admin/customers')
  @UseGuards(AdminGuard)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.users.findAll(+page, +limit, search);
  }

  @Get('admin/customers/:id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Patch('account/profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: { name?: string; phone?: string; image?: string },
  ) {
    return this.users.updateProfile(userId, data);
  }

  @Get('account/addresses')
  @UseGuards(JwtAuthGuard)
  getAddresses(@CurrentUser('id') userId: string) {
    return this.users.getAddresses(userId);
  }

  @Post('account/addresses')
  @UseGuards(JwtAuthGuard)
  addAddress(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.users.addAddress(userId, data);
  }

  @Patch('account/addresses/:id')
  @UseGuards(JwtAuthGuard)
  updateAddress(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() data: any,
  ) {
    return this.users.updateAddress(id, userId, data);
  }

  @Delete('account/addresses/:id')
  @UseGuards(JwtAuthGuard)
  deleteAddress(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.users.deleteAddress(id, userId);
  }
}
