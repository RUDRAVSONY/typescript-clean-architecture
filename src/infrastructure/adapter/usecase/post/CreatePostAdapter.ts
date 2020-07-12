import { CreatePostPort } from '../../../../core/domain/post/port/usecase/CreatePostPort';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Exclude, Expose, plainToClass } from 'class-transformer';
import { UseCaseValidatableAdapter } from '../../../../core/domain/.shared/adapter/usecase/UseCaseValidatableAdapter';

@Exclude()
export class CreatePostAdapter extends UseCaseValidatableAdapter implements CreatePostPort {
  
  @Expose()
  @IsUUID()
  public executorId: string;
  
  @Expose()
  @IsString()
  public title: string;
  
  @Expose()
  @IsOptional()
  @IsUUID()
  public imageId?: string;
  
  @Expose()
  @IsOptional()
  @IsString()
  public content?: string;
  
  public static async new(payload: CreatePostPort): Promise<CreatePostAdapter> {
    const adapter: CreatePostAdapter = plainToClass(CreatePostAdapter, payload);
    await adapter.validate();
    
    return adapter;
  }
  
  public static async newFromRawPayload(rawPayload: Record<string, unknown>): Promise<CreatePostAdapter> {
    const adapter: CreatePostAdapter = plainToClass(CreatePostAdapter, rawPayload);
    await adapter.validate();
  
    return adapter;
  }
  
}