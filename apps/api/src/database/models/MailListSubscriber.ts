import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'MailListSubscribers', timestamps: true })
export class MailListSubscriber extends Model<MailListSubscriber> {
  @Column({ type: DataType.STRING, allowNull: false })
  userNumber: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  listId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  subscriberId: number;

  @Column({ type: DataType.STRING, defaultValue: 'confirmed' })
  status: string;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  updatedAt: Date;
}
