export class ApproveBlogDto {
    adminId: string; // Admin thực hiện approve
}

export class RejectBlogDto {
    adminId: string; // Admin thực hiện reject
    rejectionReason: string; // Lý do từ chối
}
