import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { MailList } from '../database/models/MailList';
import { MailSubscriber } from '../database/models/MailSubscriber';
import { MailListSubscriber } from '../database/models/MailListSubscriber';
import { MailTemplate } from '../database/models/MailTemplate';
import { MailCampaign } from '../database/models/MailCampaign';
import { MailDelivery } from '../database/models/MailDelivery';

@Injectable()
export class MailService {
  constructor(
    @InjectModel(MailList) private listModel: typeof MailList,
    @InjectModel(MailSubscriber) private subscriberModel: typeof MailSubscriber,
    @InjectModel(MailListSubscriber) private membershipModel: typeof MailListSubscriber,
    @InjectModel(MailTemplate) private templateModel: typeof MailTemplate,
    @InjectModel(MailCampaign) private campaignModel: typeof MailCampaign,
    @InjectModel(MailDelivery) private deliveryModel: typeof MailDelivery,
  ) {}

  private email(value: string) {
    return String(value || '').trim().toLowerCase();
  }

  private render(text: string, subscriber: { name: string; email: string }) {
    return String(text || '')
      .replace(/\{\{\s*\.Subscriber\.Name\s*\}\}/g, subscriber.name)
      .replace(/\{\{\s*\.Subscriber\.Email\s*\}\}/g, subscriber.email)
      .replace(/\{\{\s*name\s*\}\}/gi, subscriber.name)
      .replace(/\{\{\s*email\s*\}\}/gi, subscriber.email);
  }

  async getLists(userNumber: string) {
    const lists = await this.listModel.findAll({ where: { userNumber }, order: [['createdAt', 'DESC']] });
    const memberships = await this.membershipModel.findAll({
      where: { userNumber, status: 'confirmed' },
      attributes: ['listId'],
    });
    const counts = new Map<number, number>();
    for (const row of memberships) counts.set(row.listId, (counts.get(row.listId) || 0) + 1);
    return lists.map((list) => ({ ...list.toJSON(), subscriberCount: counts.get(list.id) || 0 }));
  }

  async createList(userNumber: string, data: any) {
    const name = String(data.name || '').trim();
    if (!name) throw new BadRequestException('List name is required');
    const tags = Array.isArray(data.tags)
      ? data.tags
      : String(data.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
    return this.listModel.create({
      userNumber,
      name,
      type: data.type === 'public' ? 'public' : 'private',
      optin: data.optin === 'double' ? 'double' : 'single',
      description: data.description || '',
      tags,
    });
  }

  async deleteList(userNumber: string, id: number) {
    const list = await this.listModel.findOne({ where: { id, userNumber } });
    if (!list) throw new NotFoundException('List not found');
    await this.membershipModel.destroy({ where: { listId: id, userNumber } });
    await list.destroy();
    return true;
  }

  async getSubscribers(userNumber: string, listId?: number) {
    const subscribers = await this.subscriberModel.findAll({
      where: { userNumber },
      order: [['createdAt', 'DESC']],
    });
    const memberships = await this.membershipModel.findAll({ where: { userNumber } });
    const bySubscriber = new Map<number, { listId: number; status: string }[]>();
    for (const row of memberships) {
      const current = bySubscriber.get(row.subscriberId) || [];
      current.push({ listId: row.listId, status: row.status });
      bySubscriber.set(row.subscriberId, current);
    }
    return subscribers
      .map((subscriber) => ({
        ...subscriber.toJSON(),
        lists: bySubscriber.get(subscriber.id) || [],
      }))
      .filter((subscriber) => !listId || subscriber.lists.some((item) => item.listId === Number(listId)));
  }

  async createSubscriber(userNumber: string, data: any) {
    const email = this.email(data.email);
    if (!email || !email.includes('@')) throw new BadRequestException('A valid email is required');
    const name = String(data.name || email.split('@')[0]).trim();
    let subscriber = await this.subscriberModel.findOne({ where: { userNumber, email } });
    if (!subscriber) {
      subscriber = await this.subscriberModel.create({
        userNumber,
        name,
        email,
        status: data.status === 'blocklisted' ? 'blocklisted' : 'enabled',
        attribs: data.attribs || {},
      });
    }
    const listIds = Array.isArray(data.listIds) ? data.listIds : data.listId ? [data.listId] : [];
    for (const listId of listIds) {
      await this.addToList(userNumber, Number(listId), subscriber.id);
    }
    return subscriber;
  }

  async importSubscribers(userNumber: string, data: { text: string; listId?: number }) {
    const lines = String(data.text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    let created = 0;
    let skipped = 0;
    for (const line of lines) {
      const [first, second] = line.split(',').map((part) => part.trim());
      const email = this.email(second && second.includes('@') ? second : first);
      const name = second && second.includes('@') ? first : email.split('@')[0];
      if (!email.includes('@')) {
        skipped += 1;
        continue;
      }
      const before = await this.subscriberModel.findOne({ where: { userNumber, email } });
      await this.createSubscriber(userNumber, { name, email, listId: data.listId });
      if (!before) created += 1;
    }
    return { created, skipped, total: lines.length };
  }

  async updateSubscriber(userNumber: string, id: number, data: any) {
    const subscriber = await this.subscriberModel.findOne({ where: { id, userNumber } });
    if (!subscriber) throw new NotFoundException('Subscriber not found');
    const updates: any = {};
    if (data.name) updates.name = String(data.name).trim();
    if (data.status === 'enabled' || data.status === 'blocklisted') updates.status = data.status;
    await subscriber.update(updates);
    return subscriber;
  }

  async deleteSubscriber(userNumber: string, id: number) {
    const subscriber = await this.subscriberModel.findOne({ where: { id, userNumber } });
    if (!subscriber) throw new NotFoundException('Subscriber not found');
    await this.membershipModel.destroy({ where: { subscriberId: id, userNumber } });
    await subscriber.destroy();
    return true;
  }

  async addToList(userNumber: string, listId: number, subscriberId: number) {
    const list = await this.listModel.findOne({ where: { id: listId, userNumber } });
    const subscriber = await this.subscriberModel.findOne({ where: { id: subscriberId, userNumber } });
    if (!list || !subscriber) throw new NotFoundException('List or subscriber not found');
    const existing = await this.membershipModel.findOne({ where: { userNumber, listId, subscriberId } });
    const status = list.optin === 'double' ? 'unconfirmed' : 'confirmed';
    if (existing) {
      if (existing.status === 'unsubscribed') await existing.update({ status });
      return existing;
    }
    return this.membershipModel.create({ userNumber, listId, subscriberId, status });
  }

  async removeFromList(userNumber: string, listId: number, subscriberId: number) {
    await this.membershipModel.destroy({ where: { userNumber, listId, subscriberId } });
    return true;
  }

  async confirmMembership(userNumber: string, listId: number, subscriberId: number) {
    const row = await this.membershipModel.findOne({ where: { userNumber, listId, subscriberId } });
    if (!row) throw new NotFoundException('Subscription not found');
    await row.update({ status: 'confirmed' });
    return row;
  }

  async getTemplates(userNumber: string) {
    return this.templateModel.findAll({ where: { userNumber }, order: [['createdAt', 'DESC']] });
  }

  async createTemplate(userNumber: string, data: any) {
    const name = String(data.name || '').trim();
    const subject = String(data.subject || '').trim();
    const body = String(data.body || '').trim();
    if (!name || !subject || !body) throw new BadRequestException('Template name, subject, and body are required');
    return this.templateModel.create({ userNumber, name, subject, body });
  }

  async deleteTemplate(userNumber: string, id: number) {
    const template = await this.templateModel.findOne({ where: { id, userNumber } });
    if (!template) throw new NotFoundException('Template not found');
    await template.destroy();
    return true;
  }

  async getCampaigns(userNumber: string) {
    return this.campaignModel.findAll({ where: { userNumber }, order: [['createdAt', 'DESC']] });
  }

  async createCampaign(userNumber: string, data: any) {
    const name = String(data.name || '').trim();
    let subject = String(data.subject || '').trim();
    let body = String(data.body || '').trim();
    const templateId = data.templateId ? Number(data.templateId) : null;
    if (templateId) {
      const template = await this.templateModel.findOne({ where: { id: templateId, userNumber } });
      if (!template) throw new NotFoundException('Template not found');
      subject = subject || template.subject;
      body = body || template.body;
    }
    const listIds = (Array.isArray(data.listIds) ? data.listIds : []).map(Number).filter(Boolean);
    if (!name || !subject || !body || listIds.length === 0) {
      throw new BadRequestException('Campaign name, subject, body, and at least one list are required');
    }
    const ownedLists = await this.listModel.findAll({ where: { userNumber, id: { [Op.in]: listIds } } });
    if (ownedLists.length !== listIds.length) throw new BadRequestException('One of the selected lists does not belong to this account');
    return this.campaignModel.create({
      userNumber,
      name,
      subject,
      body,
      templateId,
      listIds,
      status: 'draft',
      sentCount: 0,
      skippedCount: 0,
    });
  }

  async sendCampaign(userNumber: string, id: number) {
    const campaign = await this.campaignModel.findOne({ where: { id, userNumber } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status === 'finished') throw new BadRequestException('This campaign was already sent');

    const memberships = await this.membershipModel.findAll({
      where: { userNumber, listId: { [Op.in]: campaign.listIds || [] }, status: 'confirmed' },
    });
    const subscriberIds = [...new Set(memberships.map((row) => row.subscriberId))];
    const subscribers = subscriberIds.length
      ? await this.subscriberModel.findAll({ where: { userNumber, id: { [Op.in]: subscriberIds } } })
      : [];

    let sentCount = 0;
    let skippedCount = 0;
    const seen = new Set<string>();
    for (const subscriber of subscribers) {
      if (seen.has(subscriber.email)) continue;
      seen.add(subscriber.email);
      if (subscriber.status !== 'enabled') {
        skippedCount += 1;
        await this.deliveryModel.create({
          userNumber,
          campaignId: campaign.id,
          subscriberId: subscriber.id,
          email: subscriber.email,
          subject: campaign.subject,
          body: '',
          status: 'skipped',
        });
        continue;
      }
      const subject = this.render(campaign.subject, subscriber);
      const body = this.render(campaign.body, subscriber);
      await this.deliveryModel.create({
        userNumber,
        campaignId: campaign.id,
        subscriberId: subscriber.id,
        email: subscriber.email,
        subject,
        body,
        status: 'sent',
      });
      sentCount += 1;
    }

    await campaign.update({ status: 'finished', sentCount, skippedCount });
    return { campaign, sentCount, skippedCount };
  }

  async deleteCampaign(userNumber: string, id: number) {
    const campaign = await this.campaignModel.findOne({ where: { id, userNumber } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    await this.deliveryModel.destroy({ where: { campaignId: id, userNumber } });
    await campaign.destroy();
    return true;
  }

  async getDeliveries(userNumber: string, campaignId: number) {
    const campaign = await this.campaignModel.findOne({ where: { id: campaignId, userNumber } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return this.deliveryModel.findAll({ where: { userNumber, campaignId }, order: [['createdAt', 'DESC']] });
  }
}
