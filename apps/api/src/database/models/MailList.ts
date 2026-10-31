import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'MailLists', timestamps: true })
export class MailList extends Model<MailList> {
  @Column({ type: DataType.STRING, allowNull: false })
  userNumber: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, defaultValue: 'private' })
  type: string;

  @Column({ type: DataType.STRING, defaultValue: 'single' })
  optin: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.JSON, allowNull: true, defaultValue: [] })
  tags: string[];

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: DataType.NOW })
  updatedAt: Date;
}
