import { sendEmail } from "../services/email.service"

type Invite = {
    to: string
    token: string
    inviter: string
}
export const sendInvitationEmail = async (data: Invite) => {
    const inviteUrl = `${process.env.CLIENT_URL}/accept-invitation?token=${data.token}`

    const html = `
        <p>You've been invited to join ForgeTrack</p>
        <p>Click the button below to accept invitation as a staff of ${data.inviter} inventory </p>
        <button><a href="${inviteUrl}">Accept Invitation</a></button>

        <p>This link expires in 7 days. If you didn't request this, you can ignore this email.</p>
    `

    await sendEmail(data.to, "Invitation to Inventeree", html)
}