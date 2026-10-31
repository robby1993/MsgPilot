import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'MailSubscribers', timestamps: true })
export class MailSubscriber extends Model<MailSubscriber> {
  @Column({ type: DataType.STRING, allowNull: false })
  userNumber: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, defaultValue: 'enabled' })
  status: string;

  @Column({ type: DataType.JSON, allowNull: true, defaultValue: {} })
  attribs: Record<string, string>;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  updatedAt: Date;
}
