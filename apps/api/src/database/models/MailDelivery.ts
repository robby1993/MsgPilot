import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'MailDeliveries', timestamps: true })
export class MailDelivery extends Model<MailDelivery> {
  @Column({ type: DataType.STRING, allowNull: false })
  userNumber: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  campaignId: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  subscriberId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  subject: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  body: string;

  @Column({ type: DataType.STRING, defaultValue: 'sent' })
  status: string;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  updatedAt: Date;
}
