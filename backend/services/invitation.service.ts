import { prisma } from "../database/prisma";
import { acceptInvitationRequest, invitationRequest, invitationStatus } from "../types/invitation";
import crypto from "node:crypto";
import { hashPassword } from "../utils/password";

export const sendInvitationService = async (invitationData: invitationRequest) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: invitationData.email },
        select: { id: true },
    });

    if (existingUser) {
        const existingMembership = await prisma.membership.findUnique({
            where: {
                userId_businessId: {
                    userId: existingUser.id,
                    businessId: invitationData.businessId,
                },
            },
        });

        if (existingMembership) {
            throw new Error("ALREADY_MEMBER");
        }
    }

    try {
        return await prisma.invitation.create({
            data: {
                email: invitationData.email,
                businessId: invitationData.businessId,
                role: invitationData.role,
                invitedById: invitationData.invitedById,
                tokenHash: invitationData.tokenHash,
                expiresAt: invitationData.expiresAt,
                status: 'pending'
            }
        });
    } catch (error) {
        if ((error as { code?: string }).code === "P2002") {
            throw new Error("INVITATION_ALREADY_PENDING");
        }

        throw error;
    }
};

const getValidInvitationByToken = async (token: string) => {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const invitation = await prisma.invitation.findUnique({
        where: { tokenHash },
    });

    if (!invitation || invitation.status !== "pending") {
        throw new Error("INVALID_INVITATION");
    }

    if (invitation.expiresAt < new Date()) {
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: "expired" },
        });
        throw new Error("INVITATION_EXPIRED");
    }

    return invitation;
};
export const acceptInvitationService = async ({
    token,
    name,
    password }
    : acceptInvitationRequest) => {
    const invitation = await getValidInvitationByToken(token);

    return prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({ where: { email: invitation.email } });

        if (!user) {
            if (!name || !password) {
                throw new Error("MISSING_SIGNUP_DETAILS");
            }
            const hashedPassword = await hashPassword(password);
            user = await tx.user.create({
                data: {
                    email: invitation.email,
                    name,
                    password: hashedPassword,
                    provider: "local",
                },
            });
        }

        const membership = await tx.membership.create({
            data: {
                userId: user.id,
                businessId: invitation.businessId,
                role: invitation.role,
            },
        });

        await tx.invitation.update({
            where: { id: invitation.id },
            data: { status: "accepted", acceptedAt: new Date() },
        });

        return { user, membership };
    });
};

export const declineInvitationService = async (token: string) => {
    const invitation = await getValidInvitationByToken(token);

    return prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "declined" },
    });
};
export const revokeInvitationService = async (invitationId: string, businessId: string) => {
    const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId },
    });
    if (!invitation) {
        throw new Error("INVITATION_NOT_FOUND");
    }
    if (invitation.businessId !== businessId) {
        throw new Error("UNAUTHORIZED");
    }
    return await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'revoked' }
    });
}
export const getInvitationsByBusinessIdService = async (businessId: string) => {
    return await prisma.invitation.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' }
    });
}
export const getInvitationsByEmailService = async (email: string) => {
    return await prisma.invitation.findMany({
        where: { email },
        orderBy: { createdAt: 'desc' }
    });
}
export const deleteInvitationService = async (invitationId: string) => {
    await prisma.invitation.delete({
        where: { id: invitationId }
    });
}