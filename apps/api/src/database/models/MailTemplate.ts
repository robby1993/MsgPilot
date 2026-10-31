import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'MailTemplates', timestamps: true })
export class MailTemplate extends Model<MailTemplate> {
  @Column({ type: DataType.STRING, allowNull: false })
  userNumber: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  subject: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  body: string;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  updatedAt: Date;
}
