import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MessageLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender: string;

  @Column()
  message: string;

  @Column()
  aiResponse: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
