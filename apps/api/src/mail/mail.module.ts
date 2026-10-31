import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailList } from '../database/models/MailList';
import { MailSubscriber } from '../database/models/MailSubscriber';
import { MailListSubscriber } from '../database/models/MailListSubscriber';
import { MailTemplate } from '../database/models/MailTemplate';
import { MailCampaign } from '../database/models/MailCampaign';
import { MailDelivery } from '../database/models/MailDelivery';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      MailList,
      MailSubscriber,
      MailListSubscriber,
      MailTemplate,
      MailCampaign,
      MailDelivery,
    ]),
  ],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
