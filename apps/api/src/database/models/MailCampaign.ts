import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'MailCampaigns', timestamps: true })
export class MailCampaign extends Model<MailCampaign> {
  @Column({ type: DataType.STRING, allowNull: false })
  userNumber: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  subject: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  body: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  templateId: number;

  @Column({ type: DataType.JSON, allowNull: false, defaultValue: [] })
  listIds: number[];

  @Column({ type: DataType.STRING, defaultValue: 'draft' })
  status: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  sentCount: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  skippedCount: number;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  updatedAt: Date;
}
