import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('admin/submissions')
@ApiBearerAuth()
@Controller('admin/submissions')
@UseGuards(AdminGuard)
export class SubmissionsAdminController {
  constructor(private submissions: SubmissionsService) {}

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 25,
    @Query('type') type?: string,
  ) {
    return this.submissions.findAll({ page: +page, limit: +limit, type });
  }

  @Patch(':id')
  setHandled(@Param('id') id: string, @Body() body: { handled: boolean }) {
    return this.submissions.setHandled(id, Boolean(body.handled));
  }
}
