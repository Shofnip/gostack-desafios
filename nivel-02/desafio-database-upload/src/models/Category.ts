import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column('timestamp')
  created_at: Date;

  @Column('timestamp')
  updated_at: Date;
}

export default Category;
