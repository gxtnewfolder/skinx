import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const createPostSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const updatePostSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const postsQuerySchema: z.ZodObject<{
    tag: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
    page: z.ZodPipe<z.ZodDefault<z.ZodOptional<z.ZodString>>, z.ZodTransform<number, string>>;
    pageSize: z.ZodPipe<z.ZodDefault<z.ZodOptional<z.ZodString>>, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=schemas.d.ts.map