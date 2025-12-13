import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
  
  @Entity('sweets')
  export class Sweet {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @Column()
    @IsNotEmpty()
    @IsString()
    category: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    @IsNumber()
    @Min(0)
    price: number;
  
    @Column({ type: 'int', default: 0 })
    @IsNumber()
    @Min(0)
    quantity: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }