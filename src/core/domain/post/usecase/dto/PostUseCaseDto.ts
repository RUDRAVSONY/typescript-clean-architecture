import { PostStatus } from '../../../.shared/enum/PostEnums';
import { Nullable } from '../../../.shared/type/CommonTypes';
import { Exclude, Expose, plainToClass } from 'class-transformer';
import { Post } from '../../entity/Post';

@Exclude()
export class PostUseCaseDto {

  @Expose()
  public id: string;
  
  @Expose()
  public authorId: string;
  
  @Expose()
  public imageId: string;
  
  @Expose()
  public content: string;
  
  @Expose()
  public status: PostStatus;
  
  @Expose()
  public createdAt: Date;
  
  @Expose()
  public editedAt: Nullable<Date>;
  
  @Expose()
  public publishedAt: Nullable<Date>;
  
  public static newFromPost(post: Post): PostUseCaseDto {
    return plainToClass(PostUseCaseDto, post);
  }
  
  public static newListFromPosts(posts: Post[]): PostUseCaseDto[] {
    return posts.map(post => this.newFromPost(post));
  }
  
}