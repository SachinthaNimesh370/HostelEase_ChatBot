import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('complain_entity')
export class ComplainEntity {
    @PrimaryGeneratedColumn({ name: 'complain_id' })
    complainId: number;

    @Column({ name: 'catagory', nullable: true })
    catagory: string;

    @Column({ name: 'content', nullable: true })
    content: string;

    @Column({ name: 'date', nullable: true })
    date: string;

    @Column({ name: 'status', nullable: true })
    status: string;

    @Column({ name: 'time', nullable: true })
    time: string;

    @Column({ name: 'student_id', nullable: true })
    studentId: string;

    @Column({ name: 'warden_id', nullable: true })
    wardenId: string;
}
