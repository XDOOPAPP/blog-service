export class CreateBlogDto {
    userId: string; // User tạo blog
    title: string;
    slug: string;
    content: string;
    thumbnailUrl?: string; // Optional thumbnail
    images?: string[]; // Optional images array
    author?: string; // Tên hiển thị (nếu khác username)
    status?: 'draft' | 'pending'; // User chỉ có thể tạo draft hoặc submit (pending)
}

