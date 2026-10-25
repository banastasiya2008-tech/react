import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import { User } from './User.js';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId!: number | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  genre!: string | null;

  @Column({ name: 'release_year', type: 'int', nullable: true })
  releaseYear!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  developer!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publisher!: string | null;

  
  @Column({ type: 'float', default: 0 })
  rating!: number;

  @Column({ type: 'json', nullable: true })
  platform!: string[] | null;

  @Column({ name: 'cover_image', type: 'text', nullable: true })
  coverImage!: string | null;

  @Column({ type: 'json', nullable: true })
  tags!: string[] | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'in_stock', type: 'boolean', default: true })
  inStock!: boolean;

  @Column({ type: 'float', default: 0 })
  price!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.games, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;
}