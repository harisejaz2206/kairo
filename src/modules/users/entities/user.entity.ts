import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Placeholder entity — columns will grow as business requirements are defined.
 * Do NOT add columns speculatively; let migrations drive schema evolution.
 *
 * SnakeNamingStrategy (configured in DatabaseModule and ormconfig.ts) automatically
 * maps camelCase property names to snake_case column names:
 *   passwordHash  → password_hash
 *   createdAt     → created_at
 *   updatedAt     → updated_at
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 254 })
  email: string;

  @Column({ length: 100 })
  name: string;

  // Never store plain-text passwords — this field holds the bcrypt hash
  @Column({ select: false })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
