import * as cv from 'class-validator';
import 'reflect-metadata';

const IsLongerThan = (
  property: string,
  validationOptions?: cv.ValidationOptions,
) => (object: {}, propertyName: string) => {
  cv.registerDecorator({
    name: 'isLongerThan',
    target: object.constructor,
    propertyName,
    constraints: [property],
    options: validationOptions,
    validator: {
      validate<V extends string | any[]>(
        value: V,
        args: cv.ValidationArguments,
      ) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        return (
          typeof value === 'string' &&
          typeof relatedValue === 'string' &&
          value.length > relatedValue.length
        );
      },
    },
  });
};

const withCreate = <C extends new (...args: any[]) => any>(Cls: C) => {
  return class Class extends Cls {
    static create = (props: InstanceType<C>): InstanceType<C> => {
      const c = new Cls();

      Object.entries(props).forEach(([key, value]) => {
        c[key] = value;
      });

      return c;
    };
  };
};

// @withCreate
class Post {
  title: string;

  @IsLongerThan('title', {
    message: 'Text must be longer than the title',
  })
  text: string;
}

// const p: Post = {
//   text: 'a',
//   title: 'ab',
// }

// const p = new Post();
// p.text = 'a'
// p.title = 'ab'

// @ts-ignore
// const p = Post.create({ text: 'a', title: 'ab' });

const PostWithCreate = withCreate(Post);

const p = PostWithCreate.create({
  text: 'a',
  title: 'ab',
});

const errors = cv.validateSync(p);

console.log(errors);
