import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'user_entity' })
export class UserEntity {
  @PrimaryColumn({ name: 'reg_no', type: 'varchar' })
  regNo: string;

  @Column({ name: 'contact_no', type: 'varchar' })
  contactNo: string;

  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'f_name', type: 'varchar' })
  fName: string;

  @Column({ name: 'gender', type: 'varchar' })
  gender: string;

  @Column({ name: 'l_name', type: 'varchar' })
  lName: string;

  @Column({ name: 'password', type: 'varchar' })
  password: string;

  @Column({ name: 'role', type: 'varchar' })
  role: string;

  @Column({ name: 'state', type: 'tinyint', width: 1 })
  state: boolean;
}
