import { generateSecret, generateURI, verifySync } from 'otplib'
import QRCode from 'qrcode'
import type User from '#models/user'
import SecretCipher from '#services/settings/secret_cipher'
import { DateTime } from 'luxon'

const ISSUER = 'DestinationZM'

export default class MfaService {
  static generateSetup(user: User) {
    const secret = generateSecret()
    const otpauthUrl = generateURI({
      issuer: ISSUER,
      label: user.email,
      secret,
    })

    return { secret, otpauthUrl }
  }

  static async qrDataUrl(otpauthUrl: string) {
    return QRCode.toDataURL(otpauthUrl)
  }

  static verifySecret(secret: string, token: string) {
    return verifySync({ secret, token: token.trim() }).valid === true
  }

  static async enable(user: User, secret: string, token: string) {
    if (!this.verifySecret(secret, token)) {
      return false
    }

    user.mfaSecretEncrypted = SecretCipher.encrypt(secret)
    user.mfaEnabled = true
    user.mfaConfirmedAt = DateTime.now()
    await user.save()
    return true
  }

  static async verifyUser(user: User, token: string) {
    if (!user.mfaEnabled || !user.mfaSecretEncrypted) {
      return false
    }

    const secret = SecretCipher.decrypt(user.mfaSecretEncrypted)
    return this.verifySecret(secret, token)
  }

  static async disable(user: User, token: string) {
    if (!user.mfaEnabled) {
      return true
    }

    if (!(await this.verifyUser(user, token))) {
      return false
    }

    user.mfaEnabled = false
    user.mfaSecretEncrypted = null
    user.mfaConfirmedAt = null
    await user.save()
    return true
  }
}
