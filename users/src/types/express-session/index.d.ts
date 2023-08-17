declare global {
	declare module 'express-session' {
		interface SessionData {
			user: {
				id: string
				firstName: string
				lastName: string
				phone: string
				email: string
				password: string
				isAccountActive: boolean
				isAccountVerified: boolean
				isAccountBlocked: boolean
				isAccountDeleted: boolean
				is2FAEnabled: boolean
				createdAt: Date
				updatedAt: Date
				deletedAt: Date | null
			}
			csrfToken: string
			otp?: {
				userId: string
				isConfirmedOtpCode: boolean
			}
			cookie: {
				sesID: string
				originalMaxAge: number
				secure: boolean
				httpOnly: boolean
				path: string
			}
		}
	}
}
