import 'reflect-metadata';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { IsNotEmpty, IsNumber, IsString, Min, IsOptional, IsUrl } from 'class-validator';
  
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
  
    @Column({ nullable: true })
    @IsOptional()
    @IsUrl({}, { message: 'Image URL must be a valid URL' })
    imageUrl?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }