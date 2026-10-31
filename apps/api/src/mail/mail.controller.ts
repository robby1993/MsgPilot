import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { TokenAuthGuard } from '../auth/guards/token-auth.guard';
import { MailService } from './mail.service';

@Controller('mail')
@UseGuards(TokenAuthGuard)
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('lists')
  async getLists(@Req() req: any) {
    return { message: 'Mailing lists fetched', result: await this.mailService.getLists(req.userNumber) };
  }

  @Post('lists')
  async createList(@Body() body: any, @Req() req: any) {
    return { message: 'Mailing list created', result: await this.mailService.createList(req.userNumber, body) };
  }

  @Delete('lists/:id')
  async deleteList(@Param('id') id: number, @Req() req: any) {
    await this.mailService.deleteList(req.userNumber, id);
    return { message: 'Mailing list deleted' };
  }

  @Post('lists/:id/subscribers')
  async addToList(@Param('id') id: number, @Body('subscriberId') subscriberId: number, @Req() req: any) {
    return { message: 'Subscriber added to list', result: await this.mailService.addToList(req.userNumber, id, subscriberId) };
  }

  @Post('lists/:id/subscribers/:subscriberId/confirm')
  async confirm(@Param('id') id: number, @Param('subscriberId') subscriberId: number, @Req() req: any) {
    return { message: 'Subscription confirmed', result: await this.mailService.confirmMembership(req.userNumber, id, subscriberId) };
  }

  @Delete('lists/:id/subscribers/:subscriberId')
  async removeFromList(@Param('id') id: number, @Param('subscriberId') subscriberId: number, @Req() req: any) {
    await this.mailService.removeFromList(req.userNumber, id, subscriberId);
    return { message: 'Subscriber removed from list' };
  }

  @Get('subscribers')
  async getSubscribers(@Query('listId') listId: string, @Req() req: any) {
    return { message: 'Subscribers fetched', result: await this.mailService.getSubscribers(req.userNumber, listId ? Number(listId) : undefined) };
  }

  @Post('subscribers/import')
  async importSubscribers(@Body() body: any, @Req() req: any) {
    return { message: 'Subscribers imported', result: await this.mailService.importSubscribers(req.userNumber, body) };
  }

  @Post('subscribers')
  async createSubscriber(@Body() body: any, @Req() req: any) {
    return { message: 'Subscriber created', result: await this.mailService.createSubscriber(req.userNumber, body) };
  }

  @Put('subscribers/:id')
  async updateSubscriber(@Param('id') id: number, @Body() body: any, @Req() req: any) {
    return { message: 'Subscriber updated', result: await this.mailService.updateSubscriber(req.userNumber, id, body) };
  }

  @Delete('subscribers/:id')
  async deleteSubscriber(@Param('id') id: number, @Req() req: any) {
    await this.mailService.deleteSubscriber(req.userNumber, id);
    return { message: 'Subscriber deleted' };
  }

  @Get('templates')
  async getTemplates(@Req() req: any) {
    return { message: 'Mail templates fetched', result: await this.mailService.getTemplates(req.userNumber) };
  }

  @Post('templates')
  async createTemplate(@Body() body: any, @Req() req: any) {
    return { message: 'Mail template created', result: await this.mailService.createTemplate(req.userNumber, body) };
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: number, @Req() req: any) {
    await this.mailService.deleteTemplate(req.userNumber, id);
    return { message: 'Mail template deleted' };
  }

  @Get('campaigns')
  async getCampaigns(@Req() req: any) {
    return { message: 'Mail campaigns fetched', result: await this.mailService.getCampaigns(req.userNumber) };
  }

  @Post('campaigns')
  async createCampaign(@Body() body: any, @Req() req: any) {
    return { message: 'Mail campaign created', result: await this.mailService.createCampaign(req.userNumber, body) };
  }

  @Post('campaigns/:id/send')
  async sendCampaign(@Param('id') id: number, @Req() req: any) {
    return { message: 'Campaign sent to confirmed subscribers', result: await this.mailService.sendCampaign(req.userNumber, id) };
  }

  @Get('campaigns/:id/deliveries')
  async deliveries(@Param('id') id: number, @Req() req: any) {
    return { message: 'Campaign deliveries fetched', result: await this.mailService.getDeliveries(req.userNumber, id) };
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: number, @Req() req: any) {
    await this.mailService.deleteCampaign(req.userNumber, id);
    return { message: 'Mail campaign deleted' };
  }
}
