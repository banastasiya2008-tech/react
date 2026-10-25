import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('user_library')
@Unique(['userId', 'gameId'])
export class UserLibrary {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int' })
  userId!: number;

  @Column({ name: 'game_id', type: 'int' })
  gameId!: number;
}